import React from "react";
import RenderProfileImage from "./RenderProfileImage";
import Link from "next/link";

const UserMenu = ({ userDetails }: { userDetails: any }) => {
  const menuItems = [
    { label: "Dashboard", link: "/dashboard/feed" },
    { label: "Profile Settings", link: "/dashboard/profile" },
    { label: "Model Downloads", link: "/dashboard/ModelDownloads" },
    { label: "Billing", link: "/dashboard/billing" },
    { label: "Sign Out", link: "/", replace: true },
  ];

  return (
    <div id="user-menu" className="group relative hidden md:block lg:block">
      <Link href="#" className="flex items-center">
        <p className="mr-2 text-right text-sm font-medium text-dark-1 dark:text-light-3 hidden xl:block">
          {userDetails?.firstName || userDetails?.emailAddress}{" "}
          {userDetails?.lastName}
          <span className="block text-xs font-normal text-body-color dark:text-light-4">
            {userDetails?.designation}
          </span>
        </p>
        {RenderProfileImage(userDetails)}
      </Link>

      {/* Dropdown Menu */}
      <div className="invisible absolute right-0 top-[120%] mt-3 w-[200px] space-y-2 rounded bg-light-0 dark:bg-dark-1 p-3 opacity-0 shadow-card-2 duration-200 group-hover:visible group-hover:top-full group-hover:opacity-100">
        {menuItems.map(({ label, link, replace }, index) => (
          <Link
            key={index}
            href={link}
            replace={replace}
            className="block rounded px-4 py-2 text-sm font-medium text-dark-2 dark:text-light-2 hover:bg-light-2 dark:hover:bg-dark-3"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserMenu;
