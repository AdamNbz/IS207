<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class AuthController extends Controller
{
    // ----------------------------------------------------------------
    // 1. Gửi OTP Đăng ký (Email KHÔNG được tồn tại)
    // ----------------------------------------------------------------
    public function sendRegisterOtp(Request $request) {
        $request->validate(['email' => 'required|email']);

        // Kiểm tra: Email phải CHƯA tồn tại
        if (User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'Email này đã được sử dụng, vui lòng đăng nhập!'], 400);
        }

        // Tạo và gửi OTP
        $otp = rand(100000, 999999);
        Cache::put('otp_' . $request->email, $otp, now()->addMinutes(5));

        try {
            Mail::to($request->email)->send(new OtpMail($otp));
            return response()->json(['message' => 'Mã OTP xác thực đã được gửi đến email!']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi gửi mail: ' . $e->getMessage()], 500);
        }
    }

    // ----------------------------------------------------------------
    // 2. Đăng ký tài khoản (Bắt buộc kèm OTP)
    // ----------------------------------------------------------------
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'otp' => 'required' // <-- Bắt buộc có OTP
        ]);

        // Kiểm tra OTP
        $key = 'otp_' . $request->email;
        $cachedOtp = Cache::get($key);

        if (!$cachedOtp || $request->otp != $cachedOtp) {
            return response()->json(['message' => 'Mã OTP không đúng hoặc đã hết hạn!'], 400);
        }

        // Tạo User
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer'
        ]);

        // Xóa OTP sau khi dùng
        Cache::forget($key);

        // Tạo token đăng nhập luôn
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // ----------------------------------------------------------------
    // 3. Gửi OTP Quên mật khẩu (Email PHẢI tồn tại)
    // ----------------------------------------------------------------
    public function sendOtp(Request $request) {
        $request->validate(['email' => 'required|email']);

        // Kiểm tra: Email PHẢI tồn tại
        if (!User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'Email chưa được đăng ký trong hệ thống!'], 404);
        }

        $otp = rand(100000, 999999);
        Cache::put('otp_' . $request->email, $otp, now()->addMinutes(5));

        try {
            Mail::to($request->email)->send(new OtpMail($otp));
            return response()->json(['message' => 'Mã OTP đã được gửi đến email của bạn!']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi gửi mail: ' . $e->getMessage()], 500);
        }
    }

    // ----------------------------------------------------------------
    // 4. Các hàm khác (Giữ nguyên)
    // ----------------------------------------------------------------

    // Xác thực OTP (Dùng chung cho Forgot Password)
    public function verifyOtp(Request $request) {
        $request->validate(['email' => 'required|email', 'otp' => 'required']);
        $key = 'otp_' . $request->email;
        if (Cache::get($key) == $request->otp) {
            return response()->json(['message' => 'OTP hợp lệ'], 200);
        }
        return response()->json(['message' => 'Mã OTP không đúng hoặc đã hết hạn'], 400);
    }

    // Đặt lại mật khẩu
    public function resetPassword(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
            'password' => 'required|min:6'
        ]);

        $key = 'otp_' . $request->email;
        if (Cache::get($key) != $request->otp) {
            return response()->json(['message' => 'Phiên xác thực hết hạn.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
            Cache::forget($key);
            return response()->json(['message' => 'Đổi mật khẩu thành công.'], 200);
        }
        return response()->json(['message' => 'Lỗi User.'], 404);
    }

    public function login(Request $request) {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Tài khoản hoặc mật khẩu không đúng'], 401);
        }
        $user->tokens()->delete();
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'access_token' => $user->createToken('auth_token')->plainTextToken,
            'user' => $user
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    public function me(Request $request) {
        return response()->json($request->user());
    }
}
