"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext"; // Import Context
import Image from "next/image";
import AuthModal from "./AuthModal";

const Navbar = () => {
  // --- SỬA LỖI Ở ĐÂY ---
  // Lấy 'userData' thay vì 'user' để khớp với AppContext
  const { router, userData, logout } = useAppContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State cho menu mobile

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/all-products?search=${searchQuery}`);
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 bg-white relative">
      {/* 1. Logo */}
      <Image className="cursor-pointer w-28 md:w-32" onClick={() => router.push("/")} src="/images/logo.svg" alt="logo" width={128} height={32} />

      {/* 2. Links (Desktop) */}
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Trang chủ
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Sản phẩm
        </Link>
        <Link href="/about-us" className="hover:text-gray-900 transition">
          Về chúng tôi
        </Link>
        <Link href="/contact" className="hover:text-gray-900 transition">
          Liên hệ
        </Link>
      </div>

      {/* 3. Search + User + Cart (Desktop) */}
      <div className="hidden md:flex items-center gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="border rounded-full px-4 py-1.5 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500 w-60"
          />
          <Image src="/images/search_icon.svg" alt="search" className="absolute left-3 top-1/2 transform -translate-y-1/2" width={16} height={16} />
        </form>

        {/* User Account Section */}
        <div className="flex items-center gap-2">
          <Image src="/images/user_icon.svg" alt="user" width={24} height={24} className="flex-shrink-0" />

          <div className="flex items-center gap-1 text-gray-700 text-sm font-medium">
            {/* --- LOGIC HIỂN THỊ DESKTOP (Đã sửa biến userData) --- */}
            {userData ? (
              // Nếu ĐÃ đăng nhập
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-bold cursor-pointer" title={userData.email}>
                  {userData.name}
                </span>
                <span className="text-gray-300">|</span>
                <button onClick={logout} className="hover:text-red-500 transition font-normal">
                  Đăng xuất
                </button>
              </div>
            ) : (
              // Nếu CHƯA đăng nhập
              <>
                <button onClick={() => setIsAuthOpen(true)} className="hover:text-gray-900 transition">
                  Đăng nhập
                </button>
                <span>|</span>
                <button onClick={() => setIsAuthOpen(true)} className="hover:text-gray-900 transition">
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cart Icon */}
        <button className="relative flex items-center" onClick={() => router.push("/cart")}>
          <Image src="/images/cart_icon.svg" alt="cart" className="w-6 h-6" width={24} height={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </button>
      </div>

      {/* 4. Mobile Menu Button (Chỉ hiện trên Mobile) */}
      <div className="flex items-center md:hidden gap-4">
        {/* Icon giỏ hàng mobile */}
        <button className="relative flex items-center" onClick={() => router.push("/cart")}>
          <Image src="/images/cart_icon.svg" alt="cart" className="w-6 h-6" width={24} height={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </button>

        {/* Nút login nhanh mobile nếu chưa đăng nhập */}
        {!userData && (
          <button onClick={() => setIsAuthOpen(true)}>
            <Image src="/images/user_icon.svg" alt="user" width={24} height={24} />
          </button>
        )}

        {/* Nếu đã đăng nhập trên mobile, hiện Avatar hoặc nút logout tuỳ thiết kế, ở đây tạm ẩn menu hamburger */}
        {userData && <span className="text-orange-600 font-bold text-sm">{userData.name}</span>}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
};

export default Navbar;
