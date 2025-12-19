"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import Image from "next/image";
// 1. IMPORT TOAST
import { toast } from "react-toastify"; 

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAppContext(); // Không cần dùng hàm register của context nữa vì ta tự gọi API

  // State màn hình
  const [authState, setAuthState] = useState("Login");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

  // Phân loại OTP: 'REGISTER' hay 'FORGOT'
  const [otpType, setOtpType] = useState("FORGOT");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP Logic
  //const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
      setAuthState("Login");
      // Reset form
      setEmail("");
      setPassword("");
      setName("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setShow(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (authState === "OTP" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) clearInterval(interval);
    return () => clearInterval(interval);
  }, [authState, timer]);

  // Notification
  const showNotification = (message, type = "info") => {
    let color = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#2563eb";
    const old = document.getElementById("custom-notify");
    if (old) old.remove();
    const div = document.createElement("div");
    div.id = "custom-notify";
    div.innerText = message;
    Object.assign(div.style, {
      position: "fixed",
      top: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      background: color,
      color: "#fff",
      padding: "12px 24px",
      borderRadius: "8px",
      fontWeight: "bold",
      fontSize: "16px",
      zIndex: 9999,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    });
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  };

  // --- API HANDLERS ---

  // 1. Gửi OTP (Dùng chung logic fetch, nhưng khác URL)
  const handleSendOtp = async (type) => {
    if (!email) {
      showNotification("Vui lòng nhập email!", "error");
      return false;
    }

    // Chọn API URL dựa trên loại hành động
    const url = type === "REGISTER" ? "http://localhost:8000/api/send-register-otp" : "http://localhost:8000/api/send-otp";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        showNotification(data.message, "success");
        setTimer(60);
        return true;
      } else {
        showNotification(data.message || "Không gửi được OTP", "error");
        return false;
      }
    } catch {
      showNotification("Lỗi kết nối server!", "error");
      return false;
    }
  };

  // 2. Xử lý nút "Gửi lại mã"
  const handleResendOtp = async () => {
    await handleSendOtp(otpType);
  };

  // 3. Xử lý logic khi bấm nút "Xác nhận" ở màn hình OTP
  const handleVerifyOtpAction = async () => {
    if (!otp) {
      showNotification("Vui lòng nhập mã OTP!", "error");
      return;
    }

    // A. Nếu là ĐĂNG KÝ -> Gọi API Register kèm OTP
    if (otpType === "REGISTER") {
      try {
        const res = await fetch("http://localhost:8000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, otp }),
        });
        const data = await res.json();

        if (res.ok) {
          showNotification("🎉 Đăng ký thành công!", "success");
          // Tự động đăng nhập luôn để cập nhật context
          await login(email, password);
          onClose();
        } else {
          showNotification(data.message || "Đăng ký thất bại, kiểm tra lại OTP!", "error");
        }
      } catch {
        showNotification("Lỗi kết nối server!", "error");
      }
    }
    // B. Nếu là QUÊN MẬT KHẨU -> Gọi API verify -> Chuyển sang Reset
    else {
      try {
        const res = await fetch("http://localhost:8000/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        if (res.ok) {
          showNotification("Xác thực thành công! Nhập mật khẩu mới.", "success");
          setAuthState("ResetPassword");
        } else {
          showNotification("Mã OTP sai hoặc hết hạn!", "error");
        }
      } catch {
        showNotification("Lỗi kết nối server!", "error");
      }
    }
  };

  // --- FORM SUBMIT CHÍNH ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Đăng nhập
    if (authState === "Login") {
      const isSuccess = await login(email, password);
      if (isSuccess) {
        showNotification("Đăng nhập thành công!", "success");
        onClose();
      } else {
        showNotification("Sai email hoặc mật khẩu!", "error");
      }
    }
    // 2. Đăng ký (Bước 1: Gửi OTP)
    else if (authState === "Register") {
      if (!name || !email || !password) {
        showNotification("Nhập đầy đủ thông tin!", "error");
        return;
      }
      // Gửi OTP Đăng ký
      const ok = await handleSendOtp("REGISTER");
      if (ok) {
        setOtpType("REGISTER"); // Đánh dấu là đang đăng ký
        setAuthState("OTP");
      }
    }
    // 3. Quên mật khẩu (Bước 1: Gửi OTP)
    else if (authState === "Forgot") {
      const ok = await handleSendOtp("FORGOT");
      if (ok) {
        setOtpType("FORGOT"); // Đánh dấu là đang quên pass
        setAuthState("OTP");
      }
    }
    // 4. Màn hình OTP (Nút Enter sẽ trigger verify)
    else if (authState === "OTP") {
      handleVerifyOtpAction();
    }
    // 5. Đổi mật khẩu mới
    else if (authState === "ResetPassword") {
      if (!newPassword || !confirmPassword) return showNotification("Nhập đầy đủ mật khẩu!", "error");
      if (newPassword !== confirmPassword) return showNotification("Mật khẩu không khớp!", "error");
      if (newPassword.length < 6) return showNotification("Mật khẩu quá ngắn!", "error");

      try {
        const res = await fetch("http://localhost:8000/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, password: newPassword }),
        });
        if (res.ok) {
          showNotification("Đổi mật khẩu thành công! Hãy đăng nhập.", "success");
          setAuthState("Login");
        } else {
          showNotification("Thất bại!", "error");
        }
      } catch {
        showNotification("Lỗi server!", "error");
      }
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
          {authState === "Register" && "Đăng ký tài khoản"}
          {authState === "Forgot" && "Quên mật khẩu"}
          {authState === "OTP" && "Xác thực OTP"}
          {authState === "ResetPassword" && "Đặt lại mật khẩu"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {authState === "Register" && (
            <div>
              <label className="text-sm font-medium text-gray-600">Họ và tên</label>
              <input type="text" placeholder="Nhập họ tên" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          {["Login", "Register", "Forgot"].includes(authState) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input type="text" placeholder="email@example.com" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}

          {["Login", "Register"].includes(authState) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Mật khẩu</label>
              <input type="password" placeholder="Nhập mật khẩu" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}

          {authState === "OTP" && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Mã OTP ({otpType === "REGISTER" ? "Đăng ký" : "Quên mật khẩu"}) đã gửi đến: <b>{email}</b>
              </p>
              <input type="text" placeholder="000000" className="auth-input text-center text-xl tracking-widest font-bold" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
              <div className="mt-2 text-sm flex flex-col gap-2 items-center">
                {timer > 0 ? (
                  <span className="text-gray-400">Gửi lại sau {timer}s</span>
                ) : (
                  <button type="button" onClick={handleResendOtp} className="text-orange-500 font-semibold hover:underline">
                    Gửi lại mã
                  </button>
                )}
                <button type="button" className="mt-2 bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-6 rounded-lg font-medium transition" onClick={handleVerifyOtpAction}>
                  {otpType === "REGISTER" ? "Hoàn tất đăng ký" : "Xác nhận"}
                </button>
              </div>
            </div>
          )}

          {authState === "ResetPassword" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">Mật khẩu mới</label>
                <input type="password" placeholder="Mật khẩu mới" className="auth-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Xác nhận</label>
                <input type="password" placeholder="Nhập lại mật khẩu" className="auth-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
              </div>
            </>
          )}

          {authState === "Login" && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setAuthState("Forgot")} className="text-sm text-orange-500 hover:underline">
                Quên mật khẩu?
              </button>
            </div>
          )}

          {/* Nút Submit chính (Ẩn ở OTP vì đã có nút riêng) */}
          {authState !== "OTP" && (
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition mt-2">
              {authState === "Login" && "Đăng nhập"}
              {authState === "Register" && "Tiếp tục"}
              {authState === "Forgot" && "Gửi OTP"}
              {authState === "ResetPassword" && "Đổi mật khẩu"}
            </button>
          )}
        </form>

        <div className="mt-5 text-sm text-center text-gray-600">
          {authState === "Login" && (
            <p>
              Chưa có tài khoản?{" "}
              <button onClick={() => setAuthState("Register")} className="link-text">
                Đăng ký ngay
              </button>
            </p>
          )}
          {authState === "Register" && (
            <p>
              Đã có tài khoản?{" "}
              <button onClick={() => setAuthState("Login")} className="link-text">
                Đăng nhập ngay
              </button>
            </p>
          )}
          {["Forgot", "OTP", "ResetPassword"].includes(authState) && (
            <button onClick={() => setAuthState("Login")} className="text-gray-500 hover:text-black font-semibold hover:underline flex items-center justify-center gap-1 w-full">
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