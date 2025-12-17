"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CartPage = () => {
  const { 
    cartItems, 
    products, 
    updateCartQuantity, 
    getCartAmount,
    getCartCount,
    router 
  } = useAppContext();

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: ""
  });

  // Hàm format giá tiền
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " VNĐ";
  };

  // Lấy danh sách sản phẩm trong giỏ hàng
  const getCartProducts = () => {
    const cartProducts = [];
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId || p.id === itemId);
      if (product && cartItems[itemId] > 0) {
        cartProducts.push({
          ...product,
          quantity: cartItems[itemId],
        });
      }
    }
    return cartProducts;
  };

  // Lấy ảnh sản phẩm
  const getImageUrl = (product) => {
    if (product.thumbnail) return product.thumbnail;
    if (product.images && product.images.length > 0) return product.images[0].url;
    if (product.image && product.image[0]) return product.image[0];
    return "/placeholder.jpg";
  };

  // Lấy ID sản phẩm
  const getProductId = (product) => product.id || product._id;

  // Tính tổng tiền của 1 sản phẩm
  const getItemTotal = (product) => {
    const price = product.offerPrice || product.price;
    return price * product.quantity;
  };

  const cartProducts = getCartProducts();
  const totalItems = getCartCount();
  const totalAmount = getCartAmount();

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 0) return;
    updateCartQuantity(productId, newQuantity);
  };

  // Xử lý đặt hàng
  const handleCheckout = () => {
    if (cartProducts.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    // TODO: Xử lý đặt hàng
    alert("Đặt hàng thành công!");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="px-6 md:px-16 lg:px-32 py-8">
          {/* Tiêu đề */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng</h1>

          {/* Bảng sản phẩm */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            {/* Header bảng */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-200 font-medium text-gray-700">
              <div className="col-span-5 md:col-span-6">
                Tất cả ({totalItems} sản phẩm)
              </div>
              <div className="col-span-2 text-center hidden md:block">Đơn giá</div>
              <div className="col-span-3 md:col-span-2 text-center">Số lượng</div>
              <div className="col-span-4 md:col-span-2 text-center">Thành tiền</div>
            </div>

            {/* Danh sách sản phẩm */}
            {cartProducts.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <p className="text-lg mb-4">Giỏ hàng của bạn đang trống</p>
                <button 
                  onClick={() => router.push('/all-products')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cartProducts.map((product) => (
                  <div 
                    key={getProductId(product)} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
                  >
                    {/* Hình ảnh và tên sản phẩm */}
                    <div className="col-span-5 md:col-span-6 flex items-center gap-4">
                      <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageUrl(product)}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500 truncate max-w-xs hidden md:block">
                          {product.description}
                        </p>
                        {/* Hiển thị giá trên mobile */}
                        <p className="text-sm text-gray-600 md:hidden mt-1">
                          {formatPrice(product.offerPrice || product.price)}
                        </p>
                      </div>
                    </div>

                    {/* Đơn giá - ẩn trên mobile */}
                    <div className="col-span-2 text-center hidden md:block">
                      <span className="text-gray-700">
                        {formatPrice(product.offerPrice || product.price)}
                      </span>
                    </div>

                    {/* Số lượng */}
                    <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => handleQuantityChange(getProductId(product), product.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-200 transition text-gray-600"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300 min-w-[40px] text-center">
                          {product.quantity}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(getProductId(product), product.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-200 transition text-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Thành tiền */}
                    <div className="col-span-4 md:col-span-2 text-center">
                      <span className="font-medium text-gray-800">
                        {formatPrice(getItemTotal(product))}
                      </span>
                      {/* Nút xóa */}
                      <button 
                        onClick={() => handleQuantityChange(getProductId(product), 0)}
                        className="ml-2 text-red-500 hover:text-red-700 transition text-sm"
                        title="Xóa sản phẩm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần thanh toán */}
          {cartProducts.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin giao hàng */}
              <div className="bg-blue-100 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Giao tới</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên nhận / SĐT
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên người nhận và số điện thoại"
                      value={deliveryInfo.name}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <textarea
                      placeholder="Nhập địa chỉ giao hàng"
                      value={deliveryInfo.address}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tổng thanh toán */}
              <div className="bg-blue-100 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-800">
                    Tổng số sản phẩm: {totalItems}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium text-gray-700">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg"
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
