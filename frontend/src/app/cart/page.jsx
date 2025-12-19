"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const API_URL = "http://127.0.0.1:8000/api";

const CartPage = () => {
  const router = useRouter();
  const { getUser } = useAppContext();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  // 👉 MỚI: State lưu danh sách ID các sản phẩm được tick chọn
  const [selectedIds, setSelectedIds] = useState([]);

  // --- 1. LẤY DỮ LIỆU ---
  const fetchCartData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("./");
        return;
      }

      const res = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.items) {
        setCartItems(res.data.items);
        
        // 👉 MỚI: Mặc định khi load trang sẽ tick chọn TẤT CẢ sản phẩm
        // Lưu ý: Logic này chạy 1 lần khi fetch data. 
        // Nếu bạn muốn giữ trạng thái chọn khi reload thì cần lưu vào localStorage, 
        // nhưng ở đây mình làm đơn giản là load lại thì chọn hết.
        const allIds = res.data.items.map(item => item.product_id);
        setSelectedIds(allIds);

      } else {
        setCartItems([]);
        setTotalAmount(0);
      }
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. TÍNH TỔNG TIỀN (SỬA LẠI) ---
  // 👉 MỚI: Dùng useEffect để tự động tính lại tiền mỗi khi [cartItems] hoặc [selectedIds] thay đổi
  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => {
      // Chỉ cộng tiền nếu sản phẩm nằm trong danh sách được chọn
      if (selectedIds.includes(item.product_id)) {
        const price = item.product?.price || 0;
        return sum + price * item.quantity;
      }
      return sum;
    }, 0);
    
    setTotalAmount(newTotal);
  }, [cartItems, selectedIds]);

  // --- 👉 MỚI: HÀM XỬ LÝ TICK CHỌN ---
  
  // Tick 1 sản phẩm
  const handleToggleItem = (productId) => {
    if (selectedIds.includes(productId)) {
      // Nếu đang chọn -> Bỏ chọn (Lọc bỏ ID ra khỏi mảng)
      setSelectedIds(selectedIds.filter(id => id !== productId));
    } else {
      // Nếu chưa chọn -> Thêm vào mảng
      setSelectedIds([...selectedIds, productId]);
    }
  };

  // Tick chọn tất cả / Bỏ chọn tất cả
  const handleToggleAll = () => {
    if (selectedIds.length === cartItems.length) {
      // Nếu đang chọn hết -> Bỏ chọn hết
      setSelectedIds([]);
    } else {
      // Nếu chưa chọn hết -> Chọn tất cả
      setSelectedIds(cartItems.map(item => item.product_id));
    }
  };

  // --- 3. CẬP NHẬT SỐ LƯỢNG ---
  const handleQuantityChange = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `${API_URL}/cart/update`,
        { product_id: productId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Cập nhật lại state cartItems ngay lập tức để giao diện mượt hơn
      // (Thay vì gọi lại API fetchCartData, ta sửa trực tiếp state)
      setCartItems(prev => prev.map(item => 
        item.product_id === productId ? { ...item, quantity: newQty } : item
      ));

    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Không thể cập nhật số lượng!");
    }
  };

  // --- 4. XÓA SẢN PHẨM ---
  const handleRemoveItem = async (productId) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Xóa khỏi danh sách hiển thị
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
      // Xóa khỏi danh sách đang chọn (nếu có)
      setSelectedIds(prev => prev.filter(id => id !== productId));

    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Xóa thất bại!");
    }
  };

  // --- UTIL ---
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const getImageUrl = (product) => {
    if (!product) return "/placeholder.jpg";
    return product.thumbnail || product.image || "/placeholder.jpg";
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  if (loading) return <div className="min-h-screen pt-32 text-center text-xl">Đang tải giỏ hàng...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="px-4 md:px-16 lg:px-32 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ Hàng Của Bạn</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* 👉 MỚI: Header của list sản phẩm (Nút Chọn Tất Cả) */}
              {cartItems.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                    checked={cartItems.length > 0 && selectedIds.length === cartItems.length}
                    onChange={handleToggleAll}
                  />
                  <span className="font-medium text-gray-700">Chọn tất cả ({cartItems.length} sản phẩm)</span>
                </div>
              )}

              {cartItems.length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow text-center">
                  <p className="text-gray-500 mb-4 text-lg">Giỏ hàng của bạn đang trống</p>
                  <button
                    onClick={() => router.push("/all-products")}
                    className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className={`bg-white p-4 rounded-lg shadow flex gap-4 items-center relative transition-colors ${selectedIds.includes(item.product_id) ? 'border border-orange-200' : ''}`}>
                    
                    {/* 👉 MỚI: Checkbox từng sản phẩm */}
                    <div className="flex-shrink-0">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-orange-500 cursor-pointer"
                          checked={selectedIds.includes(item.product_id)}
                          onChange={() => handleToggleItem(item.product_id)}
                        />
                    </div>

                    {/* Ảnh */}
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={getImageUrl(item.product)}
                        alt={item.product?.name || "Sản phẩm"}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Thông tin */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-800 line-clamp-1">
                        {item.product?.name}
                      </h3>
                      <p className="text-orange-600 font-bold mt-1">
                        {formatPrice(item.product?.price || 0)}
                      </p>
                      
                      {/* Bộ điều khiển số lượng */}
                      <div className="flex items-center mt-3 gap-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-gray-800 font-medium border-x">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="text-gray-400 hover:text-red-500 text-sm underline"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {/* Tổng tiền item */}
                    <div className="hidden md:block text-right pr-4">
                      <p className="text-sm text-gray-500">Thành tiền</p>
                      <p className="font-bold text-gray-800">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cột phải: Tổng tiền & Thanh toán */}
            {cartItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow sticky top-28">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Thanh Toán</h2>
                  
                  <div className="flex justify-between items-center mb-2 text-gray-600">
                    {/* 👉 MỚI: Hiển thị số lượng ĐÃ CHỌN */}
                    <span>Đã chọn:</span>
                    <span className="font-bold text-gray-800">{selectedIds.length} sản phẩm</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 text-xl font-bold text-gray-800">
                    <span>Tổng cộng:</span>
                    {/* 👉 Giá tiền tự nhảy theo state totalAmount */}
                    <span className="text-orange-600">{formatPrice(totalAmount)}</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 mb-6">
                    Phí vận chuyển sẽ được tính khi thanh toán.
                  </p>

                  <button
                    onClick={() => {
                        if(selectedIds.length === 0) {
                            alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
                            return;
                        }
                        // Gửi danh sách selectedIds sang trang thanh toán nếu cần
                        // router.push(`/place-order?items=${JSON.stringify(selectedIds)}`); 
                        // Hoặc chỉ đơn giản là push sang:
                        // 👉 MỚI: Truyền danh sách ID qua URL. 
      // JSON.stringify biến mảng [1, 2] thành chuỗi "[1,2]"
                        router.push(`/place-order?items=${encodeURIComponent(JSON.stringify(selectedIds))}`);
                      
                    }} 
                    // 👉 MỚI: Disable nút mua nếu chưa chọn gì
                    disabled={selectedIds.length === 0}
                    className={`w-full py-3 font-bold rounded transition shadow-lg 
                        ${selectedIds.length === 0 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" 
                            : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30"}`
                    }
                  >
                    MUA HÀNG ({selectedIds.length})
                  </button>

                  <button
                    onClick={() => router.push("/all-products")}
                    className="w-full mt-3 py-2 text-gray-500 hover:text-gray-800 text-sm hover:underline"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;