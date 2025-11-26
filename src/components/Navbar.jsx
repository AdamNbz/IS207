"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import Image from "next/image";
import AuthModal from "./AuthModal";


const Navbar = () => {
  const { router } = useAppContext(); // chỉ lấy router
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/all-products?search=${searchQuery}`);
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      {/* Logo */}
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src="/images/logo.svg"
        alt="logo"
        width={128}
        height={32}
      />

      {/* Links (Desktop) */}
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
        <Link href="/" className="hover:text-gray-900 transition">
          Địa chỉ liên hệ
        </Link>
        <Link href="/support" className="hover:text-gray-900 transition">
          Chính sách
        </Link>
      </div>

      {/* Search + User + Cart (Desktop) */}
      <div className="hidden md:flex items-center gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="border rounded-full px-4 py-1.5 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Image
            src="/images/search_icon.svg"
            alt="search icon"
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            width={16}
            height={16}
          />
        </form>

        {/* User Account */}
        <div className="flex items-center gap-2">
          {/* User Icon */}
          <Image
            src="/images/user_icon.svg"
            alt="user icon"
            width={24}
            height={24}
            className="flex-shrink-0"
          />

          {/* Đăng nhập / Đăng ký */}
          <div className="flex items-center gap-1 text-gray-700 text-sm font-medium">
            <button
              onClick={() => setIsAuthOpen(true)}
              // onClick={() => console.log("Đăng nhập")}
              className="hover:text-gray-900 transition"
            >
              Đăng nhập
            </button>
            <span>|</span>
            <button
              onClick={() => setIsAuthOpen(true)}
              // onClick={() => console.log("Đăng ký")}
              className="hover:text-gray-900 transition"
            >
              Đăng ký
            </button>
          </div>
        </div>

        {/* Cart Icon */}
        <button className="relative flex items-center">
          <Image
            src="/images/cart_icon.svg"
            alt="cart icon"
            className="w-6 h-6"
            width={24}
            height={24}
          />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>
      </div>

      {/* Mobile icons */}
      <div className="flex items-center md:hidden gap-3">
        <button 
        onClick={() => setIsAuthOpen(true)}
        className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image
            src="/images/user_icon.svg"
            alt="user icon"
            width={24}
            height={24}
          />
          Đăng nhập Đăng ký
        </button>
        <button className="relative flex items-center">
          <Image
            src="/images/cart_icon.svg"
            alt="cart icon"
            className="w-6 h-6"
            width={24}
            height={24}
          />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
};

export default Navbar;
