"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WarrantyPolicyPage() {
  return (
    <>
      <Navbar />

      <div className="px-6 md:px-20 lg:px-40 py-12 text-gray-800">
        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold mb-4">Chính Sách Bảo Hành</h1>
        <div className="w-20 h-1 bg-orange-600 mb-8 rounded-full"></div>

        {/* Nội dung */}
        <div className="space-y-8 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Thời gian bảo hành</h2>
            <p>
              • Sản phẩm laptop được bảo hành <span className="font-semibold">12 tháng</span> theo chính sách của hãng.
              <br />• Pin và sạc được bảo hành <span className="font-semibold">6 tháng</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Điều kiện bảo hành</h2>
            <p>
              • Sản phẩm còn tem bảo hành, không bị rách hoặc sửa đổi. <br />
              • Không bị va đập, vô nước hoặc cháy nổ do người dùng. <br />
              • Máy không bị can thiệp phần cứng bởi bên thứ ba.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Trường hợp không được bảo hành</h2>
            <p>
              • Máy bị rơi, nứt, móp hoặc cong Mainboard. <br />
              • Hư hỏng do sử dụng sai hướng dẫn. <br />
              • Phần mềm bị lỗi do người dùng tự cài đặt. <br />
              • Máy bị vào nước, ẩm mốc, cháy nổ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Quy trình bảo hành</h2>
            <p>
              • Khách hàng mang sản phẩm và hoá đơn mua hàng đến cửa hàng. <br />
              • Nhân viên kiểm tra và tiếp nhận máy. <br />
              • Thời gian xử lý bảo hành từ <span className="font-semibold">3–7 ngày</span> tuỳ tình trạng. <br />
              • Trường hợp phải gửi hãng có thể lâu hơn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Đổi trả sản phẩm</h2>
            <p>
              • Đổi mới trong <span className="font-semibold">7 ngày</span> nếu lỗi phần cứng từ nhà sản xuất. <br />
              • Không áp dụng đổi trả với sản phẩm lỗi do người dùng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Liên hệ hỗ trợ</h2>
            <p>
              Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ:
              <br />• Hotline: <span className="font-semibold">0123 456 789</span>
              <br />• Email: <span className="font-semibold">support@laptopstore.vn</span>
              <br />• Fanpage: Laptop Store
            </p>
          </section>

        </div>
      </div>

      <Footer />
    </>
  );
}
