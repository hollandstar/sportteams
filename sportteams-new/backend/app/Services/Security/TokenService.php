<?php

namespace App\Services\Security;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class TokenService
{
    private $signingKey;
    private $encryptionKey;
    private $redis;
    
    public function __construct()
    {
        $this->signingKey = base64_decode(env('JWT_SIGNING_KEY'));
        $this->encryptionKey = base64_decode(env('JWT_ENCRYPTION_KEY'));
        
        // For now, use file-based cache since Redis isn't configured
        $this->redis = app('cache.store');
    }
    
    public function createToken(array $payload): string
    {
        $now = time();
        $payload = array_merge($payload, [
            'iat' => $now,                    // Issued at
            'exp' => $now + 3600,             // Expires in 1 hour
            'nbf' => $now - 30,               // Not before (30s clock skew)
            'jti' => bin2hex(random_bytes(16)), // Unique token ID
            'aud' => env('APP_URL'),          // Audience
            'iss' => env('APP_URL'),          // Issuer
        ]);
        
        // Step 1: Create and sign JWT
        $jwt = JWT::encode($payload, $this->signingKey, 'HS256');
        
        // Step 2: Encrypt the JWT (JWE)
        $encryptedJwt = $this->encryptToken($jwt);
        
        // Step 3: Store token hash for revocation checking
        $this->storeTokenHash($payload['jti'], $payload['exp']);
        
        return $encryptedJwt;
    }
    
    public function validateToken(string $encryptedToken): ?array
    {
        try {
            // Step 1: Decrypt
            $jwt = $this->decryptToken($encryptedToken);
            
            // Step 2: Verify and decode
            $payload = JWT::decode($jwt, new Key($this->signingKey, 'HS256'));
            
            // Step 3: Check if token is revoked
            if ($this->isTokenRevoked($payload->jti)) {
                throw new \Exception('Token has been revoked');
            }
            
            // Step 4: Additional security checks
            $this->performSecurityChecks($payload);
            
            return (array)$payload;
            
        } catch (\Exception $e) {
            // Log security event
            Log::warning('Token validation failed', [
                'error' => $e->getMessage(),
                'token_preview' => substr($encryptedToken, 0, 20) . '...'
            ]);
            return null;
        }
    }
    
    public function createRefreshToken(int $userId): string
    {
        $refreshPayload = [
            'user_id' => $userId,
            'type' => 'refresh',
            'exp' => time() + (30 * 24 * 3600), // 30 days
            'jti' => bin2hex(random_bytes(32))
        ];
        
        // Store refresh token in database
        $pdo = $this->getDbConnection();
        $stmt = $pdo->prepare("
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ");
        
        $stmt->execute([
            $userId,
            hash('sha256', $refreshPayload['jti']),
            date('Y-m-d H:i:s', $refreshPayload['exp'])
        ]);
        
        return $this->createToken($refreshPayload);
    }
    
    public function refreshToken(string $refreshToken): array
    {
        $payload = $this->validateToken($refreshToken);
        
        if (!$payload || $payload['type'] !== 'refresh') {
            throw new \Exception('Invalid refresh token');
        }
        
        // Revoke old refresh token
        $this->revokeRefreshToken($refreshToken);
        
        // Generate new token pair
        $newAccessToken = $this->createToken([
            'user_id' => $payload['user_id'],
            'profile_id' => $payload['profile_id'] ?? null,
            'role' => $payload['role'] ?? 'player'
        ]);
        
        $newRefreshToken = $this->createRefreshToken($payload['user_id']);
        
        return [
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
            'expires_in' => 3600
        ];
    }
    
    private function encryptToken(string $jwt): string
    {
        if (!$this->encryptionKey) {
            // Fallback to non-encrypted for development
            return base64_encode($jwt);
        }
        
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt(
            $jwt,
            'AES-256-GCM',
            $this->encryptionKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        // Return: base64(iv + tag + encrypted_data)
        return base64_encode($iv . $tag . $encrypted);
    }
    
    private function decryptToken(string $encryptedToken): string
    {
        $data = base64_decode($encryptedToken);
        
        if (!$this->encryptionKey) {
            // Fallback for non-encrypted tokens
            return $data;
        }
        
        $iv = substr($data, 0, 16);
        $tag = substr($data, 16, 16);
        $encrypted = substr($data, 32);
        
        return openssl_decrypt(
            $encrypted,
            'AES-256-GCM',
            $this->encryptionKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
    }
    
    private function storeTokenHash(string $jti, int $exp): void
    {
        $key = "token_hash:" . hash('sha256', $jti);
        $ttl = $exp - time();
        
        if ($ttl > 0) {
            $this->redis->put($key, 'valid', $ttl);
        }
    }
    
    private function isTokenRevoked(string $jti): bool
    {
        $key = "token_hash:" . hash('sha256', $jti);
        return !$this->redis->has($key);
    }
    
    private function revokeRefreshToken(string $refreshToken): void
    {
        $payload = $this->validateToken($refreshToken);
        if ($payload) {
            $pdo = $this->getDbConnection();
            $stmt = $pdo->prepare("
                UPDATE refresh_tokens 
                SET is_revoked = TRUE 
                WHERE token_hash = ?
            ");
            $stmt->execute([hash('sha256', $payload['jti'])]);
        }
    }
    
    private function performSecurityChecks(object $payload): void
    {
        // Check for token reuse (replay attack)
        $fingerprintKey = "token_fp:" . $payload->jti;
        if ($this->redis->has($fingerprintKey)) {
            throw new \Exception('Token reuse detected');
        }
        $this->redis->put($fingerprintKey, 'used', 60); // 1 minute window
        
        // Validate audience and issuer
        if ($payload->aud !== env('APP_URL') || $payload->iss !== env('APP_URL')) {
            throw new \Exception('Invalid token audience or issuer');
        }
    }
    
    private function getDbConnection(): \PDO
    {
        return new \PDO(
            sprintf(
                'pgsql:host=%s;port=%s;dbname=%s',
                env('DB_HOST'),
                env('DB_PORT'),
                env('DB_DATABASE')
            ),
            env('DB_USERNAME'),
            env('DB_PASSWORD')
        );
    }
}