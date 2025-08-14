<?php

namespace App\Http\Middleware;

use App\Services\Security\TokenService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecurityMiddleware
{
    private $tokenService;
    private $cache;
    
    public function __construct(TokenService $tokenService)
    {
        $this->tokenService = $tokenService;
        $this->cache = app('cache.store');
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
            return response()->json(['error' => 'Invalid or expired token'], 401);
        }
        
        // Add user info to request
        $request->merge([
            'user_id' => $payload['user_id'],
            'profile_id' => $payload['profile_id'] ?? null,
            'user_role' => $payload['role'] ?? 'player',
            'token_jti' => $payload['jti'] ?? null
        ]);
        
        // Log access for security monitoring
        Log::info('API Access', [
            'user_id' => $payload['user_id'],
            'endpoint' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        return $next($request);
    }
    
    private function enforceRateLimit(Request $request): void
    {
        $key = 'rate_limit:' . $request->ip() . ':' . $request->path();
        $attempts = $this->cache->get($key, 0) + 1;
        
        // Set/update counter
        $this->cache->put($key, $attempts, 60); // 1 minute window
        
        // Different limits per endpoint type
        $limits = [
            '/api/v1/auth/login' => 5,     // 5 attempts per minute
            '/api/v1/auth/refresh' => 10,  // 10 attempts per minute
            '/api/v1/players' => 100,      // 100 requests per minute
            '/api/v1/teams' => 100,        // 100 requests per minute
            '/api/v1/evaluations' => 50,   // 50 requests per minute
        ];
        
        $limit = $limits[$request->path()] ?? 30; // Default limit
        
        if ($attempts > $limit) {
            // Log security event
            Log::warning('Rate limit exceeded', [
                'ip' => $request->ip(),
                'path' => $request->path(),
                'attempts' => $attempts,
                'limit' => $limit
            ]);
            
            abort(429, 'Rate limit exceeded. Please try again later.');
        }
    }
}