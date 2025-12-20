import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-400/30 text-gray-600">

        {/* Logo + mô tả */}
        <div className="w-4/5 md:w-1/3 rounded">
          <Image
            className="w-28 md:w-32"
            src="/images/logo.jpg"
            alt="logo"
            width={128}
            height={128}
          />
          <p className="mt-6 text-sm leading-relaxed">
            Chúng tôi cung cấp các sản phẩm chất lượng cao với giá cả hợp lý,
            đảm bảo trải nghiệm mua sắm tuyệt vời và dịch vụ hỗ trợ tận tâm.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4 mt-4">
            <a href="#" className="hover:opacity-80 transition">
              <Image
                src="/images/facebook.png"
                alt="Facebook"
                width={26}
                height={26}
              />
            </a>
            <a href="#" className="hover:opacity-80 transition">
              <Image
                src="/images/youtube.png"
                alt="YouTube"
                width={26}
                height={26}
              />
            </a>
          </div>
        </div>

        {/* Company */}
        <div className="w-1/2 md:w-1/3 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-semibold text-gray-900 mb-5">Công ty</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="#">Trang chủ</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Về chúng tôi</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Liên hệ</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Chính sách bảo mật</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="w-1/2 md:w-1/3 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-semibold text-gray-900 mb-5">Liên hệ</h2>
            <div className="text-sm space-y-2">
              <p>+84 0123 456 789</p>
              <p>support@yourstore.vn</p>
              <p>Hỗ trợ từ 8:00 - 22:00 mỗi ngày</p>
            </div>
          </div>
        </div>
      </div>

      <p className="py-4 text-center text-xs md:text-sm text-gray-500">
        © 2025 Bản quyền thuộc về Alt+F4. Đã đăng ký bản quyền.
      </p>
    </footer>
  );
};

export default Footer;
