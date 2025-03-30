// import React from "react";

// const Footer = () => {
//   console.log("Public Footer Rendered");
//   return <div className="mt-40 bg-red sm:bg-green md:bg-blue lg:bg-yellow xl:bg-purple 2xl-pink">Public Footer</div>;
// };

// // ✅ Export directly
// export default React.memo(Footer);

import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  EmailIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "../icons";

const Footer3 = () => {
  return (
    <>
      <div className="mt-0 bg-red sm:bg-green md:bg-blue lg:bg-yellow xl:bg-purple 2xl-pink">
        Public Footer
      </div>

      <footer className="relative z-10 bg-white pb-10 pt-20 dark:bg-dark lg:pb-0 lg:pt-[40px]">
        <div className="md:max-w-none md:mx-12">
          {/* <div className="container mx-auto"> */}
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 sm:w-2/3 lg:w-3/12">
              <div className="mb-10 w-full">
                <Link href="/#" className="block w-full py-5">
                  <Image
                    src="/images/logo.svg"
                    width={150}
                    height={100}
                    className="max-w-full dark:hidden"
                    alt="Dark Theme Image"
                    priority
                  />

                  <Image
                    src="/images/logodark.svg"
                    width={150}
                    height={100}
                    className="max-w-full hidden dark:block"
                    alt="Light Theme Image"
                    priority
                  />
                </Link>
                <p className="mb-7 text-base font-bold text-body-color dark:text-dark-6">
                  Revolutionizing Client Collaboration: IDCOLAB for Interior
                  Designers.
                </p>
                <p className="mb-7 text-lg text-body-color dark:text-dark-6">
                  IDCOLAB is a sophisticated online platform for interior
                  designers to share and present design ideas in real time with
                  clients.
                </p>
                <div className="-mx-3 flex items-center">
                  <Link
                    href="#"
                    className="px-3 text-dark-7 hover:text-primary dark:text-white/40"
                  >
                    <FacebookIcon />
                  </Link>
                  <Link
                    href="#"
                    className="px-3 text-dark-7 hover:text-primary dark:text-white/40"
                  >
                    <TwitterIcon />
                  </Link>
                  <Link
                    href="#"
                    className="px-3 text-dark-7 hover:text-primary dark:text-white/40"
                  >
                    <InstagramIcon />
                  </Link>
                  <Link
                    href="#"
                    className="px-3 text-dark-7 hover:text-primary dark:text-white/40"
                  >
                    <LinkedinIcon />
                  </Link>
                </div>
              </div>
            </div>

            <LinkGroup header="Quick Links">
              <NavLink link="/#" label="About Us" />
              <NavLink link="/#" label="Core Features" />
              <NavLink link="/#" label="Custom 3D Service" />
              <NavLink link="/#" label="Contact Us" />
              <NavLink link="/#" label="Pricing" />
              <NavLink link="/#" label="Panorama Viewer" />
              <NavLink link="/#" label="3D Models Viewer" />
            </LinkGroup>

            <LinkGroup header="Quick Links">
              <NavLink link="/#" label="FAQ" />
              <NavLink link="/#" label="Blog" />
              <NavLink link="/#" label="Refund Policy" />
              <NavLink link="/#" label="Cookie Policy" />
              <NavLink link="/#" label="Careers" />
            </LinkGroup>

            <LinkGroup header="Contact">
              <NavLink link="/#" label="Call : +1.857.230.9453" />
              <NavLink link="/#" label="Email : support@idcolab.com" />
              <NavLink link="/#" label="Address: 9 Kimball Ct," />
              <NavLink link="/#" label="Burlington, MA 01803" />
            </LinkGroup>

            <div className="w-full px-4 sm:w-1/2 lg:w-3/12">
              <div className="mb-10 w-full">
                <h4 className="mb-9 text-lg font-semibold text-dark dark:text-white">
                  Sign up for our newsletter
                </h4>
                <p className="mb-5 text-base text-body-color dark:text-dark-6">
                  Get the best news on weelky basis! Join now and don't miss it.
                </p>
                <form className="relative mb-5 w-full overflow-hidden rounded">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 w-full rounded border border-stroke bg-transparent px-5 text-sm text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-dark-6"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 flex h-full w-12 items-center justify-center bg-primary text-white hover:bg-opacity-90"
                  >
                    <EmailIcon />
                  </button>
                </form>
                <p className="text-base text-body-color dark:text-dark-6">
                  © {new Date().getFullYear()} IDCOLAB
                </p>
                <p className="text-base text-body-color dark:text-dark-6">
                  We care about your data in our{" "}
                  <Link
                    href="/PrivacyPolicy"
                    className="underline underline-offset-2"
                    target="_blank"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer3;

const LinkGroup = ({ children, header }: any) => {
  return (
    <div className="w-full px-4 sm:w-1/2 lg:w-2/12">
      <div className="mb-10 w-full">
        <h4 className="mb-9 text-lg font-semibold text-dark dark:text-white">
          {" "}
          {header}{" "}
        </h4>
        <ul className="space-y-0">{children}</ul>
      </div>
    </div>
  );
};

const NavLink = ({ label, link }: any) => {
  return (
    <li>
      <Link
        href={link}
        className="inline-block text-base leading-loose text-body-color hover:text-primary dark:text-dark-6"
      >
        {label}
      </Link>
    </li>
  );
};
