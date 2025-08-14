<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Test database connection
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
                    'timestamp' => now()->toISOString()
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
     * Login endpoint
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
            
            // Check user credentials
            $stmt = $pdo->prepare("
                SELECT u.id, u.email, p.id as profile_id, p.name, p.role
                FROM users u
                JOIN profiles p ON u.id = p.user_id
                WHERE u.email = ? AND u.password_hash = ?
            ");
            
            $stmt->execute([$credentials['email'], $passwordHash]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid credentials'
                ], 401);
            }
            
            // For now, return simple success (JWT implementation in next phase)
            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'profile_id' => $user['profile_id']
                ],
                'token' => 'temp-token-' . base64_encode($user['id']) // Temporary token
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}