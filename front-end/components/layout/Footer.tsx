import React from "react";

const Footer = () => {
  console.log("Public Footer Rendered");
  return <div className="bg-red sm:bg-green md:bg-blue lg:bg-yellow xl:bg-purple 2xl-pink">Public Footer</div>;
};

// ✅ Export directly
export default React.memo(Footer);
