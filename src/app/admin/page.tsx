"use client"

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 1. Import useRouter

// Single-file Admin UI for Next.js (app/admin/page.tsx)

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image?: string;
};

export default function AdminPage() {
  const router = useRouter(); // 2. Khởi tạo router
  const [view, setView] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([
    { id: "p1", name: "MacBook Air M2", brand: "Apple", price: 28990000, stock: 12, image: "/images/mb-air.jpg" },
    { id: "p2", name: "ROG Strix G16", brand: "Asus", price: 37500000, stock: 8, image: "/images/rog-g16.jpg" },
    { id: "p3", name: "Acer Nitro 5", brand: "Acer", price: 22900000, stock: 15, image: "/images/acer-nitro.jpg" },
  ]);

  const [selected, setSelected] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  // helpers
  const money = (v: number) => v.toLocaleString("vi-VN") + "₫";
  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()));

  // CRUD (local-only demo)
  function addOrUpdateProduct(p: Product) {
    setProducts(prev => {
      const found = prev.find(x => x.id === p.id);
      if (found) return prev.map(x => x.id === p.id ? p : x);
      return [p, ...prev];
    });
    setShowForm(false);
    setSelected(null);
  }

  function removeProduct(id: string) {
    if (!confirm("Xác nhận xóa sản phẩm?")) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // Nếu bạn có dùng AppContext thì gọi logout() ở đây
    // Còn ở file này đơn giản là chuyển hướng về trang chủ
    router.push("/"); 
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
          <SideItem active={view === "dashboard"} onClick={() => setView("dashboard")}>Dashboard</SideItem>
          <SideItem active={view === "products"} onClick={() => setView("products")}>Quản lý sản phẩm</SideItem>
          <SideItem active={view === "orders"} onClick={() => setView("orders")}>Đơn hàng</SideItem>
          <SideItem active={view === "users"} onClick={() => setView("users")}>Người dùng</SideItem>
          <div className="mt-4 px-3">
            <button onClick={() => { setShowForm(true); setSelected(null); setView("products"); }} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md">+ Thêm sản phẩm</button>
          </div>
        </nav>

        <div className="px-4 py-4 border-t text-xs text-gray-500">
          <div>Admin: <span className="font-medium">admin@lapstore.vn</span></div>
          {/* 3. Gắn sự kiện click vào nút Đăng xuất */}
          <button 
            onClick={handleLogout}
            className="mt-2 text-left text-red-600 hover:underline w-full"
          >
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
              <input value={query} onChange={e => setQuery(e.target.value)} className="px-3 py-2 outline-none" placeholder="Tìm sản phẩm hoặc thương hiệu..." />
              <button onClick={() => setQuery("")} className="px-3 bg-gray-50">Xoá</button>
            </div>
            <button onClick={() => { setShowForm(true); setSelected(null); setView("products"); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md">+ Thêm</button>
          </div>
        </div>

        {/* Content by view */}
        {view === "dashboard" && (
          <Dashboard products={products} />
        )}

        {view === "products" && (
          <div className="space-y-6">
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
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500">Không có sản phẩm</td></tr>
                  )}
                  {filtered.map(p => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {p.image ? <Image src={p.image} alt={p.name} width={64} height={40} className="object-cover" /> : <div />}
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
                          <button onClick={() => { setSelected(p); setShowForm(true); }} className="px-3 py-1 text-sm border rounded">Sửa</button>
                          <button onClick={() => removeProduct(p.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "orders" && (
          <div className="bg-white p-6 rounded-lg shadow">Đơn hàng — (demo) chưa kết nối backend</div>
        )}

        {view === "users" && (
          <div className="bg-white p-6 rounded-lg shadow">Người dùng — (demo) chưa kết nối backend</div>
        )}
      </main>

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:w-2/3 lg:w-1/2 rounded-t-xl md:rounded-xl p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{selected ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
              <button onClick={() => { setShowForm(false); setSelected(null); }} className="text-gray-500">Đóng</button>
            </div>

            <ProductForm product={selected} onCancel={() => { setShowForm(false); setSelected(null); }} onSave={addOrUpdateProduct} />
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

function ProductForm({ product, onSave, onCancel }: { product: Product | null; onSave: (p: Product) => void; onCancel: () => void }) {
  const [id] = useState(product?.id ?? `p${Math.random().toString(36).slice(2, 8)}`);
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);

  function handleSave() {
    if (!name || !brand) return alert("Vui lòng nhập tên và thương hiệu");
    onSave({ id, name, brand, price: Number(price), stock: Number(stock) });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Tên</div>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Thương hiệu</div>
          <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border rounded px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Giá (VND)</div>
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Tồn kho</div>
          <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 border rounded">Huỷ</button>
        <button onClick={handleSave} className="px-4 py-2 bg-orange-600 text-white rounded">Lưu</button>
      </div>
    </div>
  );
}