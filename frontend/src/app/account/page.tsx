"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";
import axios from "axios";

const AccountPage = () => {
  // 1. Context & Router
  const { userData, setUserData, logout } = useAppContext();

  // 2. Local State
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // State cho Đơn hàng
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // State cho Modal Chi tiết & Hủy đơn
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State Form chỉnh sửa thông tin cá nhân
  const [localData, setLocalData] = useState({
    name: "",
    phone: "",
    gender: "male",
    birthday: "",
    address: "",
    email: "",
  });

  // 3. Effects
  // Cập nhật localData khi có userData từ Context
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
    }
  }, [userData]);

  // Gọi API lấy đơn hàng khi bấm tab "orders"
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // 4. API Logic
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://127.0.0.1:8000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoadingOrders(false);
    }
  };
  //@ts-ignore
  const handleViewDetail = async (orderId) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`http://127.0.0.1:8000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(res.data);
    } catch (error) {
      alert("Không thể tải chi tiết đơn hàng");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };
  //@ts-ignore
  const handleCancelOrder = async (orderId) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://127.0.0.1:8000/api/orders/cancel/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Đã hủy đơn hàng thành công!");
      setShowDetailModal(false);
      fetchOrders(); // Load lại danh sách để cập nhật trạng thái
    } catch (error) {
      console.error(error);
      const err = error;
      //@ts-ignore
      alert(err.response?.data?.message || "Lỗi khi hủy đơn hàng");
    }
  };

  // 5. Helper Functions
  const handleLogout = () => {
    logout();
  };

  const handleSaveInfo = async () => {
    // TODO: Gọi API cập nhật thông tin user lên server ở đây
    setUserData({ ...userData, ...localData });
    setIsEditing(false);
    alert("Đã cập nhật thông tin (Demo)");
  };
  //@ts-ignore
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  //@ts-ignore
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  // Format ngày giờ chi tiết
  //@ts-ignore
  const formatDateTime = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; 
      return `${date.getHours()}:${date.getMinutes()} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  //@ts-ignore
  const translateStatus = (status) => {
    const map = {
      pending: "Đang xử lý",
      processing: "Đang đóng gói",
      shipping: "Đang giao hàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      unpaid: "Chưa thanh toán",
    };
    //@ts-ignore
    return map[status] || status;
  };
  //@ts-ignore
  const getStatusColor = (status) => {
    if (status === "completed") return "text-green-600 bg-green-100";
    if (status === "cancelled") return "text-red-600 bg-red-100";
    return "text-blue-600 bg-blue-100";
  };

  // 6. Loading View (Khi chưa có user data)
  if (!userData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Đang tải thông tin...</p>
        </div>
        <Footer />
      </>
    );
  }

  // 7. Render Chính
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-6 md:px-16 lg:px-32 pt-24 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* ================= SIDEBAR TRÁI ================= */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-blue-100 rounded-lg p-6">
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

              <button
                onClick={handleLogout}
                className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg transition w-full"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* ================= NỘI DUNG PHẢI ================= */}
          <div className="flex-1">
            
            {/* --- TAB 1: PROFILE --- */}
            {activeTab === "profile" && (
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-8">
                  Thông tin cá nhân
                </h3>
                <div className="space-y-6">
                  {/* Họ tên */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">Họ và tên</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={localData.name}
                        onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{localData.name}</span>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">Số điện thoại</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={localData.phone}
                        onChange={(e) => setLocalData({ ...localData, phone: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800">{localData.phone}</span>
                    )}
                  </div>

                  {/* Giới tính */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">Giới tính</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={localData.gender === "male"}
                          onChange={(e) => isEditing && setLocalData({ ...localData, gender: e.target.value })}
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
                          onChange={(e) => isEditing && setLocalData({ ...localData, gender: e.target.value })}
                          disabled={!isEditing}
                          className="w-5 h-5 text-blue-500"
                        />
                        <span className="text-gray-800">Nữ</span>
                      </label>
                    </div>
                  </div>

                  {/* Ngày sinh */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">Ngày sinh</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={localData.birthday}
                        onChange={(e) => setLocalData({ ...localData, birthday: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800">{formatDate(localData.birthday)}</span>
                    )}
                  </div>

                  {/* Địa chỉ */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">Địa chỉ mặc định</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={localData.address}
                        onChange={(e) => setLocalData({ ...localData, address: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800">{localData.address}</span>
                    )}
                  </div>

                  {/* Mật khẩu */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <label className="w-40 text-gray-700 font-medium">Mật khẩu</label>
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

            {/* --- TAB 2: ORDERS (LỊCH SỬ ĐƠN HÀNG) --- */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-lg p-6 shadow-sm min-h-[500px]">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                  Lịch sử đơn hàng
                </h3>

                {loadingOrders ? (
                  <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition bg-white">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-3 border-b border-gray-100 border-dashed">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800">Đơn #{order.id}</span>
                              <span className="text-xs text-gray-300">|</span>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(order.created_at)}
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit mt-2 md:mt-0 ${getStatusColor(order.status)}`}>
                            {translateStatus(order.status)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                            <span className="text-orange-600 font-bold text-lg">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewDetail(order.id)}
                            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium transition"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
                    <Link
                      href="/all-products"
                      className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg transition"
                    >
                      Mua sắm ngay
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===========================================
             MODAL 1: ĐỔI MẬT KHẨU
         =========================================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Thay đổi mật khẩu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Xác nhận mật khẩu mới</label>
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
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg transition">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================
             MODAL 2: CHI TIẾT ĐƠN HÀNG & HỦY ĐƠN
         =========================================== */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Chi tiết đơn hàng</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail || !selectedOrder ? (
                <div className="text-center py-10">Đang tải chi tiết...</div>
              ) : (
                <div className="space-y-6">
                  {/* Thông tin chung */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Mã đơn hàng</p>
                      <p className="font-bold text-gray-800">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày đặt</p>
                      <p className="font-bold text-gray-800">{formatDateTime(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Trạng thái</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                        {translateStatus(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Người nhận</p>
                      <p className="font-bold text-gray-800">
                        {selectedOrder.customer_name} - {selectedOrder.customer_phone}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Địa chỉ giao hàng</p>
                      <p className="text-gray-800">
                        {selectedOrder.shipping_address}, {selectedOrder.city}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Danh sách sản phẩm */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Sản phẩm</h4>
                      {/* @ts-ignore */}
                    {selectedOrder.details?.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded border relative flex-shrink-0 flex items-center justify-center overflow-hidden">
                           {/* Dùng thẻ img thường để tránh lỗi nếu chưa config domain ảnh trong next.config.js */}
                           <img 
                              src={item.product?.thumbnail || "/placeholder.jpg"} 
                              alt="product" 
                              className="w-full h-full object-cover"
                           />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.product?.name}</p>
                          <div className="flex justify-between mt-1 text-sm">
                            <span className="text-gray-500">x{item.quantity}</span>
                            <span className="font-medium text-gray-800">{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-100" />

                  {/* Tổng tiền */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển</span>
                      <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-orange-600 border-t pt-2 mt-2">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal (Chứa nút đóng và nút hủy) */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50"
              >
                Đóng
              </button>

              {/* CHỈ HIỆN NÚT HỦY KHI TRẠNG THÁI LÀ 'PENDING' */}
              {selectedOrder && selectedOrder.status === "pending" && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition shadow-sm"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AccountPage;