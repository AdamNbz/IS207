"use client";
import React, { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// --- Types (Định nghĩa kiểu dữ liệu khớp với DB của bạn) ---

interface Product {
  id: number;
  name: string;
  thumbnail?: string;
}

interface OrderDetail {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product; // Quan hệ với bảng products
}

interface Order {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: string;
  order_details?: OrderDetail[]; // Quan hệ với bảng order_details
}

interface Address {
  id: number;
  address_line: string;
  city: string;
  district: string;
  is_default: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  orders?: Order[];      // User có nhiều Order
  addresses?: Address[]; // User có nhiều Address
}

// --- Main Component ---

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State cho Modal xem chi tiết
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
      const data = await res.json();
      setUsers(data.data || []); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (id: number, action: 'lock' | 'promote' | 'revoke') => {
    if (!confirm("Bạn có chắc chắn muốn thực hiện hành động này?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/${action}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Thao tác thất bại");
      await fetchUsers();
      alert("Thành công!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Hàm mở Modal
  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Helper format tiền tệ
  const money = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  
  // Helper format ngày
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  // Helper màu trạng thái đơn hàng
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && users.length === 0) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden relative">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-700">Quản lý người dùng ({users.length})</h3>
        {/* <button onClick={fetchUsers} className="text-sm text-blue-600 hover:underline">Làm mới</button> */}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Tổng mua</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">#{user.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                    <div className="font-medium text-blue-600">{user.orders?.length || 0} đơn</div>
                </td>
                <td className="px-4 py-3">
                  {user.is_blocked ? (
                    <span className="text-red-600 font-medium text-xs">🚫 Bị khóa</span>
                  ) : (
                    <span className="text-blue-600 font-medium text-xs">✅ Hoạt động</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Nút Xem chi tiết mới */}
                    <button 
                      onClick={() => openDetailModal(user)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs border border-gray-300"
                    >
                      Xem chi tiết
                    </button>

                    {/* Các nút hành động cũ */}
                    {!user.is_blocked && (
                        <button onClick={() => handleAction(user.id, 'lock')} className="text-red-600 hover:bg-red-50 border border-red-200 px-2 py-1 rounded text-xs" title="Khóa">
                            Khóa
                        </button>
                    )}
                    {user.role === 'customer' ? (
                        <button onClick={() => handleAction(user.id, 'promote')} className="text-indigo-600 hover:bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-xs" title="Lên Admin">
                            ▲ Admin
                        </button>
                    ) : (
                        <button onClick={() => handleAction(user.id, 'revoke')} className="text-orange-600 hover:bg-orange-50 border border-orange-200 px-2 py-1 rounded text-xs" title="Xuống Khách">
                            ▼ Khách
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CHI TIẾT --- */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
            
            {/* Header Modal */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">Thông tin khách hàng: {selectedUser.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>

            {/* Content Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* 1. Thông tin chung */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">Thông tin liên hệ</h4>
                  <p className="text-sm">Email: {selectedUser.email}</p>
                  <p className="text-sm">SĐT: {selectedUser.phone || "Chưa cập nhật"}</p>
                  <p className="text-sm">Ngày tham gia: {formatDate(selectedUser.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">Sổ địa chỉ ({selectedUser.addresses?.length || 0})</h4>
                  <ul className="text-sm space-y-2 max-h-24 overflow-y-auto">
                    {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                      selectedUser.addresses.map(addr => (
                        <li key={addr.id} className="flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span className={addr.is_default ? "font-semibold text-gray-800" : "text-gray-600"}>
                            {addr.address_line}, {addr.district}, {addr.city}
                            {addr.is_default && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1 rounded">Mặc định</span>}
                          </span>
                        </li>
                      ))
                    ) : ( <li className="text-gray-500 italic">Chưa có địa chỉ</li> )}
                  </ul>
                </div>
              </div>

              {/* 2. Lịch sử đơn hàng */}
              <div>
                <h4 className="font-bold text-lg mb-3 border-b pb-2">Lịch sử đơn hàng ({selectedUser.orders?.length || 0})</h4>
                
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.orders.map((order) => (
                      <div key={order.id} className="border rounded-lg overflow-hidden">
                        {/* Order Header */}
                        <div className="bg-gray-100 px-4 py-2 flex flex-wrap justify-between items-center text-sm">
                          <div className="flex gap-4">
                            <span className="font-bold">Đơn #{order.id}</span>
                            <span className="text-gray-500">{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="font-bold text-orange-600">{money(order.total_amount)}</span>
                          </div>
                        </div>

                        {/* Order Details (Products) */}
                        <div className="p-3 bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-gray-500 text-xs border-b">
                                <th className="text-left py-1">Sản phẩm</th>
                                <th className="text-center py-1">SL</th>
                                <th className="text-right py-1">Giá</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.order_details && order.order_details.length > 0 ? (
                                order.order_details.map((detail) => (
                                  <tr key={detail.id} className="border-b last:border-0">
                                    <td className="py-2">
                                      <div className="font-medium text-gray-800">
                                        {detail.product ? detail.product.name : `Sản phẩm ID #${detail.product_id}`}
                                      </div>
                                    </td>
                                    <td className="py-2 text-center text-gray-600">x{detail.quantity}</td>
                                    <td className="py-2 text-right text-gray-600">{money(detail.price)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr><td colSpan={3} className="text-center py-2 text-gray-400 italic">Không có thông tin sản phẩm</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                    Khách hàng chưa mua đơn hàng nào.
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Modal */}
            <div className="p-4 border-t bg-gray-50 text-right">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}