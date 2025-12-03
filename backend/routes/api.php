<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;

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
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
//Route::get('/products', [ProductController::class, 'index']); // Xem sản phẩm

// Bên trong Middleware Sanctum này là PRIVATE ROUTES (Phải có Token mới vào được)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']); // Lấy thông tin bản thân

    // Giỏ hàng
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);

    // 1. Nhóm Checkout (Dùng CheckoutController)
    Route::post('/checkout', [CheckoutController::class, 'checkout']);

    // 2. Nhóm Order (Dùng OrderController)
    Route::get('/orders', [OrderController::class, 'index']);        // Xem lịch sử
    Route::get('/orders/{id}', [OrderController::class, 'show']);    // Xem chi tiết
    Route::post('/orders/cancel/{id}', [OrderController::class, 'cancel']); // Hủy đơn
    // 3. Nhóm Review (Dùng ReviewController)
    Route::post('/reviews', [ReviewController::class, 'store']);
});