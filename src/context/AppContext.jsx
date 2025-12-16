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

  const currency = process.env.NEXT_PUBLIC_CURRENCY || "VNĐ";
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false); // false = chưa đăng nhập
  const [cartItems, setCartItems] = useState({});

  // Lấy dữ liệu sản phẩm
  const fetchProductData = async () => {
    setProducts(productsData);
  }

  // Lấy dữ liệu user (Khởi tạo ban đầu)
  const fetchUserData = async () => {
    // Tạm thời để false. Nếu sau này có API lấy user hiện tại thì viết vào đây.
    setUserData(false);
  }

  // --- MỚI THÊM: HÀM XỬ LÝ ĐĂNG NHẬP ---
  const login = (email, password) => {
    // Kiểm tra tài khoản cứng (Hardcode)
    if (email === "admin" && password === "admin") {
      // Cập nhật state userData thành object chứa thông tin
      setUserData({
        id: 1,
        name: "Admin User",
        email: "admin@gmail.com",
        role: "admin"
      });
      return true; // Trả về true để báo component biết là thành công
    }
    return false; // Trả về false nếu sai
  };

  // --- MỚI THÊM: HÀM ĐĂNG XUẤT ---
  const logout = () => {
    setUserData(false); // Reset về false (chưa đăng nhập)
    router.push("/");     // Chuyển hướng về trang chủ
  };

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
    // fetchUserData(); // Tạm tắt dòng này để tránh reset user khi reload trang trong lúc dev
  }, []);

  const value = {
    router, currency,
    userData, setUserData, fetchUserData,
    login, logout, // <-- Đã thêm 2 hàm này vào để Navbar và AuthModal dùng được
    products, fetchProductData,
    cartItems, setCartItems,
    addToCart, updateCartQuantity,
    getCartCount, getCartAmount,
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}