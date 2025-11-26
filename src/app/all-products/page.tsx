'use client'
import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const AllProducts = () => {
  const { products } = useAppContext();

  // FILTER STATES
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100000000]); // 0 - 100tr

  // Lấy danh mục & brand tự động để filter
  const allCategories = [...new Set(products.map(p => p.category))];
  const allBrands = [...new Set(products.map(p => p.brand))];

  // FILTER LOGIC
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => (category === "all" ? true : p.category === category))
      .filter(p => (brand === "all" ? true : p.brand === brand))
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "newest") return b.id - a.id;
        return 0;
      });
  }, [products, category, brand, priceRange, sort]);

  return (
    <>
      <Navbar />

      <div className="px-6 md:px-16 lg:px-32 pt-10">

        {/* TITLE */}
        <div className="flex flex-col items-end">
          <p className="text-2xl font-semibold">Tất cả sản phẩm</p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>

        {/* FILTER SECTION */}
        <div className="mt-10 p-5 bg-white shadow-md rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Bộ lọc sản phẩm</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* CATEGORY */}
            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              >
                <option value="all">Tất cả</option>
                {allCategories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* BRAND */}
            <div>
              <label className="text-sm font-medium">Thương hiệu</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              >
                <option value="all">Tất cả</option>
                {allBrands.map((b, i) => (
                  <option key={i} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* PRICE */}
            <div>
              <label className="text-sm font-medium">Khoảng giá</label>
              <select
                onChange={(e) => {
                  const option = e.target.value;

                  if (option === "low") setPriceRange([0, 5000000]);
                  if (option === "mid") setPriceRange([5000000, 15000000]);
                  if (option === "high") setPriceRange([15000000, 100000000]);
                  if (option === "all") setPriceRange([0, 100000000]);
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
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12 pb-14">
          {filteredProducts.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}

          {filteredProducts.length === 0 && (
            <p className="text-center col-span-full text-gray-500">
              Không có sản phẩm nào phù hợp với bộ lọc.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AllProducts;
