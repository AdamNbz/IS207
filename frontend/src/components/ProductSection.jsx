"use client";
import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const ProductSection = ({ title, filterFn, badge, badgeColor = "bg-orange-500" }) => {
  const { products, router } = useAppContext();

  // Lọc sản phẩm theo điều kiện nếu có
  const filteredProducts = filterFn ? products.filter(filterFn) : products;

  // Giới hạn hiển thị 5 sản phẩm
  const displayProducts = filteredProducts.slice(0, 5);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center pt-14">
      {/* Tiêu đề section */}
      <div className="flex items-center gap-3 w-full mb-6">
        {badge && (
          <span className={`${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
            {badge}
          </span>
        )}
        <p className="text-2xl font-medium">{title}</p>
      </div>

      {/* Grid sản phẩm */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-8 w-full">
        {displayProducts.map((product, index) => (
          <ProductCard key={product._id || product.id || index} product={product} />
        ))}
      </div>

      {/* Nút Xem thêm */}
      <button
        onClick={() => router.push('/all-products')}
        className="px-12 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
      >
        Xem thêm
      </button>
    </div>
  );
};

export default ProductSection;
