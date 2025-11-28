<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // 1. Đăng ký (Register)
    public function register(Request $request) {
        // Validate dữ liệu
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6'
        ]);

        // Tạo user mới
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Mã hóa mật khẩu
            'role' => 'customer' // Mặc định là khách hàng
        ]);

        // Cấp token luôn để họ đăng nhập ngay
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // 2. Đăng nhập (Login)
    public function login(Request $request) {
        // Validate
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Tìm user theo email
        $user = User::where('email', $request->email)->first();

        // Kiểm tra: Nếu không có user HOẶC mật khẩu sai
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Tài khoản hoặc mật khẩu không đúng'
            ], 401);
        }

        // Nếu đúng -> Cấp Token (Tấm vé vào cửa)
        // Xóa token cũ đi để tránh rác (tùy chọn)
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // 3. Đăng xuất (Logout)
    public function logout(Request $request) {
        // Xóa token hiện tại (Hủy vé)
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công'
        ]);
    }
    
    // 4. Lấy thông tin người dùng hiện tại (Me)
    public function me(Request $request) {
        return response()->json($request->user());
    }
}