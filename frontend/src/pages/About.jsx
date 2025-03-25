import React from "react";
import AboutPeople from "../components/AboutPeople";
import AboutStats from "../components/AboutStats";
import AboutMission from "../components/AboutMission";
import AboutGraph from "../components/AboutGraph";

const About = () => {
  return (
    <div className="min-h-screen">
      <AboutMission />
      <AboutPeople />
      <AboutStats />
      <AboutGraph />
    </div>
  );
};

export default About;
