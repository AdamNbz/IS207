<?php

use Illuminate\Http\Request;
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
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminPromotionController;
use App\Http\Controllers\Api\UserPromotionController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\Admin\UserController;

use App\Http\Controllers\Api\ChatController;

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

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    
    //  NHÓM PROMOTIONS (KHUYẾN MÃI)
    Route::get('/promotions', [AdminPromotionController::class, 'index']);
    Route::post('/promotions', [AdminPromotionController::class, 'store']);
    Route::get('/promotions/{id}', [AdminPromotionController::class, 'show']);
    Route::delete('/promotions/{id}', [AdminPromotionController::class, 'destroy']);
    
    // Route đặc biệt: Thêm sản phẩm vào KM
    Route::post('/promotions/{id}/add-products', [AdminPromotionController::class, 'addProducts']);
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

Route::middleware(['auth:sanctum'])->group(function () {
    // ... các route khác
    
    // Route cho thống kê
    Route::get('/admin/stats/overview', [StatsController::class, 'overview']);
    Route::get('/admin/stats/products', [StatsController::class, 'products']);
    Route::get('/admin/stats/lowStock', [StatsController::class, 'lowStock']);
});
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
Route::get('/promotions/{id}/products', [UserPromotionController::class, 'getProducts']);

// Chatbot
Route::post('/chat', [ChatController::class, 'sendMessage']);

// --- PRIVATE ROUTES ---
Route::middleware('auth:sanctum')->group(function () {
    // Auth
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

    Route::middleware(\App\Http\Middleware\IsAdmin::class)->prefix('admin')->group(function () {
        Route::get('/stats/overview', [\App\Http\Controllers\Api\Admin\StatsController::class, 'overview']);
        Route::get('/stats/revenue', [\App\Http\Controllers\Api\Admin\StatsController::class, 'revenue']);
        Route::get('/stats/stock', [\App\Http\Controllers\Api\Admin\StatsController::class, 'stock']);
        Route::get('/stats/products', [\App\Http\Controllers\Api\Admin\StatsController::class, 'products']);
        Route::get('/stats/category', [\App\Http\Controllers\Api\Admin\StatsController::class, 'category']);
        Route::get('/stats/low-stock', [\App\Http\Controllers\Api\Admin\StatsController::class, 'lowStock']);

        Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
        Route::put('/users/{id}/lock', [\App\Http\Controllers\Api\Admin\UserController::class, 'lock']);
        Route::put('/users/{id}/promote', [\App\Http\Controllers\Api\Admin\UserController::class, 'promote']);
        Route::put('/users/{id}/revoke', [\App\Http\Controllers\Api\Admin\UserController::class, 'revoke']);
    });

    Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
        // Quản lý User
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users/{id}/lock', [UserController::class, 'lock']);
        Route::post('/users/{id}/promote', [UserController::class, 'promote']);
        Route::post('/users/{id}/revoke', [UserController::class, 'revoke']);
    });

    // use Illuminate\Support\Facades\Http;

    Route::get('/test-models', function () {
        $apiKey = env('GEMINI_API_KEY');
        
        // Gọi API lấy danh sách Model
        $response = Http::withoutVerifying()
            ->get("https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}");

        return $response->json();
    });
});
