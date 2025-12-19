"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// 1. IMPORT HOOK ĐỂ LẤY THAM SỐ TỪ URL
import { useSearchParams } from "next/navigation"; 

const API_URL = "http://127.0.0.1:8000/api";

const AllProducts = () => {
  // 2. KHỞI TẠO BIẾN searchParams
  const searchParams = useSearchParams();
  // Lấy từ khóa tìm kiếm từ URL (ví dụ: ?search=macbook -> searchQuery = "macbook")
  const searchQuery = searchParams.get("search"); 

  // DATA STATES
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // FILTER STATES
  const [categorySlug, setCategorySlug] = useState("all");
  const [brandSlug, setBrandSlug] = useState("all");
  const [sort, setSort] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100000000]); 
  const [priceOption, setPriceOption] = useState("all"); 

  // Fetch categories & brands
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get(`${API_URL}/categories`), 
          axios.get(`${API_URL}/brands`)
        ]);
        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products mỗi khi filter HOẶC search thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // 3. GỬI THAM SỐ SEARCH XUỐNG API (QUAN TRỌNG)
        if (searchQuery) {
            params.append("search", searchQuery);
        }

        if (categorySlug !== "all") params.append("category", categorySlug);
        if (brandSlug !== "all") params.append("brand", brandSlug);
        
        params.append("min_price", priceRange[0].toString());
        params.append("max_price", priceRange[1].toString());

        if (sort === "price-asc") params.append("sort", "price_asc");
        if (sort === "price-desc") params.append("sort", "price_desc");

        const url = `${API_URL}/products?${params.toString()}`;
        console.log("Fetching products with URL:", url); // Xem log để kiểm tra link API
        
        const res = await axios.get(url);
        setProducts(res.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categorySlug, brandSlug, priceRange, sort, searchQuery]); // 4. THÊM searchQuery VÀO DEPENDENCY ARRAY

  return (
    <>
      <Navbar />

      <div className="px-6 md:px-16 lg:px-32 pt-10">
        {/* TITLE */}
        <div className="flex flex-col items-end">
          <p className="text-2xl font-semibold">
            {/* Hiển thị tiêu đề linh hoạt */}
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Tất cả sản phẩm"}
          </p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>

        {/* FILTER SECTION */}
        <div className="mt-10 p-5 bg-white shadow-md rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Bộ lọc sản phẩm</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CATEGORY */}
            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="w-full border rounded-lg p-2 mt-1">
                <option value="all">Tất cả</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* BRAND */}
            <div>
              <label className="text-sm font-medium">Thương hiệu</label>
              <select value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className="w-full border rounded-lg p-2 mt-1">
                <option value="all">Tất cả</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* PRICE */}
            <div>
              <label className="text-sm font-medium">Khoảng giá</label>
              <select
                value={priceOption}
                onChange={(e) => {
                  const option = e.target.value;
                  setPriceOption(option);
                  if (option === "low") setPriceRange([0, 5000000]);
                  else if (option === "mid") setPriceRange([5000000, 15000000]);
                  else if (option === "high") setPriceRange([15000000, 100000000]);
                  else setPriceRange([0, 100000000]);
                }}
                className="w-full border rounded-lg p-2 mt-1"
              >
                <option value="all">Tất cả</option>
                <option value="low">Dưới 5 triệu</option>
                <option value="mid">5 - 15 triệu</option>
                <option value="high">Trên 15 triệu</option>
              </select>
            </div>

            {/* SORT */}
            <div>
              <label className="text-sm font-medium">Sắp xếp</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border rounded-lg p-2 mt-1">
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCT LIST */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Đang tải sản phẩm...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12 pb-14">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {products.length === 0 && (
                <div className="col-span-full text-center py-10">
                    <p className="text-gray-500 text-lg">
                        Không tìm thấy sản phẩm nào phù hợp{searchQuery ? ` với từ khóa "${searchQuery}"` : ""}.
                    </p>
                    {/* Nút reset tìm kiếm */}
                    {searchQuery && (
                        <button 
                            onClick={() => window.location.href = '/all-products'}
                            className="mt-4 text-orange-600 underline hover:text-orange-800"
                        >
                            Xem tất cả sản phẩm
                        </button>
                    )}
                </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AllProducts;