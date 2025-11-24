'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import productsData from "@/data/product";

// Tạo context
export const AppContext = createContext();


// Hook để dùng context
export const useAppContext = () => useContext(AppContext);

// Provider
export const AppContextProvider = (props) => {

  const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [cartItems, setCartItems] = useState({});

  // Lấy dữ liệu sản phẩm (hiện tạm để trống hoặc từ API)
  const fetchProductData = async () => {
    setProducts(productsData);
  }

  // Lấy dữ liệu user
  const fetchUserData = async () => {
    // Tạm set false hoặc fetch từ API
    setUserData(false);
  }

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);
  }

  // Cập nhật số lượng trong giỏ
  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) delete cartData[itemId];
    else cartData[itemId] = quantity;
    setCartItems(cartData);
  }

  // Tính tổng số lượng giỏ hàng
  const getCartCount = () => Object.values(cartItems).reduce((a, b) => a + b, 0);

  // Tính tổng tiền giỏ hàng
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((p) => p._id === itemId);
      if (itemInfo) totalAmount += itemInfo.offerPrice * cartItems[itemId];
    }
    return Math.floor(totalAmount * 100) / 100;
  }

  useEffect(() => {
    fetchProductData();
    fetchUserData();
  }, []);

  const value = {
    currency, router,
    userData, fetchUserData,
    products, fetchProductData,
    cartItems, setCartItems,
    addToCart, updateCartQuantity,
    getCartCount, getCartAmount
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}
