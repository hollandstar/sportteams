<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TeamAdminController;
use App\Http\Controllers\Api\FormTemplateController;
use App\Http\Controllers\Api\FormResponseController;

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
        
        // Team Admin endpoints (require team_admin or admin role)
        Route::prefix('team-admin')->group(function () {
            Route::get('/teams', [TeamAdminController::class, 'getManagedTeams']);
            Route::get('/teams/{teamId}/players', [TeamAdminController::class, 'getTeamPlayers']);
            Route::post('/promote-to-player', [TeamAdminController::class, 'promoteToPlayer']);
            Route::post('/players', [TeamAdminController::class, 'createPlayer']);
            Route::put('/players/{playerId}', [TeamAdminController::class, 'updatePlayer']);
            Route::get('/audit-log', [TeamAdminController::class, 'getAuditLog']);
        });
        
        // Form Management endpoints
        Route::prefix('forms')->group(function () {
            // Admin-only form template management
            Route::middleware(['role:admin'])->group(function () {
                Route::get('/templates', [FormTemplateController::class, 'index']);
                Route::post('/templates', [FormTemplateController::class, 'store']);
                Route::put('/templates/{formTemplate}', [FormTemplateController::class, 'update']);
                Route::post('/templates/{formTemplate}/toggle-active', [FormTemplateController::class, 'toggleActive']);
                Route::delete('/templates/{formTemplate}', [FormTemplateController::class, 'destroy']);
                Route::get('/statistics', [FormTemplateController::class, 'getStatistics']);
            });
            
            // Form templates accessible by all authenticated users
            Route::get('/templates/{formTemplate}', [FormTemplateController::class, 'show']);
            Route::get('/active', [FormTemplateController::class, 'getActiveForms']);
            
            // Form responses
            Route::apiResource('responses', FormResponseController::class);
        });
        
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