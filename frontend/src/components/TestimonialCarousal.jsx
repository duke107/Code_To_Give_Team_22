import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TestimonialCarousel = ({ testimonials }) => {
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const modalRef = useRef(null);

  const closeModal = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setSelectedTestimonial(null);
    }
  };

  const settings = {
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024, // md and below (tablet & mobile)
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 2000, // lg and above (desktop)
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="w-3/4 mx-auto mt-10">
      <Slider {...settings}>
        {testimonials.map((t) => (
          <div key={t._id} className="bg-white shadow-lg rounded-xl p-5 h-[420px] flex flex-col justify-between mx-4 ml-5 mr-5">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              {t.userPicture ? (
                <img src={t.userPicture} alt={t.name} className="w-24 h-24 rounded-full border-2 border-gray-300" />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-12 h-12 text-gray-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2a5 5 0 00-5 5v1a5 5 0 1010 0V7a5 5 0 00-5-5zm-3 6V7a3 3 0 116 0v1a3 3 0 11-6 0zm-5 9a7 7 0 0114 0v2a1 1 0 11-2 0v-2a5 5 0 00-10 0v2a1 1 0 11-2 0v-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-semibold mt-2">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.volunteeringPosition} at {t.eventTitle}</p>
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-600 text-center mt-3">
              {t.testimonial.split(" ").slice(0, 40).join(" ")}...
            </p>

            {/* Read More Button */}
            <button onClick={() => setSelectedTestimonial(t)} className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Read More
            </button>
          </div>
        ))}
      </Slider>

      {/* Testimonial Modal */}
      {selectedTestimonial && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md" onClick={closeModal}>
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button onClick={() => setSelectedTestimonial(null)} className="absolute top-2 right-2 text-gray-600 text-xl">
              &times;
            </button>
            <h2 className="text-xl font-semibold">{selectedTestimonial.name}</h2>
            <p className="text-gray-500 text-sm">{selectedTestimonial.volunteeringPosition} at {selectedTestimonial.eventTitle}</p>
            <p className="mt-3 text-gray-700">{selectedTestimonial.testimonial}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialCarousel;
