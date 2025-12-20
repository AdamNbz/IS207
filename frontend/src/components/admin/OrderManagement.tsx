"use client";

import React, { useState, useEffect } from "react";

// ==================== TYPES ====================
// Định nghĩa kiểu dữ liệu cho đơn hàng

type OrderStatus = "pending" | "processing" | "shipping" | "completed" | "cancelled";

type OrderDetail = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    thumbnail?: string;
  };
};

type Order = {
  id: number;
  user_id: number | null;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  note: string | null;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  coupon_code: string | null;
  payment_method: string;
  payment_status: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order_details?: OrderDetail[];
  details?: OrderDetail[];
  orderDetails?: OrderDetail[];
};

// Cấu hình màu sắc và label cho từng trạng thái
const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Chờ xử lý", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  processing: { label: "Đang chuẩn bị", color: "text-blue-700", bgColor: "bg-blue-100" },
  shipping: { label: "Đang giao", color: "text-purple-700", bgColor: "bg-purple-100" },
  completed: { label: "Đã giao", color: "text-green-700", bgColor: "bg-green-100" },
  cancelled: { label: "Đã huỷ", color: "text-red-700", bgColor: "bg-red-100" },
};

// URL của Backend API
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ==================== COMPONENT CHÍNH ====================
export default function OrderManagement() {
  // ========== STATE ==========
  // Danh sách đơn hàng
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Bộ lọc
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Chi tiết đơn hàng (modal)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // ========== API FUNCTIONS ==========

  /**
   * API 1: GET /api/admin/orders
   * Lấy danh sách đơn hàng với bộ lọc
   */
  async function fetchOrders(page: number = 1) {
    setLoading(true);
    setError("");

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("admin_token");

      // Tạo query params cho bộ lọc
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (filterStatus) params.append("status", filterStatus);
      if (filterDateFrom) params.append("date_from", filterDateFrom);
      if (filterDateTo) params.append("date_to", filterDateTo);

      // Gọi API
      const response = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: Không thể tải danh sách đơn hàng`);
      }

      const data = await response.json();

      // Cập nhật state
      setOrders(data.data || []);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMessage);
      console.error("Lỗi fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * API 2: GET /api/admin/orders/{id}
   * Lấy chi tiết 1 đơn hàng
   */
  async function fetchOrderDetail(orderId: number) {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải chi tiết đơn hàng");
      }

      const order: Order = await response.json();
      setSelectedOrder(order);
      setShowDetail(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /**
   * API 3: PUT /api/admin/orders/{id}/status
   * Cập nhật trạng thái đơn hàng
   */
  async function updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    if (!confirm(`Xác nhận đổi trạng thái thành "${ORDER_STATUS_CONFIG[newStatus].label}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }

      // Refresh danh sách sau khi cập nhật
      await fetchOrders(currentPage);

      // Cập nhật modal nếu đang mở
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      alert("✅ Cập nhật trạng thái thành công!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      alert("❌ " + errorMessage);
    }
  }

  // ========== EFFECTS ==========
  // Load dữ liệu khi component mount hoặc filter thay đổi
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, filterStatus, filterDateFrom, filterDateTo]);

  // ========== HELPER FUNCTIONS ==========
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setCurrentPage(1);
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📦 Quản lý Đơn hàng</h2>
          <p className="text-gray-500">Tổng cộng: {total} đơn hàng</p>
        </div>
        <button
          onClick={() => fetchOrders(currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* ===== BỘ LỌC ===== */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">🔍 Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Lọc theo trạng thái */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Tất cả --</option>
              {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo ngày bắt đầu */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Lọc theo ngày kết thúc */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Nút reset */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Xoá bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* ===== HIỂN THỊ LỖI ===== */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* ===== LOADING ===== */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Đang tải...</p>
        </div>
      )}

      {/* ===== BẢNG DANH SÁCH ĐƠN HÀNG ===== */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Mã ĐH</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">SĐT</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Thanh toán</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ngày đặt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    📭 Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConfig = ORDER_STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">#{order.id}</td>
                      <td className="px-4 py-3">{order.customer_name}</td>
                      <td className="px-4 py-3">{order.customer_phone}</td>
                      <td className="px-4 py-3 font-semibold text-orange-600">
                        {formatMoney(order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{order.payment_method}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchOrderDetail(order.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                        >
                          👁 Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== PHÂN TRANG ===== */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            ← Trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {lastPage}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
            disabled={currentPage === lastPage}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Sau →
          </button>
        </div>
      )}

      {/* ===== MODAL CHI TIẾT ĐƠN HÀNG ===== */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">📋 Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-6">
              {/* Thông tin khách hàng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">👤 Thông tin khách hàng</h4>
                  <p><strong>Tên:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>SĐT:</strong> {selectedOrder.customer_phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || "Khách vãng lai"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📍 Địa chỉ giao hàng</h4>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.city}</p>
                  {selectedOrder.note && (
                    <p className="mt-2 text-sm text-gray-500">
                      <strong>Ghi chú:</strong> {selectedOrder.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h4 className="font-semibold mb-3">🛒 Sản phẩm đã đặt</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm">Sản phẩm</th>
                        <th className="px-4 py-2 text-center text-sm">SL</th>
                        <th className="px-4 py-2 text-right text-sm">Đơn giá</th>
                        <th className="px-4 py-2 text-right text-sm">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.details?.map((detail) => (
                        <tr key={detail.id}>
                          <td className="px-4 py-3 flex items-center gap-3">
                            {detail.product?.thumbnail && (
                              <img
                                src={
                                  detail.product.thumbnail.startsWith("http")
                                    ? detail.product.thumbnail
                                    : `http://localhost:8001${detail.product.thumbnail}`
                                }
                                alt={detail.product?.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <span>{detail.product?.name || `SP #${detail.product_id}`}</span>
                          </td>
                          <td className="px-4 py-3 text-center">{detail.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(detail.price)}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatMoney(detail.price * detail.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span>Tạm tính:</span>
                  <span>{formatMoney(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Phí vận chuyển:</span>
                  <span>{formatMoney(selectedOrder.shipping_fee)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between mb-1 text-green-600">
                    <span>Giảm giá {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}:</span>
                    <span>-{formatMoney(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-orange-600">{formatMoney(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {/* Cập nhật trạng thái */}
              <div>
                <h4 className="font-semibold mb-3">🔄 Cập nhật trạng thái</h4>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).map((status) => {
                    const config = ORDER_STATUS_CONFIG[status];
                    const isCurrentStatus = selectedOrder.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={isCurrentStatus}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          isCurrentStatus
                            ? `${config.bgColor} ${config.color} border-current font-bold cursor-default`
                            : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {config.label}
                        {isCurrentStatus && " ✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
