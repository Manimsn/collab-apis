import React from "react";

const Footer = () => {
  console.log("Public Footer Rendered");
  return <div>Public Footer</div>;
};

// ✅ Export directly
export default React.memo(Footer);
