import React from "react";
import AboutPeople from "../components/AboutPeople";
import AboutStats from "../components/AboutStats";
import AboutMission from "../components/AboutMission";
import AboutGraph from "../components/AboutGraph";
import AboutSlideshow from "../components/AboutSlideshow";

const slideshowImages = [
  "../images/slide1.jpg",
  "/images/slide2.jpg",
  "/images/slide4.jpg",
  "/images/slide5.jpg"
  // Add more images as needed
];

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <AboutMission />
      <AboutPeople />
      <AboutStats />
      <AboutGraph />
      <AboutSlideshow images={slideshowImages} slideDuration={6000} />
    </div>
  );
};

export default About;
