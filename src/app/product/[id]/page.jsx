"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";
import { useParams } from "next/navigation";

const Product = () => {
  const { id } = useParams();
  const { products, router, addToCart } = useAppContext();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    const product = products.find((p) => p._id === id);
    setProductData(product || null);
  }, [id, products]);

  if (!productData) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        {/* Product Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image
                src={mainImage || productData.image[0]}
                alt={productData.name}
                className="w-full h-auto object-cover"
                width={1280}
                height={720}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.image.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <Image
                    src={img}
                    alt={`${productData.name} ${idx + 1}`}
                    className="w-full h-auto object-cover"
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name}
            </h1>
            <p className="text-gray-600 mt-3">{productData.description}</p>
            <p className="text-3xl font-medium mt-6">
              {productData.offerPrice}
              <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                {productData.price}
              </span>
            </p>
            <hr className="bg-gray-600 my-6" />

            {/* Attributes Table */}
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/50">{productData.brand || "Generic"}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/50">{productData.color || "Multi"}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50">{productData.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={() => addToCart(productData._id)}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => {
                  addToCart(productData._id);
                  router.push("/cart");
                }}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured <span className="text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products.slice(0, 5).map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
          <button
            onClick={() => router.push("/all-products")}
            className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            See more
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
