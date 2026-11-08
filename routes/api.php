<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\BarangController;
use App\Http\Controllers\Api\BarangMasukController;
use App\Http\Controllers\Api\BarangKeluarController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ForecastController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\NotificationController;

// ✅ Test endpoint
Route::get('/test', fn() => response()->json(['message' => 'API berjalan']));

// ✅ Public — Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ✅ Semua route di bawah wajib login
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard & Forecast
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/forecast', [ForecastController::class, 'index']);

    // CRUD umum
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('barang', BarangController::class);
    Route::apiResource('barang-masuk', BarangMasukController::class);

    // Barang Keluar — semua role bisa buat & lihat
    Route::apiResource('barang-keluar', BarangKeluarController::class)
        ->except(['update', 'show', 'destroy']);

    // Approve & Reject — SEMUA USER YANG LOGIN BISA AKSES (middleware role dihapus)
    Route::post('/barang-keluar/{id}/approve', [BarangKeluarController::class, 'approve']);
    Route::post('/barang-keluar/{id}/reject', [BarangKeluarController::class, 'reject']);

    // Notifikasi
    Route::get('/notifications', function (Illuminate\Http\Request $request) {
        return response()->json([
            'unread' => $request->user()->unreadNotifications,
            'semua' => $request->user()->notifications()->paginate(20),
        ]);
    });

    Route::post('/notifications/{id}/read', function ($id, Illuminate\Http\Request $request) {
        $notif = $request->user()->notifications()->findOrFail($id);
        $notif->markAsRead();
        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca']);
    });

    Route::post('/notifications/read-all', function (Illuminate\Http\Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'Semua notifikasi sudah dibaca']);
    });

    // Settings
    Route::get('/settings', [SettingController::class, 'getSettings']);
    Route::post('/settings/logo', [SettingController::class, 'uploadLogo']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);
});