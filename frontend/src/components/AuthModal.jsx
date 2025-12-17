"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import Image from "next/image";
// 1. IMPORT TOAST
import { toast } from "react-toastify"; 

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAppContext();
  const [authState, setAuthState] = useState("Login");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
      setAuthState("Login");
      setEmail("");
      setPassword("");
      setName("");
    } else {
      setShow(false);
    }
  }, [isOpen]);

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

  const handleResendOtp = () => {
    setTimer(60);
    // Thay console.log bằng toast info
    toast.info("Đã gửi lại mã xác nhận vào email!"); 
  };

  // --- HÀM XỬ LÝ SUBMIT ĐÃ SỬA ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Xử lý Đăng nhập
    if (authState === "Login") {
      const isSuccess = login(email, password);
      
      if (isSuccess) {
        // THÔNG BÁO THÀNH CÔNG (Màu xanh)
        toast.success("🎉 Đăng nhập thành công! Chào mừng bạn quay lại.");
        onClose(); 
      } else {
        // THÔNG BÁO LỖI (Màu đỏ)
        toast.error("❌ Sai email hoặc mật khẩu! Vui lòng thử lại.");
      }
    } 
    // 2. Xử lý Đăng ký
    else if (authState === "Register") {
      toast.success("Đăng ký tài khoản thành công! Hãy đăng nhập.");
      setAuthState("Login");
    } 
    // 3. Logic Quên mật khẩu
    else if (authState === "Forgot") {
      toast.info("Mã OTP đã được gửi đến email của bạn.");
      setTimer(60);
      setAuthState("OTP");
    } else if (authState === "OTP") {
      toast.success("Xác thực thành công!");
      setAuthState("ResetPassword");
    } else if (authState === "ResetPassword") {
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setAuthState("Login");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`
          relative bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md 
          transform transition-all duration-300
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {authState === "Login" && "Đăng nhập"}
          {authState === "Register" && "Đăng ký"}
          {authState === "Forgot" && "Quên mật khẩu"}
          {authState === "OTP" && "Nhập mã xác nhận"}
          {authState === "ResetPassword" && "Đặt lại mật khẩu"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
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

          {["Login", "Register", "Forgot"].includes(authState) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input 
                type="text"
                placeholder="Nhập email (admin)" 
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

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

          {authState === "OTP" && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Mã xác thực đã được gửi đến email của bạn.</p>
              <input 
                type="text" 
                placeholder="Nhập mã 6 số" 
                className="auth-input text-center text-xl tracking-widest font-bold" 
                maxLength={6}
              />
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

        <div className="mt-5 text-sm text-center text-gray-600">
          {authState === "Login" && (
            <p>Chưa có tài khoản? <button onClick={() => setAuthState("Register")} className="link-text">Đăng ký ngay</button></p>
          )}
          {authState === "Register" && (
            <p>Đã có tài khoản? <button onClick={() => setAuthState("Login")} className="link-text">Đăng nhập ngay</button></p>
          )}

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