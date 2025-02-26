import React from "react";
import Link from "next/link";

import { ForwardArrowIcon } from "@/components/icons";

const AuthButtons = () => {
  return (
    <>
      <Link
        href="/#"
        className="hidden md:flex px-6 py-2.5 lg:px-2 xl:px-6 text-base text-dark hover:text-primary dark:text-white"
      >
        LOG IN
        <ForwardArrowIcon />
      </Link>

      <Link
        href="/#"
        className="hidden md:block rounded-md bg-purple px-6 py-2.5 text-base text-white hover:bg-purple/90"
      >
        SIGN UP
      </Link>
    </>
  );
};

export default AuthButtons;
