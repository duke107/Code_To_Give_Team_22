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
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="h-[85vh] flex flex-col items-center justify-center text-center bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-700 opacity-10 animate-pulse"></div>
                <h1 className="text-4xl font-extrabold mb-4 relative z-10">Welcome to Samarthanam</h1>
                <p className="text-lg max-w-xl mb-6 relative z-10">
                    Empowering lives and creating opportunities through inclusivity, education, and innovation.
                </p>
                <Link
                    to="/donate"
                    className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-md hover:bg-gray-100 transition duration-300 relative z-10 group"
                >
                    Donate Now
                    <span className="absolute inset-0 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                </Link>
            </div>

            {/* Impact Highlights */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <div className="text-center p-6 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                        <HandHelping className="mx-auto mb-4 text-blue-600" size={48} />
                        <h3 className="font-bold text-xl mb-2">Community Support</h3>
                        <p className="text-gray-600">Providing comprehensive support to those in need.</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                        <Globe className="mx-auto mb-4 text-blue-600" size={48} />
                        <h3 className="font-bold text-xl mb-2">Global Reach</h3>
                        <p className="text-gray-600">Expanding our impact across communities.</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                        <Award className="mx-auto mb-4 text-blue-600" size={48} />
                        <h3 className="font-bold text-xl mb-2">Recognition</h3>
                        <p className="text-gray-600">Recognized for outstanding social initiatives.</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                        <Star className="mx-auto mb-4 text-blue-600" size={48} />
                        <h3 className="font-bold text-xl mb-2">Innovative Solutions</h3>
                        <p className="text-gray-600">Creating transformative approaches to challenges.</p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-gray-50 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6 text-blue-800">Our Mission</h2>
                    <p className="text-xl text-gray-700 leading-relaxed">
                        We strive to empower the disabled and create a more inclusive world through education, rehabilitation, and innovative support strategies that transform lives and break down barriers.
                    </p>
                </div>
            </section>

            {/* Testimonials Section */}
            <section>
              {testimonials.length > 0 && <TestimonialCarousel testimonials={testimonials} />}
            </section>

            {/* Contact Form */}
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