import React from "react";

import HeroSection from "@/components/common/ui/HeroSection";
import WelcomeSection from "@/components/common/ui/WelcomeSection";
import FeatureHighlights from "@/components/common/ui/FeatureHighlights";
import OurMission from "@/components/common/ui/OurMission";
import AllInOneSolution from "@/components/common/ui/AllInOneSolution";

const Home = () => {
  return (
    <>
      <HeroSection />
      <WelcomeSection />
      <FeatureHighlights />
      <OurMission />
      <AllInOneSolution />
    </>
  );
};

export default Home;
