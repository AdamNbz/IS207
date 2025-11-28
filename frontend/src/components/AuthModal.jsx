"use client";
import React, { useState, useEffect } from "react";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [show, setShow] = useState(false);

  // Animation khi mở popup
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]">
      {/* Nhấn ra ngoài để đóng */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Box */}
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

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        {/* Form */}
        <form className="flex flex-col gap-4">
          {/* Only show full name when Register */}
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-600">Họ và tên</label>
              <input
                type="text"
                placeholder="Nhập họ tên"
                className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {/* Toggle login/register */}
        <p className="mt-5 text-sm text-center text-gray-600">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-500 font-semibold hover:underline"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
