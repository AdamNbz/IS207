"use client";
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
  useEffect(() => {
    fetchProductData();
    // 👉 QUAN TRỌNG: Gọi hàm này để kiểm tra token trong LocalStorage và lấy thông tin user
    fetchUserData(); 
  }, []);

  // Lấy dữ liệu sản phẩm
  const fetchProductData = async () => {
    setProducts(productsData);
  };

  // --- MỚI THÊM: HÀM XỬ LÝ ĐĂNG NHẬP ---
  // Địa chỉ API backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Đăng nhập
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        setUserData(data.user);
        await fetchCart(); // 👉 THÊM: Load giỏ hàng ngay
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Đăng ký
  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        setUserData(data.user);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Đăng xuất
  const logout = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {}
      localStorage.removeItem("access_token");
    }
    setUserData(false);
    setCartItems({});
    router.push("/");
  };

  // Lấy user hiện tại từ token
  const fetchUserData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUserData(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        // Sau khi fetch user thành công, đồng bộ giỏ hàng từ backend
        await fetchCart();
      } else {
        setUserData(false);
        localStorage.removeItem("access_token");
      }
    } catch (e) {
      setUserData(false);
      localStorage.removeItem("access_token");
    }
  };

  // Lấy giỏ hàng từ backend và chuyển thành map { productId: quantity }
  const fetchCart = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      // CartController trả về object cart có key `items` hoặc trả về { items: [] }
      const items = data.items || data.data?.items || (data.cart && data.cart.items) || [];
      const map = {};
      (items || []).forEach((it) => {
        const pid = it.product_id || it.product?.id || it.product?._id || it.product?.product_id;
        const qty = it.quantity || 0;
        if (pid) map[pid] = qty;
      });
      setCartItems(map);
    } catch (e) {
      console.error("Failed to fetch cart:", e);
    }
  };

  // --- MỚI THÊM: HÀM ĐĂNG XUẤT ---
  useEffect(() => {
    fetchProductData();
    fetchUserData();
  }, []);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (itemId, quantity = 1) => {
    const token = localStorage.getItem("access_token");
    // Nếu đã đăng nhập -> gọi API backend
    if (token) {
      try {
        const res = await fetch(`${API_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: itemId, quantity }),
        });
        if (res.ok) {
          // Đồng bộ lại giỏ hàng từ server
          await fetchCart();
          return true;
        }
        return false;
      } catch (e) {
        console.error("addToCart error:", e);
        return false;
      }
    }

    // Nếu chưa đăng nhập -> cập nhật local state
    let cartData = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + quantity;
    setCartItems(cartData);
    return true;
  };

  // Cập nhật số lượng trong giỏ
  const updateCartQuantity = async (itemId, quantity) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const res = await fetch(`${API_URL}/cart/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: itemId, quantity }),
        });
        if (res.ok) {
          const data = await res.json();
          // Nếu server trả về cart, đồng bộ lại
          const cart = data.cart || data;
          const items = cart.items || [];
          const map = {};
          items.forEach((it) => {
            const pid = it.product_id || it.product?.id || it.product?._id;
            const qty = it.quantity || 0;
            if (pid) map[pid] = qty;
          });
          setCartItems(map);
          return;
        }
      } catch (e) {
        console.error("updateCartQuantity error:", e);
      }
    }

    // Fallback local update
    let cartData = structuredClone(cartItems);
    if (quantity === 0) delete cartData[itemId];
    else cartData[itemId] = quantity;
    setCartItems(cartData);
  };

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
  };

  useEffect(() => {
    fetchProductData();
    // fetchUserData(); // Tạm tắt dòng này để tránh reset user khi reload trang trong lúc dev
  }, []);

  const value = {
    router,
    currency,
    userData,
    setUserData,
    fetchUserData,
    login,
    register,
    logout,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
