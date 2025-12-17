<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
Route::get('/get-token-khach', function () {
    // Tìm đích danh ông khách
    $user = App\Models\User::where('name', 'nguyễn văn khách')->first(); 
    
    // Cấp vé luôn không cần hỏi password
    $token = $user->createToken('test-token')->plainTextToken;

    return ['token' => $token];
});
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
        Route::delete('/products/images/{imageId}', [AdminProductController::class, 'deleteImage']);
    });
});
    Route::put('/cart/update', [CartController::class, 'update']);
    Route::delete('/cart/remove/{productId}', [CartController::class, 'removeFromCart']);

    // TƯơng tác
    Route::post('/addresses', [AuthController::class, 'addAddresses']);

    // 1. Nhóm Checkout (Dùng CheckoutController)
    Route::post('/checkout', [CheckoutController::class, 'checkout']);

    // 2. Nhóm Order (Dùng OrderController)
    Route::get('/orders', [OrderController::class, 'index']);        // Xem lịch sử
    Route::get('/orders/{id}', [OrderController::class, 'show']);    // Xem chi tiết
    Route::post('/orders/cancel/{id}', [OrderController::class, 'cancel']); // Hủy đơn
    // 3. Nhóm Review (Dùng ReviewController)
    Route::post('/reviews', [ReviewController::class, 'store']);
});
