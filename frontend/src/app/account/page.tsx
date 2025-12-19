"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext"; // 👉 Import Context
import Link from "next/link";
import { useRouter } from "next/navigation";

const AccountPage = () => {
  // 👉 SỬA 1: Lấy userData thật và hàm logout từ Context
  const { userData, setUserData, logout, router } = useAppContext();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 👉 SỬA 2: Tạo state riêng để chứa dữ liệu đang chỉnh sửa (tránh sửa trực tiếp vào userData gốc khi chưa Lưu)
  const [localData, setLocalData] = useState({
    name: "",
    phone: "",
    gender: "male",
    birthday: "",
    address: "",
    email: "",
  });

  // 👉 SỬA 3: Khi userData từ Context tải xong, cập nhật nó vào localData để hiển thị
  useEffect(() => {
    if (userData) {
      setLocalData({
        name: userData.name || "",
        phone: userData.phone || "",
        gender: userData.gender || "male",
        birthday: userData.birthday || "",
        address: userData.address || "",
        email: userData.email || "",
      });
    } else {
        // Nếu chưa đăng nhập mà vào trang này -> đẩy về login
        // router.push('/login'); 
    }
  }, [userData]);

  // 👉 SỬA 4: Hàm xử lý đăng xuất dùng từ Context
  const handleLogout = () => {
    logout(); 
  };

  // Hàm xử lý lưu thay đổi (Tạm thời cập nhật state, sau này bạn gọi API ở đây)
  const handleSaveInfo = async () => {
      // 1. Gọi API cập nhật thông tin lên Server ở đây...
      // 2. Nếu thành công, cập nhật lại Context:
      setUserData({...userData, ...localData});
      setIsEditing(false);
      alert("Đã cập nhật thông tin (Demo)");
  };
  //@ts-ignore
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Tránh lỗi NaN nếu dateStr không hợp lệ
    if (isNaN(date.getTime())) return dateStr; 
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // 👉 THÊM: Nếu chưa có userData (đang load), hiện màn hình chờ để tránh lỗi
  if (!userData) {
      return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center">
                <p>Đang tải thông tin...</p>
            </div>
            <Footer />
        </>
      )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-6 md:px-16 lg:px-32 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar bên trái */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-blue-100 rounded-lg p-6">
              {/* 👉 Hiện tên thật */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6 truncate">
                {userData.name || "Khách hàng"}
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === "profile"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  Tài khoản của tôi
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === "orders"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  Lịch sử mua hàng
                </button>
              </div>
              
              {/* 👉 Nút đăng xuất đã sửa */}
              <button
                onClick={handleLogout}
                className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg transition w-full"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-8">
                  Thông tin cá nhân
                </h3>
                <div className="space-y-6">
                  {/* Họ tên */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={localData.name}
                        onChange={(e) =>
                          setLocalData({ ...localData, name: e.target.value })
                        }
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{localData.name}</span>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={localData.phone}
                        onChange={(e) =>
                          setLocalData({ ...localData, phone: e.target.value })
                        }
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800">{localData.phone}</span>
                    )}
                  </div>

                  {/* Giới tính */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">
                      Giới tính
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={localData.gender === "male"}
                          onChange={(e) =>
                            isEditing &&
                            setLocalData({ ...localData, gender: e.target.value })
                          }
                          disabled={!isEditing}
                          className="w-5 h-5 text-blue-500"
                        />
                        <span className="text-gray-800">Nam</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={localData.gender === "female"}
                          onChange={(e) =>
                            isEditing &&
                            setLocalData({ ...localData, gender: e.target.value })
                          }
                          disabled={!isEditing}
                          className="w-5 h-5 text-blue-500"
                        />
                        <span className="text-gray-800">Nữ</span>
                      </label>
                    </div>
                  </div>

                  {/* Ngày sinh */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">
                      Ngày sinh
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={localData.birthday}
                        onChange={(e) =>
                          setLocalData({ ...localData, birthday: e.target.value })
                        }
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800">
                        {formatDate(localData.birthday)}
                      </span>
                    )}
                  </div>

                  {/* Địa chỉ */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">
                      Địa chỉ mặc định
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={localData.address}
                        onChange={(e) =>
                          setLocalData({ ...localData, address: e.target.value })
                        }
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800">{localData.address}</span>
                    )}
                  </div>

                  {/* Mật khẩu (Chỉ hiện text ẩn) */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">
                      Mật khẩu
                    </label>
                    <div className="flex flex-col">
                      <span className="text-gray-800">******************</span>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="text-blue-600 hover:text-blue-800 underline text-left mt-1 font-medium text-sm"
                      >
                        Thay đổi mật khẩu
                      </button>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="pt-4">
                    {isEditing ? (
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveInfo}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-2.5 rounded-lg transition"
                        >
                          Lưu thay đổi
                        </button>
                        <button
                          onClick={() => {
                              setIsEditing(false);
                              // Reset lại data cũ nếu hủy
                              if (userData) setLocalData(userData);
                          }}
                          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-8 py-2.5 rounded-lg transition"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-2.5 rounded-lg transition"
                      >
                        Chỉnh sửa thông tin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-8">
                  Lịch sử mua hàng
                </h3>
                {/* Phần này tạm thời giữ nguyên UI cũ */}
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg">
                    Bạn chưa có đơn hàng nào
                  </p>
                  <Link
                    href="/all-products"
                    className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg transition"
                  >
                    Mua sắm ngay
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Đổi mật khẩu (Giữ nguyên UI, chưa có logic API) */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Thay đổi mật khẩu
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition">
                Xác nhận
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AccountPage;