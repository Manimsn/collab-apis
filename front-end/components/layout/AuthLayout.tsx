"use client";

import { useAuthContext } from "@/components/common/AuthProvider";
import { usePathnameContext } from "@/components/common/PathnameProvider";
import PublicLayout from "@/components/layout/PublicLayout";
import PrivateHeader from "@/components/layout/PrivateHeader";
import Sidebar from "@/components/layout/Sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthContext();
  const { pathname } = usePathnameContext();

  // Define static public routes
  const staticPublicRoutes = [
    "/",
    "/about-us",
    "/auth/login",
    "/auth/signup",
    "/contact-us",
    "/core-features",
    "/custom-3d-modeling-service",
    "/faqs",
    "/panorama-image-viewer",
    "/refund-policy",
    "/visualize-interior-3d",
  ];

  // Regex to match dynamic public pages

  // Array of regex patterns for dynamic public routes
  const dynamicPublicRoutes = [
    /^\/3d-models-interior-design(\/[\w-%]+)?$/, // updated regex to allow UUIDs and encoded characters like %7D
  ];

  // Check if the current page should use the public layout
  const isPublicPage =
    staticPublicRoutes.includes(pathname) ||
    dynamicPublicRoutes.some((regex) => regex.test(pathname));

  return isPublicPage ? (
    <PublicLayout>{children}</PublicLayout>
  ) : isAuthenticated ? (
    <>
      <PrivateHeader />
      <div>
        <Sidebar />
        <main>{children}</main>
      </div>
    </>
  ) : (
    <main>{children}</main>
  );
}
