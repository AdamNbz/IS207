"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

// Tạo context
export const AppContext = createContext();


// Hook để dùng context
export const useAppContext = () => useContext(AppContext);

// Provider
export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "VNĐ";
  const router = useRouter();

  // Địa chỉ API backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(false); // false = chưa đăng nhập
  const [cartItems, setCartItems] = useState({});
  useEffect(() => {
    fetchProductData();
    // 👉 QUAN TRỌNG: Gọi hàm này để kiểm tra token trong LocalStorage và lấy thông tin user
    fetchUserData(); 
  }, []);

  // Lấy dữ liệu sản phẩm từ API backend
  const fetchProductData = async (filters = {}) => {
    setLoading(true);
    try {
      // Xây dựng query string từ filters
      const params = new URLSearchParams();
      
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.category) params.append('category', filters.category);
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.ram) params.append('ram', filters.ram);
      if (filters.cpu) params.append('cpu', filters.cpu);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.per_page) params.append('per_page', filters.per_page);
      if (filters.in_stock) params.append('in_stock', filters.in_stock);

      const queryString = params.toString();
      const url = `${API_URL}/products${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        // API trả về dạng paginate, lấy data từ field 'data'
        const productList = data.data || data;
        
        // Chuẩn hóa dữ liệu để tương thích với frontend hiện tại
        const normalizedProducts = productList.map(product => ({
          _id: product.id?.toString(),
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          category: product.category?.name || '',
          category_id: product.category?.id,
          brand: product.brand?.name || '',
          brand_id: product.brand?.id,
          price: parseFloat(product.old_price) || parseFloat(product.price) || 0,
          offerPrice: parseFloat(product.price) || 0,
          old_price: parseFloat(product.old_price) || 0,
          avg_rating: product.avg_rating || 0,
          isNew: product.is_new || false,
          isHot: product.is_featured || false,
          is_featured: product.is_featured || false,
          stock: product.stock || 0,
          thumbnail: product.thumbnail,
          image: product.images?.length > 0 
            ? product.images.map(img => img.url) 
            : (product.thumbnail ? [product.thumbnail] : ['/images/placeholder.png']),
          images: product.images || [],
          specs: product.specs || [],
          view_count: product.view_count || 0,
        }));
        
        setProducts(normalizedProducts);
        return { success: true, data: normalizedProducts, pagination: data };
      } else {
        console.error('Failed to fetch products:', res.status);
        return { success: false, error: 'Failed to fetch products' };
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // --- MỚI THÊM: HÀM XỬ LÝ ĐĂNG NHẬP ---

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
    loading,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    API_URL,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
