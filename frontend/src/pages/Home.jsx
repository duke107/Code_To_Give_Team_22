import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ContactForm from "../components/ContactForm";
import AccessibilityMenu from "../components/AccessibilityMenu";
import TranslateButton from "../TranslateButton";
import { Star, HandHelping, Globe, Award } from "lucide-react";
import TestimonialCarousel from "../components/TestimonialCarousal";

function Home() {
    const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/events/getRecentTestimonials', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setTestimonials(data);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  const settings = {
    dots: true,
    infinite: testimonials.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
       {/* Hero Section */}

<div
  className="h-[75vh] relative flex flex-col items-center justify-center text-white text-center bg-cover bg-center"
  style={{ backgroundImage: "url('https://scoonews.com/wp-content/uploads/2022/07/inclusive-education-in-india-pic15845991261584599126.jpg')" }}
>
  <h1 className="text-5xl md:text-6xl font-bold mt-16 mb-4" style={{ fontFamily: "'Roboto', sans-serif" }}>
    Welcome to Samarthanam
  </h1>
  <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ fontFamily: "'Roboto', sans-serif" }}>
    Empowering lives and creating opportunities.
  </p>
  <Link
    to="/donate"
    className="mt-6 px-6 py-3 bg-white text-red-600 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
    style={{ fontFamily: "'Roboto', sans-serif" }}
  >
    Donate Now
  </Link>
</div>


       {/* Vision Section */}
       <div className="py-12 px-4 sm:px-8 text-center bg-gradient-to-b from-gray-50 to-white">
  <h2 className="text-4xl font-bold mb-8 text-red-600" 
      style={{ 
        fontFamily: "'Montserrat', sans-serif",
        textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
      }}>
    OUR VISION
  </h2>
  <div className="max-w-4xl mx-auto">
    <p className="text-xl text-gray-700 leading-relaxed px-4" 
       style={{
         fontFamily: "'Poppins', sans-serif",
         lineHeight: '1.8'
       }}>
      <span className="text-red-500 font-semibold">"</span>
      An inclusive society free from discrimination where persons with disabilities become contributing members, living with dignity and respect.
      <span className="text-red-500 font-semibold">"</span>
    </p>
  </div>
</div>


       {/* Mission Section */}
       <div className="py-12 px-4 sm:px-8 text-center bg-gradient-to-b from-gray-50 to-white">
  <h2 className="text-4xl font-bold mb-8 text-red-600" 
      style={{ 
        fontFamily: "'Montserrat', sans-serif",
        textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
      }}>
    OUR MISSION
  </h2>
  <div className="max-w-4xl mx-auto">
    <p className="text-xl text-gray-700 leading-relaxed px-4" 
       style={{
         fontFamily: "'Poppins', sans-serif",
         lineHeight: '1.8'
       }}>
      <span className="text-red-500 font-semibold">"</span>
      To empower visually impaired, disabled and underprivileged people through developmental initiatives focusing on educational, social, economic, cultural and technological aspects.
      <span className="text-red-500 font-semibold">"</span>
    </p>
  </div>
</div>

       

       

        {/*our impact section*/}
        <div className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12" style={{ fontFamily: "'Roboto', sans-serif" }}>OUR IMPACT</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Impact Item 1 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-4xl font-bold text-red-600 mb-2">34000+</h3>
              <p className="text-xl font-semibold mb-2">STUDENTS</p>
              <p className="text-gray-600">received education</p>
            </div>
            {/* Impact Item 2 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-4xl font-bold text-red-600 mb-2">18000+</h3>
              <p className="text-xl font-semibold mb-2">VOLUNTEERS</p>
              <p className="text-gray-600">involved in NGO</p>
            </div>
            {/* Impact Item 3 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-4xl font-bold text-red-600 mb-2">150+</h3>
              <p className="text-xl font-semibold mb-2">CORPORATE COMPANIES</p>
              <p className="text-gray-600">supporting via CSR</p>
            </div>
            {/* Impact Item 4 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-4xl font-bold text-red-600 mb-2">30000+</h3>
              <p className="text-xl font-semibold mb-2">YOUTH</p>
              <p className="text-gray-600">received livelihood training, 67% placed</p>
            </div>
          </div>
          {/* View More Button */}
          <div className="text-center mt-10">
            {/* <Link 
              to="/about" 
              className="inline-block px-6 py-3 bg-red-400 text-white font-semibold rounded-lg hover:bg-red-400 transition duration-300"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              View More
            </Link> */}
          <Link 
            to="/about" 
            className="inline-block px-6 py-3 bg-white text-red-600 font-semibold rounded-lg border-2 border-red-600 hover:shadow-md transition duration-300"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            View More
          </Link>
          </div>
        </div>
      </div>
      
     
      
      {/* Testimonials Section */}
<div className="max-w-4xl mx-auto my-16 p-10 bg-white shadow-lg rounded-lg text-center relative">
  <h2 className="text-4xl font-semibold mb-4" style={{ fontFamily: "'Roboto', sans-serif" }}>
    Testimonials
  </h2>

  {testimonials.length > 0 ? (
    <Slider {...{
      dots: true,
      infinite: testimonials.length > 1,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      arrows: false, // Removed previous/next arrows
    }}>
      {testimonials.map((testimonial) => (
        <div key={testimonial._id} className="flex flex-col md:flex-row items-center text-left p-6 gap-6">
          
          {/* Profile Image */}
          <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              <img
                src={testimonial.userPicture || "https://en-media.thebetterindia.com/uploads/2014/01/Photo-1-8.jpg"}
                alt={testimonial.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Testimonial Content */}
          <div className="flex-1 flex flex-col justify-start text-center md:text-left">
            <h3 className="text-3xl font-bold text-red-600">{testimonial.name}</h3>
            <p className="text-sm text-gray-500">{testimonial.eventTitle} - {testimonial.volunteeringPosition}</p>
            <p className="text-gray-700 text-lg font-roboto leading-relaxed my-3">"{testimonial.testimonial}"</p>
            
          </div>
        </div>
      ))}
    </Slider>
  ) : (
    <p className="text-gray-500">No testimonials available yet.</p>
  )}
</div>


      {/* Accessibility & Translate Buttons */}
      <AccessibilityMenu />
      <TranslateButton />
    </div>
  );
}

export default Home;