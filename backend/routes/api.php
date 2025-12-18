<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC ROUTES ---

Route::get('/test', function() {
    return response()->json(['message' => 'Backend is running!', 'time' => now()]);
});

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Đăng ký & OTP
Route::post('/send-register-otp', [AuthController::class, 'sendRegisterOtp']); // <-- MỚI: Gửi OTP đăng ký
Route::post('/register', [AuthController::class, 'register']);                 // <-- CẬP NHẬT: Đăng ký kèm OTP

// Quên mật khẩu & OTP
Route::post('/send-otp', [AuthController::class, 'sendOtp']);         // Gửi OTP quên mật khẩu
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);     // Xác thực OTP
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public Data
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);

// --- PRIVATE ROUTES ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);

    // Admin
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::delete('/products/images/{imageId}', [AdminProductController::class, 'deleteImage']);
    });
});
