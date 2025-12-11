"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Single-file Admin UI for Next.js (app/admin/page.tsx)
// - TailwindCSS required in project
// - Put this file at: src/app/admin/page.tsx

type Product = {
  id: string;
  name: string;
  brand: string;
  brand_id?: number;
  category_id?: number;
  price: number;
  stock: number;
  old_price?: number;
  sku?: string;
  thumbnail?: string;
  is_active?: boolean;
  is_featured?: boolean;
  description?: string;
  images?: Array<{ id: number; url: string; order: number }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@gmail.com");
  const [loginPassword, setLoginPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");

  const [view, setView] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Check authentication on mount - MUST be before any conditional returns
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Load products from API - MUST be before any conditional returns
  useEffect(() => {
    if (view === "products" && isAuthenticated) {
      fetchProducts();
    }
  }, [view, isAuthenticated]);

  // Login function
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Email hoặc mật khẩu không đúng");
      }

      const data = await response.json();
      const token = data.access_token || data.token; // Support both formats
      localStorage.setItem("admin_token", token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Logout function
  function handleLogout() {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{loginError}</div>}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md disabled:opacity-50">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE}/admin/products?per_page=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Không thể tải danh sách sản phẩm (${response.status})`);
      }

      const data = await response.json();
      const items = data.data || [];

      // Map API response to local Product type
      const mapped = items.map((item: any) => {
        // Only prepend localhost if thumbnail is a relative path
        let thumbnailUrl = item.thumbnail;
        if (thumbnailUrl && !thumbnailUrl.startsWith("http://") && !thumbnailUrl.startsWith("https://")) {
          thumbnailUrl = `http://localhost:8001${thumbnailUrl}`;
        }

        return {
          id: item.id.toString(),
          name: item.name,
          brand: item.brand?.name || "N/A",
          brand_id: item.brand?.id,
          category_id: item.category?.id,
          price: item.price,
          stock: item.stock,
          old_price: item.old_price,
          sku: item.sku,
          thumbnail: thumbnailUrl,
          is_active: item.is_active,
          is_featured: item.is_featured,
          images: item.images,
        };
      });

      setProducts(mapped);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }

  // helpers
  const money = (v: number) => v.toLocaleString("vi-VN") + "₫";
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()));

  // CRUD operations with API
  async function addOrUpdateProduct(p: Product, file?: File, gallery?: FileList | null) {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();

      formData.append("name", p.name);
      formData.append("brand_id", p.brand_id?.toString() || "1");
      formData.append("category_id", p.category_id?.toString() || "1");
      formData.append("price", p.price.toString());
      formData.append("stock", p.stock.toString());

      if (p.old_price) formData.append("old_price", p.old_price.toString());
      if (p.sku) formData.append("sku", p.sku);
      if (p.description) formData.append("description", p.description);
      if (p.is_active !== undefined) formData.append("is_active", p.is_active ? "1" : "0");
      if (p.is_featured !== undefined) formData.append("is_featured", p.is_featured ? "1" : "0");
      if (file) formData.append("thumbnail", file);

      if (gallery) {
        for (let i = 0; i < gallery.length; i++) {
          formData.append("images[]", gallery[i]);
        }
      }

      const isUpdate = selected !== null;

      // For update with file upload, use POST with _method override
      if (isUpdate) {
        formData.append("_method", "PUT");
      }

      const url = isUpdate ? `${API_BASE}/admin/products/${p.id}` : `${API_BASE}/admin/products`;

      const response = await fetch(url, {
        method: "POST", // Always POST for file uploads
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể lưu sản phẩm");
      }

      await fetchProducts(); // Reload list
      setShowForm(false);
      setSelected(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error saving product:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeProduct(id: string) {
    if (!confirm("Xác nhận xóa sản phẩm?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }

      await fetchProducts(); // Reload list
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting product:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function viewProductDetail(id: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE}/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải chi tiết sản phẩm");
      }

      const data = await response.json();
      const product: Product = {
        id: data.id.toString(),
        name: data.name,
        brand: data.brand?.name || "N/A",
        brand_id: data.brand_id,
        category_id: data.category_id,
        price: data.price,
        stock: data.stock,
        old_price: data.old_price,
        sku: data.sku,
        thumbnail: data.thumbnail,
        is_active: data.is_active,
        is_featured: data.is_featured,
        description: data.description,
        images: data.images,
      };

      setSelected(product);
      setShowForm(true);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching product detail:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r hidden md:flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-2xl font-bold">LaptopStore Admin</h1>
          <p className="text-sm text-gray-500">Quản trị cửa hàng</p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <SideItem active={view === "dashboard"} onClick={() => setView("dashboard")}>
            Dashboard
          </SideItem>
          <SideItem active={view === "products"} onClick={() => setView("products")}>
            Quản lý sản phẩm
          </SideItem>
          <SideItem active={view === "orders"} onClick={() => setView("orders")}>
            Đơn hàng
          </SideItem>
          <SideItem active={view === "users"} onClick={() => setView("users")}>
            Người dùng
          </SideItem>
          <div className="mt-4 px-3">
            <button
              onClick={() => {
                setShowForm(true);
                setSelected(null);
                setView("products");
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md"
            >
              + Thêm sản phẩm
            </button>
          </div>
        </nav>

        <div className="px-4 py-4 border-t text-xs text-gray-500">
          <div>
            Admin: <span className="font-medium">admin@gmail.com</span>
          </div>
          <button onClick={handleLogout} className="mt-2 text-left text-red-600 hover:underline">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold capitalize">{view}</h2>
            <p className="text-sm text-gray-500">Xin chào, Admin — quản lý cửa hàng laptop</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="px-3 py-2 outline-none" placeholder="Tìm sản phẩm hoặc thương hiệu..." />
              <button onClick={() => setQuery("")} className="px-3 bg-gray-50">
                Xoá
              </button>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setSelected(null);
                setView("products");
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
            >
              + Thêm
            </button>
          </div>
        </div>

        {/* Content by view */}
        {view === "dashboard" && <Dashboard products={products} />}

        {view === "products" && (
          <div className="space-y-6">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

            {loading && <div className="text-center py-4">Đang tải...</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Tổng sản phẩm" value={products.length.toString()} />
              <StatCard title="Tổng tồn kho" value={products.reduce((s, p) => s + p.stock, 0).toString()} />
              <StatCard title="Giá trị kho" value={money(products.reduce((s, p) => s + p.price * p.stock, 0))} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3">Hãng</th>
                    <th className="p-3">Giá</th>
                    <th className="p-3">Tồn kho</th>
                    <th className="p-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        Không có sản phẩm
                      </td>
                    </tr>
                  )}
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {p.thumbnail ? <Image src={p.thumbnail} alt={p.name} width={64} height={40} className="object-cover" /> : <div />}
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">ID: {p.id}</div>
                        </div>
                      </td>
                      <td className="p-3">{p.brand}</td>
                      <td className="p-3">{money(p.price)}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => viewProductDetail(p.id)} className="px-3 py-1 text-sm border rounded">
                            Chi tiết
                          </button>
                          <button
                            onClick={() => {
                              setSelected(p);
                              setShowForm(true);
                            }}
                            className="px-3 py-1 text-sm border rounded"
                          >
                            Sửa
                          </button>
                          <button onClick={() => removeProduct(p.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded">
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "orders" && <div className="bg-white p-6 rounded-lg shadow">Đơn hàng — (demo) chưa kết nối backend</div>}

        {view === "users" && <div className="bg-white p-6 rounded-lg shadow">Người dùng — (demo) chưa kết nối backend</div>}
      </main>

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:w-2/3 lg:w-1/2 rounded-t-xl md:rounded-xl p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{selected ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelected(null);
                }}
                className="text-gray-500"
              >
                Đóng
              </button>
            </div>

            <ProductForm
              product={selected}
              onCancel={() => {
                setShowForm(false);
                setSelected(null);
              }}
              onSave={addOrUpdateProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function SideItem({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 ${active ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}>
      <span className="w-2 h-2 rounded-full bg-orange-400" />
      <span className="capitalize">{children}</span>
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-bold mt-1">{value}</div>
      </div>
      <div className="text-3xl text-gray-200">📦</div>
    </div>
  );
}

function Dashboard({ products }: { products: Product[] }) {
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Số sản phẩm" value={products.length.toString()} />
        <StatCard title="Tổng tồn kho" value={totalStock.toString()} />
        <StatCard title="Giá trị kho" value={totalValue.toLocaleString("vi-VN") + "₫"} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">Thống kê (placeholder) — chèn chart ở đây</div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }: { product: Product | null; onSave: (p: Product, file?: File, gallery?: FileList | null) => void; onCancel: () => void }) {
  const [id] = useState(product?.id ?? `p${Math.random().toString(36).slice(2, 8)}`);
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [brandId, setBrandId] = useState(product?.brand_id ?? 1);
  const [categoryId, setCategoryId] = useState(product?.category_id ?? 1);
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [oldPrice, setOldPrice] = useState(product?.old_price ?? 0);
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [thumbnailFile, setThumbnailFile] = useState<File | undefined>();
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch brands and categories on mount
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([fetch(`${API_BASE}/brands`), fetch(`${API_BASE}/categories`)]);

        const brandsData = await brandsRes.json();
        const categoriesData = await categoriesRes.json();

        setBrands(brandsData.data || brandsData || []);
        setCategories(categoriesData.data || categoriesData || []);
      } catch (err) {
        console.error("Error fetching brands/categories:", err);
      }
    }
    fetchOptions();
  }, []);

  function handleSave() {
    if (!name || !brandId) return alert("Vui lòng nhập tên và thương hiệu");
    onSave(
      {
        id,
        name,
        brand,
        brand_id: brandId,
        category_id: categoryId,
        price: Number(price),
        stock: Number(stock),
        old_price: oldPrice ? Number(oldPrice) : undefined,
        sku,
        description,
        is_active: isActive,
        is_featured: isFeatured,
      },
      thumbnailFile,
      galleryFiles
    );
  }

  return (
    <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Tên sản phẩm *</div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="space-y-1">
          <div className="text-sm text-gray-600">SKU</div>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border rounded px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Brand ID *</div>
          <select value={brandId} onChange={(e) => setBrandId(Number(e.target.value))} className="w-full border rounded px-3 py-2">
            <option value="">-- Chọn hãng --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Category ID *</div>
          <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="w-full border rounded px-3 py-2">
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Giá (VND) *</div>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Giá cũ (VND)</div>
          <input type="number" value={oldPrice} onChange={(e) => setOldPrice(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Tồn kho *</div>
          <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Ảnh thumbnail</div>
          <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0])} className="w-full border rounded px-3 py-2" />
        </label>
      </div>

      <label className="space-y-1">
        <div className="text-sm text-gray-600">Ảnh minh họa (nhiều ảnh)</div>
        <input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(e.target.files)} className="w-full border rounded px-3 py-2" />
      </label>

      <label className="space-y-1">
        <div className="text-sm text-gray-600">Mô tả</div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
      </label>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm">Kích hoạt</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <span className="text-sm">Sản phẩm nổi bật</span>
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Huỷ
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-orange-600 text-white rounded">
          Lưu
        </button>
      </div>
    </div>
  );
}
