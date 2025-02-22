import { ForwardArrowIcon } from "@/components/icons";
import Link from "next/link";
import React from "react";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-x-6">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-dark-2 dark:text-light-1 flex items-center"
      >
        LOG IN
        <ForwardArrowIcon />
      </Link>
      <Link
        href="/signup"
        className="rounded bg-purple duration-300 ease-in-out px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        SIGN UP
      </Link>
    </div>
  );
};

export default AuthButtons;
