"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
// 1. Import Navbar và Footer
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      {/* 2. Hiển thị Navbar ở trên cùng */}
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <section className="relative py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Về <span className="text-orange-600">QuickCart</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Điểm đến tin cậy cho tín đồ công nghệ. Chúng tôi không chỉ bán sản phẩm, chúng tôi mang đến trải nghiệm âm thanh và hiệu năng đỉnh cao.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg bg-gray-200">
              {/* Bạn thay ảnh văn phòng/team vào đây */}
              <Image 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Văn phòng QuickCart" 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Câu chuyện khởi đầu</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Được thành lập với niềm đam mê bất tận dành cho công nghệ, QuickCart ra đời với mục tiêu đơn giản: Giúp người dùng Việt Nam tiếp cận các sản phẩm Laptop, PC và Âm thanh chính hãng một cách dễ dàng và nhanh chóng nhất.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Từ những chiếc tai nghe Audiophile cho đến những dàn PC Gaming hiệu năng cao, mỗi sản phẩm tại QuickCart đều được tuyển chọn kỹ lưỡng để đảm bảo chất lượng tốt nhất khi đến tay khách hàng.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <h3 className="text-4xl font-bold text-orange-600">5K+</h3>
                  <p className="text-gray-500">Khách hàng hài lòng</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-orange-600">100%</h3>
                  <p className="text-gray-500">Sản phẩm chính hãng</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Tại sao chọn QuickCart?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <ValueCard 
                icon="🚀" 
                title="Giao hàng thần tốc" 
                desc="Đúng như tên gọi, chúng tôi cam kết quy trình đóng gói và vận chuyển nhanh nhất có thể." 
              />
              <ValueCard 
                icon="🛡️" 
                title="Bảo hành uy tín" 
                desc="Chính sách bảo hành rõ ràng, hỗ trợ kỹ thuật trọn đời cho các sản phẩm Laptop và PC." 
              />
              <ValueCard 
                icon="💎" 
                title="Chất lượng cam kết" 
                desc="Nói không với hàng giả. Hoàn tiền 200% nếu phát hiện hàng kém chất lượng." 
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Sẵn sàng nâng cấp trải nghiệm của bạn?</h2>
          <Link 
            href="/" 
            className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition duration-300"
          >
            Khám phá sản phẩm ngay
          </Link>
        </section>
      </div>

      {/* 3. Hiển thị Footer ở dưới cùng */}
      <Footer />
    </>
  );
}

function ValueCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}