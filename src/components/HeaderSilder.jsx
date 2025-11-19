import React, { useState, useEffect } from "react";
import Image from "next/image";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Trải nghiệm âm thanh thuần khiết - Tai nghe hoàn hảo dành cho bạn!",
      offer: "Ưu đãi có hạn - Giảm ngay 30%",
      buttonText1: "Mua ngay",
      buttonText2: "Xem thêm",
      imgSrc: "/images/header_headphone_image.png",
    },
    {
      id: 2,
      title: "Bước vào thế giới game đỉnh cao - Khám phá PlayStation 5 ngay hôm nay!",
      offer: "Nhanh tay - Số lượng có hạn!",
      buttonText1: "Mua ngay",
      buttonText2: "Khám phá ưu đãi",
      imgSrc: "/images/header_playstation_image.png",
    },
    {
      id: 3,
      title: "Sức mạnh và đẳng cấp - MacBook Pro mới đã có mặt!",
      offer: "Ưu đãi độc quyền - Giảm đến 40%",
      buttonText1: "Đặt hàng ngay",
      buttonText2: "Tìm hiểu thêm",
      imgSrc: "/images/header_macbook_image.png",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6">
                <button className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium">
                  {slide.buttonText1}
                </button>
                <button className="group flex items-center gap-2 px-6 py-2.5 font-medium">
                  {slide.buttonText2}
                  <Image
                    className="group-hover:translate-x-1 transition"
                    src="/images/arrow_icon.png"
                    alt="arrow_icon"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
                width={288} // set width & height phù hợp
                height={288}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
