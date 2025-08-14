# Laravel Backend Structure for SportTeams

## Step 1: Laravel Project Setup

```bash
# Create new Laravel project
composer create-project laravel/laravel sportteams-backend
cd sportteams-backend

# Install required packages
composer require firebase/php-jwt
composer require predis/predis
composer require laravel/sanctum
```

## Step 2: Environment Configuration

Create `.env` file with Progress DB configuration:

```env
APP_NAME=SportTeams
APP_ENV=production
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=false
APP_URL=http://localhost:8000

# Progress DB Configuration
DB_CONNECTION=progress
DB_HOST=your-progress-host
DB_PORT=your-progress-port
DB_DATABASE=your-database
DB_USERNAME=your-username
DB_PASSWORD=your-password

# Redis Configuration  
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# JWT Configuration
JWT_SIGNING_KEY=base64:YOUR_SIGNING_KEY
JWT_ENCRYPTION_KEY=base64:YOUR_ENCRYPTION_KEY

# Multi-language
DEFAULT_LOCALE=nl
SUPPORTED_LOCALES=nl,en,de,fr
```

## Step 3: Directory Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── AuthController.php
│   │   │   ├── PlayerController.php
│   │   │   ├── TeamController.php
│   │   │   ├── EvaluationController.php
│   │   │   └── TranslationController.php
│   │   └── Controller.php
│   ├── Middleware/
│   │   ├── SecurityMiddleware.php
│   │   ├── TeamScopeMiddleware.php
│   │   └── RateLimitingMiddleware.php
│   └── Requests/
│       ├── Auth/
│       ├── Player/
│       └── Evaluation/
├── Models/
│   ├── User.php
│   ├── Profile.php
│   ├── Team.php
│   ├── Player.php
│   ├── PlayerEvaluation.php
│   └── Translation.php
├── Services/
│   ├── Security/
│   │   ├── SecurityContextService.php
│   │   ├── TokenService.php
│   │   └── AccessControlService.php
│   ├── Translation/
│   │   └── TranslationService.php
│   ├── Cache/
│   │   └── CacheService.php
│   └── Database/
│       └── ProgressDbService.php
└── Providers/
    └── ProgressDbServiceProvider.php
```

## Step 4: Core Implementation Files

### 1. Progress DB Service Provider

```php
<?php
// app/Providers/ProgressDbServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use PDO;

class ProgressDbServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton('progress.db', function ($app) {
            $config = [
                'dsn' => sprintf(
                    'progress:host=%s;port=%s;db=%s',
                    env('DB_HOST'),
                    env('DB_PORT'),
                    env('DB_DATABASE')
                ),
                'username' => env('DB_USERNAME'),
                'password' => env('DB_PASSWORD'),
                'options' => [
                    PDO::ATTR_PERSISTENT => true,
                    PDO::ATTR_TIMEOUT => 30,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                ]
            ];
            
            return new PDO(
                $config['dsn'],
                $config['username'],
                $config['password'],
                $config['options']
            );
        });
    }
}
```

### 2. Security Context Service

```php
<?php
// app/Services/Security/SecurityContextService.php

namespace App\Services\Security;

use Illuminate\Support\Facades\Cache;

class SecurityContextService
{
    private $db;
    private $cache;
    
    private $userId;
    private $profileId;
    private $role;
    private $teamScopes;
    private $permissions;
    
    public function __construct()
    {
        $this->db = app('progress.db');
        $this->cache = app('cache');
    }
    
    public function loadContext(int $userId): self
    {
        $this->userId = $userId;
        
        $cacheKey = "security_context:{$userId}";
        $context = $this->cache->get($cacheKey);
        
        if (!$context) {
            $context = $this->loadFromDatabase($userId);
            $this->cache->put($cacheKey, $context, 300); // 5 minutes
        }
        
        $this->profileId = $context['profile_id'];
        $this->role = $context['role'];
        $this->teamScopes = json_decode($context['team_scopes'], true) ?: [];
        $this->permissions = json_decode($context['permissions'], true) ?: [];
        
        return $this;
    }
    
    private function loadFromDatabase(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT 
                usc.profile_id,
                usc.role,
                usc.team_scopes,
                usc.permissions
            FROM user_security_contexts usc
            WHERE usc.user_id = ? AND usc.expires_at > NOW()
        ");
        
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            throw new \Exception('Invalid or expired security context');
        }
        
        return $result;
    }
    
    public function canViewPlayer(int $playerId): bool
    {
        if ($this->isAdmin()) return true;
        
        $stmt = $this->db->prepare("SELECT team_id FROM players WHERE id = ?");
        $stmt->execute([$playerId]);
        $playerTeam = $stmt->fetchColumn();
        
        return $playerTeam && in_array($playerTeam, $this->teamScopes);
    }
    
    public function canEditPlayer(int $playerId): bool
    {
        if ($this->isAdmin()) return true;
        
        if ($this->isPlayer()) {
            $stmt = $this->db->prepare("
                SELECT 1 FROM players WHERE id = ? AND profile_id = ?
            ");
            $stmt->execute([$playerId, $this->profileId]);
            return (bool) $stmt->fetchColumn();
        }
        
        return $this->canViewPlayer($playerId) && 
               ($this->permissions['can_edit_players'] ?? false);
    }
    
    public function getSecurePlayerQuery(): string
    {
        if ($this->isAdmin()) {
            return "SELECT * FROM player_team_summary WHERE is_active = 1";
        }
        
        if ($this->isPlayer()) {
            return "SELECT * FROM player_team_summary WHERE profile_id = {$this->profileId}";
        }
        
        if ($this->isCoach() && !empty($this->teamScopes)) {
            $teamIds = implode(',', array_map('intval', $this->teamScopes));
            return "SELECT * FROM player_team_summary WHERE team_id IN ({$teamIds}) AND is_active = 1";
        }
        
        return "SELECT * FROM player_team_summary WHERE 1=0";
    }
    
    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isCoach(): bool { return in_array($this->role, ['coach', 'head_coach']); }
    public function isPlayer(): bool { return $this->role === 'player'; }
    public function getTeamScopes(): array { return $this->teamScopes; }
    public function getProfileId(): int { return $this->profileId; }
    public function getRole(): string { return $this->role; }
}
```

### 3. Secure Token Service

```php
<?php
// app/Services/Security/TokenService.php

namespace App\Services\Security;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class TokenService
{
    private $signingKey;
    private $encryptionKey;
    private $redis;
    
    public function __construct()
    {
        $this->signingKey = base64_decode(env('JWT_SIGNING_KEY'));
        $this->encryptionKey = base64_decode(env('JWT_ENCRYPTION_KEY'));
        $this->redis = app('redis');
    }
    
    public function createToken(array $payload): string
    {
        $now = time();
        $payload = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + 3600, // 1 hour
            'nbf' => $now - 30,
            'jti' => bin2hex(random_bytes(16)),
            'aud' => env('APP_URL'),
            'iss' => env('APP_URL'),
        ]);
        
        // Sign JWT
        $jwt = JWT::encode($payload, $this->signingKey, 'HS256');
        
        // Encrypt JWT
        $encryptedJwt = $this->encryptToken($jwt);
        
        // Store token hash for revocation
        $this->storeTokenHash($payload['jti'], $payload['exp']);
        
        return $encryptedJwt;
    }
    
    public function validateToken(string $encryptedToken): ?array
    {
        try {
            // Decrypt
            $jwt = $this->decryptToken($encryptedToken);
            
            // Verify and decode
            $payload = JWT::decode($jwt, new Key($this->signingKey, 'HS256'));
            
            // Check if revoked
            if ($this->isTokenRevoked($payload->jti)) {
                return null;
            }
            
            // Security checks
            $this->performSecurityChecks($payload);
            
            return (array)$payload;
            
        } catch (\Exception $e) {
            \Log::warning('Token validation failed', [
                'error' => $e->getMessage(),
                'token_preview' => substr($encryptedToken, 0, 20) . '...'
            ]);
            return null;
        }
    }
    
    private function encryptToken(string $jwt): string
    {
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt(
            $jwt,
            'AES-256-GCM',
            $this->encryptionKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        return base64_encode($iv . $tag . $encrypted);
    }
    
    private function decryptToken(string $encryptedToken): string
    {
        $data = base64_decode($encryptedToken);
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
        $this->redis->setex($key, $exp - time(), 'valid');
    }
    
    private function isTokenRevoked(string $jti): bool
    {
        $key = "token_hash:" . hash('sha256', $jti);
        return !$this->redis->exists($key);
    }
    
    private function performSecurityChecks(object $payload): void
    {
        // Check for token reuse
        $fingerprintKey = "token_fp:" . $payload->jti;
        if ($this->redis->exists($fingerprintKey)) {
            throw new \Exception('Token reuse detected');
        }
        $this->redis->setex($fingerprintKey, 60, 'used');
        
        // Validate audience and issuer
        if ($payload->aud !== env('APP_URL') || $payload->iss !== env('APP_URL')) {
            throw new \Exception('Invalid token audience or issuer');
        }
    }
}
```

## Step 5: API Controllers

### Player Controller Example

```php
<?php
// app/Http/Controllers/Api/PlayerController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Security\SecurityContextService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlayerController extends Controller
{
    private $securityContext;
    private $db;
    
    public function __construct(SecurityContextService $securityContext)
    {
        $this->securityContext = $securityContext;
        $this->db = app('progress.db');
    }
    
    public function show(Request $request, int $playerId): JsonResponse
    {
        try {
            $userId = $request->get('user_id'); // From middleware
            $this->securityContext->loadContext($userId);
            
            if (!$this->securityContext->canViewPlayer($playerId)) {
                return response()->json(['error' => 'Access denied'], 403);
            }
            
            // Call stored procedure for secure data access
            $stmt = $this->db->prepare("CALL usp_get_player_data(?, ?, @result)");
            $stmt->execute([$userId, $playerId]);
            
            $stmt = $this->db->prepare("SELECT @result as result");
            $stmt->execute();
            $result = $stmt->fetchColumn();
            
            return response()->json(['data' => json_decode($result, true)]);
            
        } catch (\Exception $e) {
            \Log::error('Player data access error', [
                'user_id' => $userId ?? null,
                'player_id' => $playerId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
    
    public function index(Request $request): JsonResponse
    {
        $userId = $request->get('user_id');
        $teamId = $request->query('team_id');
        
        $this->securityContext->loadContext($userId);
        
        if ($teamId) {
            // Team roster request
            $stmt = $this->db->prepare("CALL usp_get_team_roster(?, ?, @result)");
            $stmt->execute([$userId, $teamId]);
            
            $stmt = $this->db->prepare("SELECT @result as result");
            $stmt->execute();
            $result = $stmt->fetchColumn();
            
            return response()->json(['data' => json_decode($result, true)]);
        } else {
            // General player list based on security context
            $query = $this->securityContext->getSecurePlayerQuery();
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $players = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            return response()->json(['data' => $players]);
        }
    }
}
```

## Step 6: Security Middleware

```php
<?php
// app/Http/Middleware/SecurityMiddleware.php

namespace App\Http\Middleware;

use App\Services\Security\TokenService;
use Closure;
use Illuminate\Http\Request;

class SecurityMiddleware
{
    private $tokenService;
    private $redis;
    
    public function __construct(TokenService $tokenService)
    {
        $this->tokenService = $tokenService;
        $this->redis = app('redis');
    }
    
    public function handle(Request $request, Closure $next)
    {
        // Rate limiting
        $this->enforceRateLimit($request);
        
        // Token validation
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['error' => 'Missing authorization token'], 401);
        }
        
        $payload = $this->tokenService->validateToken($token);
        if (!$payload) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
        
        // Add user info to request
        $request->merge(['user_id' => $payload['user_id']]);
        
        return $next($request);
    }
    
    private function enforceRateLimit(Request $request): void
    {
        $key = 'rate_limit:' . $request->ip() . ':' . $request->path();
        $attempts = $this->redis->incr($key);
        
        if ($attempts === 1) {
            $this->redis->expire($key, 60);
        }
        
        $limits = [
            '/api/v1/auth/login' => 5,
            '/api/v1/players' => 100,
            '/api/v1/evaluations' => 50,
        ];
        
        $limit = $limits[$request->path()] ?? 30;
        
        if ($attempts > $limit) {
            abort(429, 'Rate limit exceeded');
        }
    }
}
```

## Next Steps

1. **Test Database Connection**: Ensure Progress DB connectivity
2. **Implement Remaining Controllers**: Teams, Evaluations, etc.
3. **Add Translation Service**: Multi-language support
4. **Create Frontend API Client**: React service layer
5. **Setup Caching**: Redis configuration and optimization

This structure provides a secure, scalable backend with proper team-scoped access control and encrypted JWT authentication.