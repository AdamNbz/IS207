'use client'
import React from "react";
import HeaderSlider from "../components/HeaderSilder";
import HomeProducts from "../components/HomeProduct";
import Banner from "../components/Banner";
import NewsLetter from "../components/NewsLetter";
import FeaturedProduct from "../components/FeaturedProduct";
import ProductSection from "../components/ProductSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Navbar/>
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        
        {/* Sản phẩm phổ biến */}
        <HomeProducts />

        {/* Sản phẩm Khuyến mãi */}
        <ProductSection 
          title="Sản phẩm Khuyến mãi" 
          badge="SALE"
          badgeColor="bg-red-500"
          filterFn={(product) => product.offerPrice && product.price && product.offerPrice < product.price}
        />

        {/* Sản phẩm Mới */}
        <ProductSection 
          title="Sản phẩm Mới" 
          badge="NEW"
          badgeColor="bg-green-500"
          filterFn={(product) => product.isNew || true} // Tạm thời hiển thị tất cả, sau có thể thêm field isNew
        />

        {/* Sản phẩm HOT */}
        <ProductSection 
          title="Sản phẩm HOT" 
          badge="HOT"
          badgeColor="bg-orange-500"
          filterFn={(product) => product.isHot || (product.avg_rating && product.avg_rating >= 4) || true}
        />

        {/* Laptop */}
        <ProductSection 
          title="Laptop" 
          filterFn={(product) => {
            const name = (product.name || '').toLowerCase();
            const category = (product.category || '').toLowerCase();
            return name.includes('laptop') || category.includes('laptop');
          }}
        />

        <FeaturedProduct />
        <Banner />
        <NewsLetter />
      </div>
      <Footer />
    </>
  );
};

export default Home;