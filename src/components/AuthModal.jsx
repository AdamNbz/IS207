"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext"; // 1. Import Context

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAppContext(); // 2. Lấy hàm login từ Context

  // authState bao gồm: 'Login', 'Register', 'Forgot', 'OTP', 'ResetPassword'
  const [authState, setAuthState] = useState("Login");
  const [show, setShow] = useState(false);
  
  // 3. State lưu dữ liệu nhập vào
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State cho bộ đếm ngược OTP
  const [timer, setTimer] = useState(60);

  // Animation mở modal & Reset form
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
      setAuthState("Login");
      // Reset input khi mở lại modal (tuỳ chọn)
      setEmail("");
      setPassword("");
      setName("");
    } else {
      setShow(false);
    }
  }, [isOpen]);

  // Logic đếm ngược 60s
  useEffect(() => {
    let interval;
    if (authState === "OTP" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [authState, timer]);

  // Hàm xử lý gửi lại mã
  const handleResendOtp = () => {
    setTimer(60);
    console.log("Đã gửi lại mã...");
  };

  // --- HÀM XỬ LÝ SUBMIT (QUAN TRỌNG NHẤT) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Xử lý Đăng nhập
    if (authState === "Login") {
      const isSuccess = login(email, password); // Gọi hàm login bên Context
      
      if (isSuccess) {
        alert("Đăng nhập thành công!");
        onClose(); // Đóng modal
      } else {
        alert("Sai email hoặc mật khẩu! (Gợi ý: admin/admin)");
      }
    } 
    // 2. Xử lý Đăng ký (Giả lập)
    else if (authState === "Register") {
      alert("Đăng ký thành công (Demo)!");
      setAuthState("Login");
    } 
    // 3. Logic Quên mật khẩu (Giả lập chuyển trang)
    else if (authState === "Forgot") {
      setTimer(60);
      setAuthState("OTP");
    } else if (authState === "OTP") {
      setAuthState("ResetPassword");
    } else if (authState === "ResetPassword") {
      alert("Đổi mật khẩu thành công!");
      setAuthState("Login");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Box */}
      <div
        className={`
          relative bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md 
          transform transition-all duration-300
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        {/* --- TITLE DYNAMIC --- */}
        <h2 className="text-2xl font-bold text-center mb-6">
          {authState === "Login" && "Đăng nhập"}
          {authState === "Register" && "Đăng ký"}
          {authState === "Forgot" && "Quên mật khẩu"}
          {authState === "OTP" && "Nhập mã xác nhận"}
          {authState === "ResetPassword" && "Đặt lại mật khẩu"}
        </h2>

        {/* --- FORM --- */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          {/* 1. HỌ TÊN (Chỉ hiện khi Register) */}
          {authState === "Register" && (
            <div>
              <label className="text-sm font-medium text-gray-600">Họ và tên</label>
              <input 
                type="text" 
                placeholder="Nhập họ tên" 
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* 2. EMAIL (Login, Register, Forgot) */}
          {["Login", "Register", "Forgot"].includes(authState) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input 
                type="text" // đổi thành text để dễ nhập admin, nếu muốn strict thì để email
                placeholder="Nhập email (admin)" 
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {/* 3. MẬT KHẨU CŨ (Login, Register) */}
          {["Login", "Register"].includes(authState) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Mật khẩu</label>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu (admin)" 
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {/* 4. INPUT MÃ OTP (Chỉ hiện khi OTP) */}
          {authState === "OTP" && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Mã xác thực đã được gửi đến email của bạn.</p>
              <input 
                type="text" 
                placeholder="Nhập mã 6 số" 
                className="auth-input text-center text-xl tracking-widest font-bold" 
                maxLength={6}
              />
              {/* Đếm ngược & Gửi lại */}
              <div className="mt-2 text-sm">
                {timer > 0 ? (
                  <span className="text-gray-400">Gửi lại sau {timer}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    className="text-orange-500 font-semibold hover:underline"
                  >
                    Gửi lại mã
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 5. MẬT KHẨU MỚI (Chỉ hiện khi ResetPassword) */}
          {authState === "ResetPassword" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">Mật khẩu mới</label>
                <input type="password" placeholder="Nhập mật khẩu mới" className="auth-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Xác nhận mật khẩu</label>
                <input type="password" placeholder="Nhập lại mật khẩu" className="auth-input" />
              </div>
            </>
          )}

          {/* Link quên mật khẩu (Chỉ Login) */}
          {authState === "Login" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAuthState("Forgot")}
                className="text-sm text-orange-500 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          {/* --- MAIN BUTTON --- */}
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition mt-2"
          >
            {authState === "Login" && "Đăng nhập"}
            {authState === "Register" && "Đăng ký"}
            {authState === "Forgot" && "Gửi yêu cầu"}
            {authState === "OTP" && "Đặt lại mật khẩu"} 
            {authState === "ResetPassword" && "Hoàn tất"}
          </button>
        </form>

        {/* --- FOOTER NAVIGATION --- */}
        <div className="mt-5 text-sm text-center text-gray-600">
          
          {/* Login <-> Register */}
          {authState === "Login" && (
            <p>Chưa có tài khoản? <button onClick={() => setAuthState("Register")} className="link-text">Đăng ký ngay</button></p>
          )}
          {authState === "Register" && (
            <p>Đã có tài khoản? <button onClick={() => setAuthState("Login")} className="link-text">Đăng nhập ngay</button></p>
          )}

          {/* Nút quay lại Login cho các trang phụ */}
          {["Forgot", "OTP", "ResetPassword"].includes(authState) && (
            <button
              onClick={() => setAuthState("Login")}
              className="text-gray-500 hover:text-black font-semibold hover:underline flex items-center justify-center gap-1 w-full"
            >
              ← Quay lại đăng nhập
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          border-radius: 8px;
          margin-top: 4px;
          outline: none;
        }
        .auth-input:focus {
          box-shadow: 0 0 0 2px #f97316;
        }
        .link-text {
          color: #f97316;
          font-weight: 600;
        }
        .link-text:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;