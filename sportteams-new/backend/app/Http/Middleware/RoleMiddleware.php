<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Get user role from the SecurityMiddleware
        $userRole = $request->get('user_role');
        
        if (!$userRole) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if ($userRole !== $role) {
            return response()->json(['error' => 'Unauthorized - insufficient permissions'], 403);
        }

        return $next($request);
    }
}
