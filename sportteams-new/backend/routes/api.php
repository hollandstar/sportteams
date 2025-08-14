<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// SportTeams API routes
Route::prefix('v1')->group(function () {
    // Public endpoints (no authentication required)
    Route::get('/test', [AuthController::class, 'test']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    
    // Protected endpoints (require JWT authentication)
    Route::middleware(['security'])->group(function () {
        // Authentication endpoints
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        
        // Player management endpoints (will be implemented in next steps)
        // Route::get('/players', [PlayerController::class, 'index']);
        // Route::get('/players/{id}', [PlayerController::class, 'show']);
        // Route::post('/players', [PlayerController::class, 'store']);
        // Route::put('/players/{id}', [PlayerController::class, 'update']);
        // Route::delete('/players/{id}', [PlayerController::class, 'destroy']);
        
        // Team management endpoints (will be implemented in next steps)
        // Route::get('/teams', [TeamController::class, 'index']);
        // Route::get('/teams/{id}', [TeamController::class, 'show']);
        // Route::get('/teams/{id}/roster', [TeamController::class, 'roster']);
        
        // Evaluation endpoints (will be implemented in next steps)  
        // Route::get('/evaluations', [EvaluationController::class, 'index']);
        // Route::post('/evaluations', [EvaluationController::class, 'store']);
    });
});