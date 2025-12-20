"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import Image from "next/image";
import AuthModal from "./AuthModal";
import axios from "axios"; // 1. Import axios

const API_URL = "http://127.0.0.1:8000/api"; // Định nghĩa API URL

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // 2. State lưu kết quả tìm kiếm
  const [showDropdown, setShowDropdown] = useState(false); // 3. State hiển thị dropdown
  const [isSearching, setIsSearching] = useState(false); // State loading khi tìm

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("Login");
  const { router, getCartCount, userData, logout } = useAppContext();
  
  // Ref để xử lý click ra ngoài thì đóng dropdown
  const searchRef = useRef(null);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // 4. Xử lý tìm kiếm LIVE (Debounce)
  useEffect(() => {
    // Hàm gọi API
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        // Giả sử API của bạn hỗ trợ ?search= hoặc ?keyword=
        // Nếu API lọc theo name, cấu trúc thường là: Product::where('name', 'like', "%$request->search%")->get();
        const res = await axios.get(`${API_URL}/products?search=${searchQuery}`);
        
        // Lấy data (tuỳ vào cấu trúc response của Laravel trả về: res.data hoặc res.data.data)
        const products = res.data.data || res.data || [];
        setSearchResults(products);
        setShowDropdown(true);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Tạo độ trễ 500ms (Debounce) để không gọi API liên tục khi đang gõ
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 1) { // Chỉ tìm khi gõ trên 1 ký tự
        fetchSearchResults();
      } else {
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Xử lý khi bấm Enter (Vẫn chuyển sang trang tìm kiếm đầy đủ)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false); // Đóng dropdown
    router.push(`/all-products?search=${searchQuery}`);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 fixed top-0 left-0 w-full z-50 bg-white">
      {/* Logo */}
      <Image
        className="cursor-pointer w-12 md:w-12 rounded-lg"
        onClick={() => router.push("/")}
        src="/images/logo.jpg"
        alt="logo"
        width={100}
        height={100}
      />

      {/* Links (Desktop) */}
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">Trang chủ</Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">Sản phẩm</Link>
        <Link href="/about" className="hover:text-gray-900 transition">Về chúng tôi</Link>
        <Link href="/" className="hover:text-gray-900 transition">Liên hệ</Link>
      </div>

      {/* Search + User + Cart (Desktop) */}
      <div className="hidden md:flex items-center gap-4">
        
        {/* === 5. KHU VỰC TÌM KIẾM === */}
        <div className="relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowDropdown(true)} // Hiện lại khi click vào ô input
              placeholder="Tìm kiếm..."
              className="border rounded-full px-4 py-1.5 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500 w-60"
            />
            <Image
              src="/images/search_icon.svg"
              alt="search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              width={16}
              height={16}
            />
          </form>

          {/* DROPDOWN KẾT QUẢ */}
          {showDropdown && (
            <div className="absolute top-full left-0 w-80 bg-white border border-gray-200 shadow-xl rounded-lg mt-2 max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-sm">Đang tìm...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((product) => (
                    <li key={product.id} className="border-b last:border-none hover:bg-gray-50 transition">
                      <Link 
                        href={`/product/${product.id}`} // Đường dẫn tới chi tiết sản phẩm
                        className="flex items-center gap-3 p-3"
                        onClick={() => setShowDropdown(false)} // Đóng khi click
                      >
                        {/* Ảnh nhỏ sản phẩm */}
                        <div className="w-10 h-10 relative flex-shrink-0 border rounded overflow-hidden">
                           <Image 
                             src={product.thumbnail || "/images/default-product.png"} // Hình mặc định nếu ko có thumbnail
                             alt={product.name}
                             fill
                             className="object-cover"
                           />
                        </div>
                        {/* Tên và giá */}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800 line-clamp-1" title={product.name}>
                            {product.name}
                          </span>
                          <span className="text-xs text-orange-600 font-semibold">
                            {Number(product.price).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {/* Nút xem tất cả */}
                  <li className="p-2 text-center bg-gray-50">
                     <button 
                        onClick={handleSearchSubmit}
                        className="text-xs text-blue-600 hover:underline"
                     >
                        Xem tất cả kết quả cho "{searchQuery}"
                     </button>
                  </li>
                </ul>
              ) : (
                // Thông báo không tìm thấy
                <div className="p-4 text-center text-gray-500 text-sm">
                  <p>😔 Không tìm thấy sản phẩm nào</p>
                  <p className="text-xs mt-1">Hãy thử từ khóa khác</p>
                </div>
              )}
            </div>
          )}
        </div>
        {/* === KẾT THÚC KHU VỰC TÌM KIẾM === */}

        {/* User Account Section */}
        <div className="flex items-center gap-2">
          <Image src="/images/user_icon.svg" alt="user" width={24} height={24} className="flex-shrink-0" />
          <div className="flex items-center gap-1 text-gray-700 font-medium">
            {userData ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="text-base font-bold text-orange-600 hover:underline">
                  {userData.name || userData.email || "Tài khoản"}
                </Link>
                <span className="text-gray-300">|</span>
                <button onClick={logout} className="text-base text-gray-500 hover:text-red-500">Đăng xuất</button>
              </div>
            ) : (
              <>
                <button onClick={() => openAuthModal("Login")} className="hover:text-gray-900 transition">Đăng nhập</button>
                <span>|</span>
                <button onClick={() => openAuthModal("Register")} className="hover:text-gray-900 transition">Đăng ký</button>
              </>
            )}
          </div>
        </div>

        {/* Cart Icon */}
        <button onClick={() => router.push('/cart')} className="relative flex items-center">
          <Image src="/images/cart_icon.svg" alt="cart icon" className="w-6 h-6" width={24} height={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {getCartCount()}
          </span>
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center md:hidden gap-4">
        <button onClick={() => router.push('/cart')} className="relative flex items-center">
          <Image src="/images/cart_icon.svg" alt="cart icon" className="w-6 h-6" width={24} height={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {getCartCount()}
          </span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
    </nav>
  );
};

export default Navbar;