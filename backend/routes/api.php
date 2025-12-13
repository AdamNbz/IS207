<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\Admin\AdminOrderController;

Route::get('/get-token-admin', function () {
    // 1. Tìm user tên là 'admin shop'
    $admin = App\Models\User::where('name', 'Admin Shop')->first(); 
    
    if (!$admin) {
        return response()->json(['message' => 'Không tìm thấy user admin shop'], 404);
    }

    // 2. Cấp vé (Token)
    $token = $admin->createToken('admin-token')->plainTextToken;

    return ['token' => $token];
});


// Nhóm Route dành cho ADMIN
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    
    // Quản lý đơn hàng
    Route::get('/orders', [AdminOrderController::class, 'index']); // Danh sách + Lọc
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']); // Chi tiết
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']); // Cập nhật trạng thái
});

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