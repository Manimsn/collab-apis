import React from "react";
import Link from "next/link";
import ThemeToggle from "../common/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/3d-model-viewer-online", label: "Online 3D Model Viewer" },
  { href: "/about-us", label: "About Us" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/signup", label: "Sign Up" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/core-features", label: "Core Features" },
  { href: "/custom-3d-modeling-service", label: "Custom 3d Modeling Service" },
  { href: "/faqs", label: "FAQs" },
  { href: "/panorama-image-viewer", label: "FAQs" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/visualize-interior-3d", label: "Visualize Interior 3d" },
];

const NavLinks = () => {
  console.log("Public Header Rendered");
  return (
    <nav>
      <ul className="flex space-x-4">
        {navLinks.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="text-blue-600 hover:underline">
              {label}
            </Link>
          </li>
        ))}
        <div>
          <ThemeToggle />
        </div>
      </ul>
    </nav>
  );
};

// ✅ Wrap the named function component inside React.memo()

export default React.memo(NavLinks);
