<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// SportTeams API routes
Route::prefix('v1')->group(function () {
    // Test endpoint
    Route::get('/test', [AuthController::class, 'test']);
    
    // Authentication routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Protected routes (will add JWT middleware later)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });
});