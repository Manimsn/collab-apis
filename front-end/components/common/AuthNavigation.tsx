import Image from "next/image";
import Link from "next/link";
import React from "react";
import ForwardArrow from "../icons/actions/ForwardArrowIcon";
import UserMenu from "./user/UserMenu";
import AuthButtons from "./auth/AuthButtons";

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
    <div className="sm:flex md:flex pr-3 hidden">
      {loginStatus ? (
        loading ? (
          <div>Checking</div>
        ) : (
          <UserMenu userDetails={userDetails} />
        )
      ) : (
        <AuthButtons />
        // <div>Check</div>
      )}
    </div>
  );
};

export default AuthNavigation;
