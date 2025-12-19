"use client";
import React, { useState, useEffect, Suspense } from "react"; // Thêm Suspense để tránh lỗi build Next.js với useSearchParams
import Image from "next/image";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter, useSearchParams } from "next/navigation"; // 👉 Import useSearchParams
import { useAppContext } from "@/context/AppContext";

const API_URL = "http://127.0.0.1:8000/api";

// Tách component nội dung chính ra để bọc trong Suspense (Bắt buộc với Next.js 13+ khi dùng useSearchParams)
const CheckoutContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData } = useAppContext();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👉 MỚI: Lấy danh sách ID từ URL
  // Nếu URL là /place-order?items=[1,2] thì selectedIds = [1, 2]
  const itemsParam = searchParams.get('items');
  const selectedIds = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    shipping_address: "",
    city: "",
    note: "",
    payment_method: "COD"
  });

  const [subtotal, setSubtotal] = useState(0);
  const shippingFee = 30000;

  // --- 1. LẤY DỮ LIỆU GIỎ HÀNG ---
  const fetchCartData = async () => {
    // Nếu không có ID nào được chọn thì đá về Cart
    if (!selectedIds || selectedIds.length === 0) {
        alert("Chưa chọn sản phẩm nào!");
        router.push("/cart");
        return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.items) {
        // 👉 QUAN TRỌNG: Chỉ lọc lấy những item user ĐÃ CHỌN để hiển thị
        const filteredItems = res.data.items.filter(item => 
            selectedIds.includes(item.product_id)
        );

        setCartItems(filteredItems);
        
        // Tính tổng tiền dựa trên danh sách đã lọc
        const total = filteredItems.reduce((sum, item) => {
          return sum + (item.product?.price || 0) * item.quantity;
        }, 0);
        setSubtotal(total);
      }
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. XỬ LÝ NHẬP FORM ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- 3. GỬI ĐƠN HÀNG ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      // Tạo payload gửi đi
      const payload = {
          ...formData,
          selected_product_ids: selectedIds // 👉 QUAN TRỌNG: Gửi kèm danh sách ID cho Backend xử lý
      };

      const response = await axios.post(
        `${API_URL}/checkout`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        alert("🎉 Đặt hàng thành công! Mã đơn: " + response.data.order_id);
        router.push("/"); 
      }

    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra!";
      alert("❌ " + msg);
    } finally {
      setLoading(false);
    }
  };

  // Util
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  useEffect(() => {
    fetchCartData();
    if (userData) {
      setFormData(prev => ({
        ...prev,
        customer_name: userData.name || "",
        customer_phone: userData.phone || "",
        shipping_address: userData.address || "",
      }));
    }
  }, [userData]); // Bỏ qua warning missing deps nếu muốn chạy 1 lần logic này

  if (loading) return <div className="min-h-screen pt-32 text-center">Đang xử lý dữ liệu...</div>;

  return (
        <div className="px-4 md:px-16 lg:px-32 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-orange-500">💳</span> Thanh Toán
          </h1>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cột Trái: Form nhập liệu (Giữ nguyên code cũ) */}
            <div className="lg:col-span-2 space-y-6">
               {/* ... Phần nhập địa chỉ và phương thức thanh toán giữ nguyên như code trước ... */}
               {/* Copy lại đoạn HTML Form từ câu trả lời trước dán vào đây */}
               {/* Để ngắn gọn mình giả định phần này bạn đã có */}
               <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">📍 Thông tin nhận hàng</h2>
                    <div className="grid gap-4">
                        <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleInputChange} className="border p-2 rounded" placeholder="Họ tên" />
                        <input type="text" name="customer_phone" required value={formData.customer_phone} onChange={handleInputChange} className="border p-2 rounded" placeholder="Số điện thoại" />
                        <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="border p-2 rounded" placeholder="Tỉnh/Thành phố" />
                        <input type="text" name="shipping_address" required value={formData.shipping_address} onChange={handleInputChange} className="border p-2 rounded" placeholder="Địa chỉ chi tiết" />
                        <textarea name="note" value={formData.note} onChange={handleInputChange} className="border p-2 rounded" placeholder="Ghi chú"></textarea>
                    </div>
               </div>

               <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Phương thức thanh toán</h2>
                    <div className="space-y-3">
                         {/* Radio buttons giống hệt câu trả lời trước */}
                         <label className="flex items-center gap-2"><input type="radio" name="payment_method" value="COD" checked={formData.payment_method === 'COD'} onChange={handleInputChange} /> COD</label>
                         <label className="flex items-center gap-2"><input type="radio" name="payment_method" value="MOMO" checked={formData.payment_method === 'MOMO'} onChange={handleInputChange} /> Momo</label>
                         <label className="flex items-center gap-2"><input type="radio" name="payment_method" value="VNPAY" checked={formData.payment_method === 'VNPAY'} onChange={handleInputChange} /> VNPay</label>
                    </div>
               </div>
            </div>

            {/* Cột Phải: Tóm tắt đơn hàng (Hiển thị list filteredItems) */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow sticky top-28">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">📦 Đơn hàng của bạn</h2>
                
                {/* List sản phẩm đã lọc */}
                <div className="max-h-60 overflow-y-auto pr-2 space-y-3 mb-4 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 relative">
                         <Image
                            src={item.product?.thumbnail || "/placeholder.jpg"} 
                            alt="Product"
                            fill
                            className="object-cover rounded"
                          />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 line-clamp-2">{item.product?.name}</p>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>x {item.quantity}</span>
                          <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">{formatPrice(shippingFee)}</span>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">Tổng tiền:</span>
                  <span className="font-bold text-xl text-orange-600">
                    {formatPrice(subtotal + shippingFee)}
                  </span>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "ĐẶT HÀNG"}
                </button>
              </div>
            </div>

          </form>
        </div>
  );
};

// Component chính bao bọc bởi Navbar, Footer và Suspense
const PlaceOrderPage = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-10">
                <Suspense fallback={<div className="text-center pt-20">Đang tải...</div>}>
                    <CheckoutContent />
                </Suspense>
            </div>
            <Footer />
        </>
    )
}

export default PlaceOrderPage;