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
                const res = await fetch("http://localhost:3000/api/v1/events/getRecentTestimonials", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
                const data = await res.json();
                setTestimonials(data);
            } catch (err) {
                console.error("Error fetching testimonials:", err);
            }
        };
        fetchTestimonials();
    }, []);

    return (
      <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <div
              className="h-[75vh] relative flex flex-col items-center justify-center text-white text-center bg-cover bg-center"
              style={{ backgroundImage: "url('https://scoonews.com/wp-content/uploads/2022/07/inclusive-education-in-india-pic15845991261584599126.jpg')" }}
          >
              <h1 className="text-4xl md:text-4xl font-bold mt-16 mb-4" style={{ fontFamily: "'Roboto', sans-serif" }}>
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
              <h2 className="text-4xl font-bold mb-8 text-red-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  OUR VISION
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <span className="text-red-500 font-semibold">"</span>
                  An inclusive society free from discrimination where persons with disabilities become contributing members, living with dignity and respect.
                  <span className="text-red-500 font-semibold">"</span>
              </p>
          </div>

          {/* Mission Section */}
          <div className="py-12 px-4 sm:px-8 text-center bg-gradient-to-b from-gray-50 to-white">
              <h2 className="text-4xl font-bold mb-8 text-red-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  OUR MISSION
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <span className="text-red-500 font-semibold">"</span>
                  To empower visually impaired, disabled and underprivileged people through developmental initiatives focusing on educational, social, economic, cultural and technological aspects.
                  <span className="text-red-500 font-semibold">"</span>
              </p>
          </div>

          {/* Our Impact Section */}
          <div className="py-12 bg-white">
              <div className="max-w-6xl mx-auto px-4">
                  <h2 className="text-3xl font-semibold text-center mb-12" style={{ fontFamily: "'Roboto', sans-serif" }}>
                      OUR IMPACT
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {[
                          { count: "34000+", label: "STUDENTS", desc: "received education" },
                          { count: "18000+", label: "VOLUNTEERS", desc: "involved in NGO" },
                          { count: "150+", label: "CORPORATE COMPANIES", desc: "supporting via CSR" },
                          { count: "30000+", label: "YOUTH", desc: "received livelihood training, 67% placed" },
                      ].map(({ count, label, desc }) => (
                          <div key={label} className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-4xl font-bold text-red-600 mb-2">{count}</h3>
                              <p className="text-xl font-semibold mb-2">{label}</p>
                              <p className="text-gray-600">{desc}</p>
                          </div>
                      ))}
                  </div>
                  <div className="text-center mt-10">
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

          {/* Testimonials Section (Unchanged) */}
          <section>
              {testimonials.length > 0 && <TestimonialCarousel testimonials={testimonials} />}
          </section>

          {/* Contact Form (Unchanged) */}
          <section className="py-10 bg-white">
              <div className="max-w-4xl mx-auto px-4">
                  <ContactForm />
              </div>
          </section>

          {/* Accessibility & Translation */}
          <div className="fixed bottom-4 right-4 flex gap-2 z-50">
              <AccessibilityMenu />
              <TranslateButton />
          </div>
      </div>
  );
}

export default Home;