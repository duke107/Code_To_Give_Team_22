import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


function Home() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/v1/events/getRecentTestimonials",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setTestimonials(data);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      }
    };
    fetchTestimonials();
  }, []);

  // Slider settings for both keyboard & regular users
  const settings = {
    dots: true,
    infinite: testimonials.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Mouse users get auto-scroll
    autoplaySpeed: 3000,
    pauseOnFocus: true, // Stops when user navigates via keyboard
    accessibility: true, // Enables keyboard arrow navigation
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div
        className="h-[70vh] flex flex-col items-center justify-center bg-blue-600 text-white text-center focus:outline-none focus:ring-4 focus:ring-blue-300"
        tabIndex="0"
        role="banner"
        aria-label="Welcome Section"
      >
        <h1 className="text-4xl font-bold mb-4">Welcome to Samarthanam</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Empowering lives and creating opportunities.
        </p>
        <Link
          to="/donate"
          className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300 focus:ring-4 focus:ring-blue-400"
          tabIndex="0"
          aria-label="Donate Now"
        >
          Donate Now
        </Link>
      </div>

      {/* Mission Section */}
      <div className="p-8 text-center focus:outline-none focus:ring-4 focus:ring-gray-300" tabIndex="0">
        <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
        <p className="max-w-3xl mx-auto text-gray-700">
          We strive to empower the disabled and create a more inclusive world through education, rehabilitation, and innovation.
        </p>
      </div>

      {/* Carousel for Recent Testimonials */}
      <div className="max-w-5xl mx-auto mb-16 focus:outline-none focus:ring-4 focus:ring-gray-300" tabIndex="0">
        <h2 className="text-2xl font-semibold text-center mb-4">What Our Volunteers Say</h2>
        {testimonials.length > 0 ? (
          <Slider {...settings}>
            {testimonials.map((testimonial) => (
              <div key={testimonial._id} className="px-4 py-6" tabIndex="0">
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4 focus:outline-none focus:ring-4 focus:ring-gray-300">
                  {/* Left side: Testimonial content */}
                  <div className="flex-1">
                    <p className="text-gray-800 text-base md:text-lg italic mb-4" tabIndex="0">
                      "{testimonial.testimonial}"
                    </p>
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold" tabIndex="0">{testimonial.name}</p>
                      <p tabIndex="0">
                        {testimonial.eventTitle} - {testimonial.volunteeringPosition}
                      </p>
                    </div>
                  </div>
                  {/* Right side: User picture (if available) */}
                  <div tabIndex="0">
                    {testimonial.userPicture ? (
                      <img
                        src={testimonial.userPicture}
                        alt={`Picture of ${testimonial.name}`}
                        className="w-24 h-24 object-cover rounded-full"
                      />
                    ) : (
                      <div
                        className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-300 focus:ring-4 focus:ring-gray-400"
                        tabIndex="0"
                        aria-label="No profile picture available"
                      >
                        <span className="text-gray-700">No Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center text-gray-500" tabIndex="0">
            No testimonials available yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
