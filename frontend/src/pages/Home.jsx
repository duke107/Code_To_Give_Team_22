import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick'; // Import react-slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import AccessibilityMenu from "../components/AccessibilityMenu";
import TranslateButton from '../TranslateButton';
function Home() {
  const [testimonials, setTestimonials] = useState([]);

  // Fetch the recent 10 testimonials from your backend
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/events/getRecentTestimonials', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Allows cookies if needed
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        console.log('Fetched testimonials:', data);
        setTestimonials(data); // Expecting an array of testimonial objects
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  // react-slick settings
  const settings = {
    dots: true,
    infinite: testimonials.length > 1, // Dynamically disable infinite if there's only 1
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="h-[70vh] relative flex flex-col items-center justify-center bg-blue-700 text-white text-center px-6">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Welcome to Samarthanam</h1>
        <p className="text-lg max-w-2xl mx-auto opacity-90 leading-relaxed">
          Empowering lives and creating opportunities.
        </p>
        <Link
          to="/donate"
          className="mt-6 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
        >
          Donate Now
        </Link>
      </div>
  
      {/* Mission Section */}
      <div className="p-12 text-center">
        <h2 className="text-4xl font-semibold text-gray-900 mb-6">Our Mission</h2>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
          We strive to empower the disabled and create a more inclusive world through education,
          rehabilitation, and innovation.
        </p>
      </div>
  
      {/* Carousel for Recent Testimonials */}
      <div className="max-w-5xl mx-auto mb-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-900">What Our Volunteers Say</h2>
        {testimonials.length > 0 ? (
          <Slider {...settings}>
            {testimonials.map((testimonial) => (
              <div key={testimonial._id} className="px-4 py-6">
                <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition duration-300 hover:shadow-xl">
                  {/* Left side: Testimonial content */}
                  <div className="flex-1">
                    <p className="text-gray-800 text-lg italic mb-4 leading-relaxed">
                      "{testimonial.testimonial}"
                    </p>
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-500">
                        {testimonial.eventTitle} - {testimonial.volunteeringPosition}
                      </p>
                    </div>
                  </div>
                  {/* Right side: User picture (if available) */}
                  <div className="w-24 h-24 flex-shrink-0">
                    {testimonial.userPicture ? (
                      <img
                        src={testimonial.userPicture}
                        alt={testimonial.name}
                        className="w-24 h-24 object-cover rounded-full border-2 border-blue-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-300 text-gray-700">
                        No Photo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center text-gray-500">No testimonials available yet.</p>
        )}
      </div>
  
      {/* Accessibility & Translation */}
      <div className="fixed bottom-6 right-6 flex gap-4">
        <AccessibilityMenu />
        <TranslateButton />
      </div>
    </div>
  );
  
}

export default Home;
