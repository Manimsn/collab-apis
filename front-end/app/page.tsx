import React from "react";

import HeroSection from "@/components/common/ui/HeroSection";
import WelcomeSection from "@/components/common/ui/WelcomeSection";
import FeatureHighlights from "@/components/common/ui/FeatureHighlights";
import OurMission from "@/components/common/ui/OurMission";

const Home = () => {
  return (
    <>
      <HeroSection />
      <WelcomeSection />
      <FeatureHighlights />
      <OurMission />
    </>
  );
};

export default Home;
