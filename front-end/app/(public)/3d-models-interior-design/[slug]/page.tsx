import ThreeModelViewer from "@/components/layout/public/ThreeModels/ThreeModelViewer";
import React from "react";

const page = ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  return <ThreeModelViewer />;
};

export default page;
