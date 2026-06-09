<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DosenController;
use App\Http\Controllers\Api\MahasiswaController;

// ─── Auth (Public) ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ─── Protected Routes (Sanctum) ───────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ─── Dosen ────────────────────────────────────────────────────────────────
    Route::prefix('dosen')->group(function () {
        Route::get('/dashboard-stats', [DosenController::class, 'dashboardStats']);
        Route::get('/tasks', [DosenController::class, 'tasks']);
        Route::post('/tasks', [DosenController::class, 'storeTask']);
        Route::get('/tasks/{id}', [DosenController::class, 'showTask']);
        Route::put('/tasks/{id}', [DosenController::class, 'updateTask']);
        Route::delete('/tasks/{id}', [DosenController::class, 'deleteTask']);
        Route::get('/submissions', [DosenController::class, 'submissions']);
        Route::post('/submissions/{id}/grade', [DosenController::class, 'gradeSubmission']);
        Route::get('/students', [DosenController::class, 'students']);
        Route::get('/mata-kuliah', [DosenController::class, 'mataKuliah']);
        Route::post('/mata-kuliah', [DosenController::class, 'storeMataKuliah']);
    });

    // ─── Mahasiswa ────────────────────────────────────────────────────────────
    Route::prefix('mahasiswa')->group(function () {
        Route::get('/dashboard-stats', [MahasiswaController::class, 'dashboardStats']);
        Route::get('/tasks', [MahasiswaController::class, 'tasks']);
        Route::get('/tasks/{id}', [MahasiswaController::class, 'showTask']);
        Route::post('/tasks/{id}/submit', [MahasiswaController::class, 'submitTask']);
    });
});