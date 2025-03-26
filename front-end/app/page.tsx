import React from "react";

import HeroSection from "@/components/common/ui/HeroSection";
import WelcomeSection from "@/components/common/ui/WelcomeSection";
import FeatureHighlights from "@/components/common/ui/FeatureHighlights";
import OurMission from "@/components/common/ui/OurMission";
import AllInOneSolution from "@/components/common/ui/AllInOneSolution";
import HowItWorks from "@/components/common/ui/HowItWorks";

const Home = () => {
  return (
    <>
      <HeroSection />
      <WelcomeSection />
      <FeatureHighlights />
      <OurMission />
      <AllInOneSolution />
      <HowItWorks />
    </>
  );

  //   px
  // px-16 pt-32 pb-40
  // md:px-40 pt-48 pb-48
};

export default Home;
