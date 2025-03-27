import React, { useState, useRef } from "react";
import Slider from "react-slick";
import People from "../data/people.json"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const AboutPeople = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const modalRef = useRef(null);

  const closeModal = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setSelectedMember(null);
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

  const placeholderImage = "https://via.placeholder.com/150/CCCCCC/808080?text=Profile"; 

  return (
    <div className="w-3/4 mx-auto py-16">
      <h2 className="text-4xl font-extrabold text-blue-800 text-center mb-12">
        Meet Our Leaders
      </h2>

      <Slider {...settings}>
        {People.map((member) => (
          <div key={member.id} className="bg-white shadow-lg rounded-xl p-5 h-[420px] flex flex-col justify-between mx-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <img src={member.image || placeholderImage} className="w-24 h-24 rounded-full border-2 border-gray-300" />
              <h3 className="text-lg font-semibold mt-2">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.title}</p>
            </div>

            {/* Bio */}
            <p className="text-gray-600 text-center mt-3">
              {member.bio.split(" ").slice(0, 90).join(" ")}...
            </p>

            {/* Read More Button */}
            {/* <button
              onClick={() => setSelectedMember(member)}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Read More
            </button> */}
          </div>
        ))}
      </Slider>

      {/* Modal for Detailed View */}
      {selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md" onClick={closeModal}>
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button onClick={() => setSelectedMember(null)} className="absolute top-2 right-2 text-gray-600 text-xl">
              &times;
            </button>
            <h2 className="text-xl font-semibold">{selectedMember.name}</h2>
            <p className="text-gray-500 text-sm">{selectedMember.title}</p>
            <p className="mt-3 text-gray-700">{selectedMember.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPeople;
