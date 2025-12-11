<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use Illuminate\Support\Facades\Route;

// Bên ngoài Middleware Sanctum là PUBLIC ROUTES (Các API không cần đăng nhập để ở đây)
Route::get('/test', function() {
    return response()->json(['message' => 'Backend is running!', 'time' => now()]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']); // Xem sản phẩm
Route::get('/products/{id}', [ProductController::class, 'show']); // Chi tiết sản phẩm
Route::get('/categories', [CategoryController::class, 'index']); // Danh sách danh mục
Route::get('/brands', [BrandController::class, 'index']); // Danh sách brands

// Bên trong Middleware Sanctum này là PRIVATE ROUTES (Phải có Token mới vào được)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']); // Lấy thông tin bản thân

    // Giỏ hàng
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);

    // Admin routes (yêu cầu role admin)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    });
});
