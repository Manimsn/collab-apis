import React from "react";

import UserMenu from "./user/UserMenu";
import AuthButtons from "./auth/AuthButtons";
import ThemeToggle from "./ThemeToggle";

const AuthNavigation = () => {
  const userDetails = {
    firstName: "Manikandan",
    lastName: "Manikandan",
    emailAddress: "Manikandan",
    designation: "Manikandan",
    fileS3Id: "Manikandan",
  };

  const loginStatus = false;
  const loading = false;

  return (
    <>
      <div className=" justify-end pr-16 sm:flex lg:pr-0">
        <ThemeToggle />
        {loginStatus ? (
          loading ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="w-24 flex flex-col justify-center items-end">
                <div className="h-2.5 bg-light-4 rounded w-full mb-2"></div>
                <div className="h-2 bg-light-4 rounded w-[80%]"></div>
              </div>
              <div className="w-[45px] h-[45px] bg-light-4 rounded-full " />
            </div>
          ) : (
            <UserMenu userDetails={userDetails} />
          )
        ) : (
          <AuthButtons />
        )}
      </div>
    </>
  );
};

export default AuthNavigation;
