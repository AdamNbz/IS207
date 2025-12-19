import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const HomeProducts = () => {

  const { products, loading, router } = useAppContext()

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Sản phẩm phổ biến</p>
      
      {loading ? (
        <div className="flex justify-center items-center py-20 w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex justify-center items-center py-20 w-full text-gray-500">
          Không có sản phẩm nào
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
          {products.slice(0, 10).map((product, index) => <ProductCard key={product._id || index} product={product} />)}
        </div>
      )}
      
      <button onClick={() => { router.push('/all-products') }} className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
        Xem thêm
      </button>
    </div>
  );
};

export default HomeProducts;