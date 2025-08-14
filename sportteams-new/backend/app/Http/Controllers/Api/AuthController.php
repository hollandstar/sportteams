<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Security\TokenService;
use App\Services\Security\SecurityContextService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    private $tokenService;
    private $securityContext;
    
    public function __construct(TokenService $tokenService, SecurityContextService $securityContext)
    {
        $this->tokenService = $tokenService;
        $this->securityContext = $securityContext;
    }

    /**
     * Test database connection (public endpoint)
     */
    public function test(): JsonResponse
    {
        try {
            // Test PostgreSQL connection
            $pdo = new \PDO(
                sprintf(
                    'pgsql:host=%s;port=%s;dbname=%s',
                    env('DB_HOST'),
                    env('DB_PORT'),
                    env('DB_DATABASE')
                ),
                env('DB_USERNAME'),
                env('DB_PASSWORD')
            );
            
            // Test query
            $stmt = $pdo->query("SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'");
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Database connection successful',  
                'data' => [
                    'database' => env('DB_DATABASE'),
                    'tables_count' => $result['table_count'],
                    'timestamp' => now()->toISOString(),
                    'security_enhanced' => true
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Enhanced login with JWT security and team-scoped access
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);
        
        try {
            // Connect to PostgreSQL
            $pdo = new \PDO(
                sprintf(
                    'pgsql:host=%s;port=%s;dbname=%s',
                    env('DB_HOST'),
                    env('DB_PORT'),
                    env('DB_DATABASE')
                ),
                env('DB_USERNAME'),
                env('DB_PASSWORD')
            );
            
            // Hash password for comparison
            $passwordHash = hash('sha256', $credentials['password']);
            
            // Check user credentials with enhanced profile data
            $stmt = $pdo->prepare("
                SELECT 
                    u.id, 
                    u.email, 
                    u.email_verified_at,
                    p.id as profile_id, 
                    p.name, 
                    p.role,
                    p.is_active,
                    p.preferred_language,
                    p.photo
                FROM users u
                JOIN profiles p ON u.id = p.user_id
                WHERE u.email = ? AND u.password_hash = ? AND p.is_active = true
            ");
            
            $stmt->execute([$credentials['email'], $passwordHash]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                // Log failed login attempt
                Log::warning('Failed login attempt', [
                    'email' => $credentials['email'],
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid credentials'
                ], 401);
            }
            
            // Load security context (team scopes, permissions)
            $context = $this->securityContext->loadContext($user['id']);
            
            // Create enhanced JWT token
            $token = $this->tokenService->createToken([
                'user_id' => $user['id'],
                'profile_id' => $user['profile_id'],
                'role' => $user['role'],
                'team_scopes' => $context->getTeamScopes(),
                'permissions' => $context->getPermissions()
            ]);
            
            // Create refresh token
            $refreshToken = $this->tokenService->createRefreshToken($user['id']);
            
            // Update last login
            $stmt = $pdo->prepare("
                UPDATE profiles 
                SET last_login_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$user['profile_id']]);
            
            // Log successful login
            Log::info('Successful login', [
                'user_id' => $user['id'],
                'role' => $user['role'],
                'team_scopes' => $context->getTeamScopes(),
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'profile_id' => $user['profile_id'],
                    'team_scopes' => $context->getTeamScopes(),
                    'permissions' => $context->getPermissions(),
                    'preferred_language' => $user['preferred_language'],
                    'photo' => $user['photo']
                ],
                'tokens' => [
                    'access_token' => $token,
                    'refresh_token' => $refreshToken,
                    'token_type' => 'Bearer',
                    'expires_in' => 3600
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Login error', [
                'error' => $e->getMessage(),
                'email' => $credentials['email'],
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Login failed',
                'error' => 'An error occurred during authentication'
            ], 500);
        }
    }
    
    /**
     * Refresh JWT token
     */
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');
        
        if (!$refreshToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Refresh token required'
            ], 400);
        }
        
        try {
            $tokens = $this->tokenService->refreshToken($refreshToken);
            
            return response()->json([
                'status' => 'success',
                'tokens' => $tokens
            ]);
            
        } catch (\Exception $e) {
            Log::warning('Token refresh failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid refresh token'
            ], 401);
        }
    }
    
    /**
     * Get current user information
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $userId = $request->get('user_id');
            
            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Load fresh security context
            $context = $this->securityContext->loadContext($userId);
            
            // Get user data
            $pdo = new \PDO(
                sprintf(
                    'pgsql:host=%s;port=%s;dbname=%s',
                    env('DB_HOST'),
                    env('DB_PORT'),
                    env('DB_DATABASE')
                ),
                env('DB_USERNAME'),
                env('DB_PASSWORD')
            );
            
            $stmt = $pdo->prepare("
                SELECT 
                    u.id, 
                    u.email,
                    p.id as profile_id,
                    p.name, 
                    p.role,
                    p.preferred_language,
                    p.photo,
                    p.last_login_at
                FROM users u
                JOIN profiles p ON u.id = p.user_id
                WHERE u.id = ? AND p.is_active = true
            ");
            
            $stmt->execute([$userId]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'profile_id' => $user['profile_id'],
                    'team_scopes' => $context->getTeamScopes(),
                    'permissions' => $context->getPermissions(),
                    'preferred_language' => $user['preferred_language'],
                    'photo' => $user['photo'],
                    'last_login_at' => $user['last_login_at']
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Me endpoint error', [
                'error' => $e->getMessage(),
                'user_id' => $request->get('user_id')
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get user information'
            ], 500);
        }
    }
    
    /**
     * Logout and revoke tokens
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $userId = $request->get('user_id');
            $tokenJti = $request->get('token_jti');
            
            if ($userId && $tokenJti) {
                // Revoke current session tokens
                $cache = app('cache.store');
                $cache->forget("token_hash:" . hash('sha256', $tokenJti));
                
                // Revoke all refresh tokens for this user
                $pdo = new \PDO(
                    sprintf(
                        'pgsql:host=%s;port=%s;dbname=%s',
                        env('DB_HOST'),
                        env('DB_PORT'),
                        env('DB_DATABASE')
                    ),
                    env('DB_USERNAME'),
                    env('DB_PASSWORD')
                );
                
                $stmt = $pdo->prepare("
                    UPDATE refresh_tokens 
                    SET is_revoked = TRUE 
                    WHERE user_id = ? AND is_revoked = FALSE
                ");
                $stmt->execute([$userId]);
                
                Log::info('User logged out', [
                    'user_id' => $userId,
                    'ip' => $request->ip()
                ]);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Logout error', [
                'error' => $e->getMessage(),
                'user_id' => $request->get('user_id')
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully'
            ]); // Always return success for logout
        }
    }
}