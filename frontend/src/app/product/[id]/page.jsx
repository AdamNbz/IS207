"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ProductCard from "@/components/ProductCard";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8001/api";

const Product = () => {
  const { id } = useParams();
  const router = useRouter();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProductData(res.data);
        setMainImage(res.data.images[0]?.url || res.data.thumbnail);

        // Fetch related products (same category)
        if (res.data.category?.slug) {
          const relatedRes = await axios.get(`${API_URL}/products?category=${res.data.category.slug}&per_page=5`);
          setRelatedProducts(relatedRes.data.data.filter((p) => p.id !== parseInt(id)));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <Loading />;
  if (!productData) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        {/* Product Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image src={mainImage} alt={productData.name} className="w-full h-auto object-cover" width={1280} height={720} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.images?.map((img, idx) => (
                <div key={img.id} onClick={() => setMainImage(img.url)} className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 ${mainImage === img.url ? "ring-2 ring-orange-500" : ""}`}>
                  <Image src={img.url} alt={`${productData.name} ${idx + 1}`} className="w-full h-auto object-cover" width={320} height={180} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">{productData.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.round(productData.avg_rating || 0) ? "★" : "☆"}</span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {productData.avg_rating?.toFixed(1) || "0.0"} ({productData.review_count || 0} đánh giá)
              </span>
            </div>

            <p className="text-gray-600 mt-3">{productData.description}</p>

            <div className="mt-6">
              <p className="text-3xl font-medium text-orange-600">{formatPrice(productData.price)}</p>
              {productData.old_price && <span className="text-base font-normal text-gray-800/60 line-through ml-2">{formatPrice(productData.old_price)}</span>}
            </div>

            <hr className="bg-gray-600 my-6" />

            {/* Specifications Table */}
            <div className="overflow-x-auto mb-6">
              <table className="table-auto border-collapse w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600 font-medium">Thương hiệu</td>
                    <td className="py-2 text-gray-800/70">{productData.brand?.name || "N/A"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600 font-medium">Danh mục</td>
                    <td className="py-2 text-gray-800/70">{productData.category?.name || "N/A"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600 font-medium">SKU</td>
                    <td className="py-2 text-gray-800/70">{productData.sku || "N/A"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-gray-600 font-medium">Tình trạng</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${productData.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {productData.stock > 0 ? `Còn ${productData.stock} sản phẩm` : "Hết hàng"}
                      </span>
                    </td>
                  </tr>
                  {productData.specifications?.highlights?.cpu && (
                    <tr className="border-b">
                      <td className="py-2 text-gray-600 font-medium">CPU</td>
                      <td className="py-2 text-gray-800/70">{productData.specifications.highlights.cpu}</td>
                    </tr>
                  )}
                  {productData.specifications?.highlights?.ram && (
                    <tr className="border-b">
                      <td className="py-2 text-gray-600 font-medium">RAM</td>
                      <td className="py-2 text-gray-800/70">{productData.specifications.highlights.ram}</td>
                    </tr>
                  )}
                  {productData.specifications?.highlights?.storage && (
                    <tr className="border-b">
                      <td className="py-2 text-gray-600 font-medium">Ổ cứng</td>
                      <td className="py-2 text-gray-800/70">{productData.specifications.highlights.storage}</td>
                    </tr>
                  )}
                  {productData.specifications?.highlights?.screen && (
                    <tr className="border-b">
                      <td className="py-2 text-gray-600 font-medium">Màn hình</td>
                      <td className="py-2 text-gray-800/70">{productData.specifications.highlights.screen}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center mt-6 gap-4">
              <button onClick={() => alert("Thêm vào giỏ hàng")} className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition rounded" disabled={productData.stock === 0}>
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => alert("Mua ngay")}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition rounded disabled:bg-gray-300"
                disabled={productData.stock === 0}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* Product Details & Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Full Specifications */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Thông số kỹ thuật</h2>
            {productData.content && <div className="prose max-w-none mb-6 text-gray-700" dangerouslySetInnerHTML={{ __html: productData.content }} />}
            <div className="bg-gray-50 p-6 rounded-lg">
              <table className="w-full">
                <tbody>
                  {productData.specifications?.list?.map((spec, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-3 text-gray-600 font-medium w-1/3">{spec.name}</td>
                      <td className="py-3 text-gray-800">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Đánh giá ({productData.review_count || 0})</h2>
            <div className="space-y-4">
              {productData.reviews?.length > 0 ? (
                productData.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">{review.user?.name?.charAt(0) || "?"}</div>
                      <div>
                        <p className="font-medium">{review.user?.name || "Ẩn danh"}</p>
                        <div className="flex text-yellow-500 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(review.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Sản phẩm <span className="text-orange-600">Tương tự</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {relatedProducts.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <button onClick={() => router.push("/all-products")} className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
            Xem thêm
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
