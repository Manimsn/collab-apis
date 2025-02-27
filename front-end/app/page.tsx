import React from "react";

import HeroSection from "@/components/common/ui/HeroSection";
import WelcomeSection from "@/components/common/ui/WelcomeSection";
import FeatureHighlights from "@/components/common/ui/FeatureHighlights";

const Home = () => {
  return (
    <>
      <HeroSection />
      <WelcomeSection />
      <FeatureHighlights />
    </>
  );
};

export default Home;
