"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogPanel } from "@headlessui/react";

import ListItem from "../common/ListItem";
import LinkItem from "../common/LinkItem";
import Dropdown from "../common/Dropdown";
import DropdownItem from "../common/DropdownItem";

import ThemeToggle from "../common/ThemeToggle";
import AuthNavigation from "../common/AuthNavigation";

export default function Header() {
  const pathName = usePathname();

  const [fileViewer, setFileViewer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const navigation = [
    {
      name: "3D MODELS",
      href: "/ThreeDmodels?page=1",
      isEnabled: true,
      subMenu: false,
    },
    {
      name: "CUSTOM 3D SERVICE",
      href: "/customthreed",
      isEnabled: true,
      subMenu: false,
    },
    {
      name: "FILE VIEWERS",
      panel: [
        { name: "PANORAMA VIEWER", href: "/fileviewers/panoramaviewer" },
        { name: "3D MODELS VIEWER", href: "/fileviewers/3dmodelsviewer" },
      ],
      href: "#",
      isEnabled: true,
      subMenu: true,
    },
  ];

  function classNames(
    ...classes: (string | boolean | undefined | null)[]
  ): string {
    return classes.filter(Boolean).join(" ");
  }

  return (
    // <div className="fixed top-0 z-50 bg-light-1 dark:bg-dark-2 sm:h-14 md:h-18 lg:h-20 2xl:h-24 mx-auto w-full  flex items-center justify-center ">
    //   <header className="bg-light-0 2xl:mx-6 lg:mx-6 2xl:rounded-full lg:rounded-full w-full items-center dark:bg-dark-3  ">
    //     <nav
    //       className=" flex items-center justify-between px-2 lg:py-1 lg:px-8 font-inter"
    //       aria-label="Global"
    //     >
    //       <div className="flex items-center gap-x-12">
    //         <Link href="/" className="p-1">
    //           <span className="sr-only">Your Company</span>
    //           <Image
    //             src="/images/logodark.svg"
    //             width={150}
    //             height={100}
    //             className="hidden dark:block h-[42px]"
    //             alt="Dark Theme Image"
    //             priority
    //           />

    //           <Image
    //             src="/images/logo.svg"
    //             width={150}
    //             height={100}
    //             className="dark:hidden h-[42px] w-auto"
    //             alt="Light Theme Image"
    //             priority
    //           />
    //         </Link>
    //         <div className="hidden lg:flex 2xl:gap-x-12 lg:gap-x-10 items-center">
    //           {navigation.map(
    //             (item, index) =>
    //               item.isEnabled && (
    //                 <Link
    //                   key={index}
    //                   href={item.href}
    //                   className={classNames(
    //                     pathName.includes(
    //                       item.name === "FILE VIEWERS"
    //                         ? "fileviewers"
    //                         : item.href
    //                     )
    //                       ? "bg-yellow !text-dark-2"
    //                       : "",
    //                     "text-sm 2xl:font-semibold leading-6 text-dark-2  hover:bg-yellow dark:hover:text-dark-2 duration-300 ease-in-out px-2 py-2 rounded-lg dark:text-light-3"
    //                   )}
    //                   onMouseEnter={() => {
    //                     if (item.name === "FILE VIEWERS") {
    //                       setFileViewer(true);
    //                     }
    //                   }}
    //                   onMouseLeave={() => {
    //                     if (item.name === "FILE VIEWERS") {
    //                       setFileViewer(false);
    //                     }
    //                   }}
    //                 >
    //                   {item.name === "FILE VIEWERS" ? (
    //                     <span>{item.name}</span>
    //                   ) : (
    //                     item.name
    //                   )}
    //                   {fileViewer ? (
    //                     <div className="absolute top-[60px] dark:bg-dark-2 z-10 bg-light-1 shadow-1 rounded-lg mt-2 ">
    //                       {item.panel?.map((menu, index) => {
    //                         return (
    //                           <Link
    //                             key={index}
    //                             href={menu.href}
    //                             onMouseEnter={() => setFileViewer(true)}
    //                             onMouseLeave={() => setFileViewer(false)}
    //                           >
    //                             <p
    //                               key={index}
    //                               className="px-4 py-4 hover:bg-light-3 dark:hover:bg-dark-3 rounded-lg dark:text-light-2  text-sm font-semibold dark:hover:text-light-2 "
    //                             >
    //                               {menu.name.toLocaleUpperCase()}
    //                             </p>
    //                           </Link>
    //                         );
    //                       })}
    //                     </div>
    //                   ) : (
    //                     <></>
    //                   )}
    //                 </Link>
    //               )
    //           )}
    //         </div>
    //       </div>

    //       <div className="flex 2xl:flex">
    //         <div className=" items-center mr-10 h-10 pr-6 2xl:pr-0">
    //           <ThemeToggle />
    //         </div>
    //         <div className="flex ">
    //           <AuthNavigation />
    //         </div>
    //       </div>
    //     </nav>
    //     <Dialog
    //       as="div"
    //       className="2xl:hidden"
    //       open={mobileMenuOpen}
    //       onClose={setMobileMenuOpen}
    //     >
    //       <div className="fixed inset-0 z-10" />
    //       <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-light-0 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-dark-2/10">
    //         <div className="flex items-center justify-between">
    //           <Link href="#" className="-m-1.5 p-1.5">
    //             <span className="sr-only">Your Company</span>
    //             <Image
    //               className="h-8 w-auto"
    //               src="/images/logo.svg"
    //               alt=""
    //               width={50}
    //               height={50}
    //               priority
    //             />
    //           </Link>
    //           <button
    //             type="button"
    //             className="-m-2.5 rounded-md p-2.5 text-dark-4"
    //             onClick={() => setMobileMenuOpen(false)}
    //           >
    //             <span className="sr-only">Close menu</span>
    //             <XMarkIcon className="h-6 w-6" aria-hidden="true" />
    //           </button>
    //         </div>
    //         <div className="mt-6 flow-root">
    //           <div className="-my-6 divide-y divide-light-5/10">
    //             <div className="space-y-2 py-6">
    //               {navigation.map((item) => (
    //                 <Link
    //                   key={item.name}
    //                   href={item.href}
    //                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-dark-2 hover:bg-gray-50"
    //                 >
    //                   {item.name}
    //                 </Link>
    //               ))}
    //             </div>

    //             <div className="py-6">
    //               <Link
    //                 href="/dashboard"
    //                 className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-dark-2 hover:bg-gray-50"
    //               >
    //                 LOG IN
    //               </Link>
    //               <Link
    //                 href="/signup"
    //                 className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-dark-2 hover:bg-gray-50"
    //               >
    //                 SIGN UP
    //               </Link>
    //             </div>
    //           </div>
    //         </div>
    //       </DialogPanel>
    //     </Dialog>

    //     <div className="lg:hidden  flex w-full items-center justify-between px-4">
    //       <div>
    //         <button
    //           title="Switch theme"
    //           onClick={() => setOpen(!open)}
    //           className={` ${
    //             open && "navbarTogglerActive"
    //           } absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-yellow focus:ring-2 2xl:hidden`}
    //         >
    //           <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-light-0"></span>
    //           <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-light-0"></span>
    //           <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-light-0"></span>
    //         </button>
    //         <nav
    //           className={`absolute right-4 top-full z-50 w-full max-w-[250px] rounded-lg bg-light-0 py-5 shadow
    //                    dark:bg-dark-2 2xl:static 2xl:block 2xl:w-full 2xl:max-w-full 2xl:bg-transparent 2xl:px-6 2xl:py-0 2xl:shadow-none ${
    //                      !open && "hidden"
    //                    } `}
    //         >
    //           <ul className="block 2xl:flex">
    //             {navigation.map((item, index) => {
    //               if (item.subMenu && item.panel) {
    //                 return (
    //                   <ListItem key={item.name}>
    //                     <LinkItem dropdown="true" NavLink="#">
    //                       {item.name}
    //                     </LinkItem>
    //                     {item.panel.map((subMenu, indexTwo) => (
    //                       <Dropdown key={indexTwo}>
    //                         <DropdownItem
    //                           setOpen={setOpen}
    //                           dropdownLink={subMenu.href}
    //                           dropdownText={subMenu.name}
    //                         />
    //                       </Dropdown>
    //                     ))}
    //                   </ListItem>
    //                 );
    //               }
    //               return (
    //                 <ListItem setOpen={setOpen} key={item.name}>
    //                   <LinkItem NavLink={item.href}>{item.name}</LinkItem>
    //                 </ListItem>
    //               );
    //             })}
    //             <ListItem setOpen={setOpen}>
    //               <LinkItem NavLink="/dashboard">LOG IN</LinkItem>
    //             </ListItem>
    //             <ListItem setOpen={setOpen}>
    //               <LinkItem NavLink="/signup">SIGN UP</LinkItem>
    //             </ListItem>
    //           </ul>
    //         </nav>
    //       </div>
    //     </div>
    //     {/* -------------------------------- */}
    //   </header>
    // </div>

    // <header className="flex w-full items-center bg-white dark:bg-dark ">
    // Default (w-full): Mobile-first approach (applies to all screens).
    // sm:w-3/4: At 640px (small screens), width becomes 75%.
    // md:w-1/2: At 768px (medium screens), width becomes 50%.
    // lg:w-1/3: At 1024px (large screens), width becomes 33.33%.
    // xl:w-1/4: At 1280px (extra-large screens), width becomes 25%.
    // 2xl:w-1/5: At 1536px and above, width becomes 20%.
    // Notes:
    <header
      className={`bg-red sm:bg-green md:bg-blue lg:bg-yellow xl:bg-purple 2xl-pink lg:mx-4 lg:my-8 xl:mx-4 xl:my-8 flex 
        w-full lg:w-[97%] items-center lg:rounded-full xl:bg-purple bg-white px-6 py-3 shadow-md dark:bg-dark h-16`}
    >
      <div className="container mx-auto max-w-none 2xl:w-full xl:mx-2">
        <div className="relative -mx-4 flex items-center justify-between">
          <div className="w-60 max-w-full px-4">
            <a href="/#" className="block w-full py-5">
              <img
                src="https://cdn.tailgrids.com/2.0/image/assets/images/logo/logo.svg"
                alt="logo"
                className="dark:hidden"
              />
              <img
                src="https://cdn.tailgrids.com/2.0/image/assets/images/logo/logo-white.svg"
                alt="logo"
                className="hidden dark:block"
              />
            </a>
          </div>
          <div className="flex w-full items-center justify-between px-4">
            <div>
              <button
                onClick={() => setOpen(!open)}
                className={` ${
                  open && "navbarTogglerActive"
                } absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden`}
              >
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
              </button>
              <nav
                className={`absolute right-4 top-full z-50 w-full max-w-[250px] rounded-lg bg-white py-5 shadow dark:bg-dark-2 lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:px-6 lg:py-0 lg:shadow-none ${
                  !open && "hidden"
                } `}
              >
                <ul className="block lg:flex">
                  <ListItem>
                    <LinkItem dropdown="true" NavLink="/#">
                      Home
                    </LinkItem>
                    <Dropdown>
                      <DropdownItem
                        dropdownLink="#"
                        dropdownText="Creative Homepage"
                      />
                      <DropdownItem
                        dropdownLink="#"
                        dropdownText="Business Homepage"
                      />
                      <DropdownItem
                        dropdownLink="#"
                        dropdownText="Corporate Homepage"
                      />
                      <DropdownItem
                        dropdownLink="#"
                        dropdownText="Personal Homepage"
                      />
                    </Dropdown>
                  </ListItem>
                  <ListItem>
                    <LinkItem NavLink="/#">Payment</LinkItem>
                  </ListItem>
                  <ListItem>
                    <LinkItem NavLink="/#">Features</LinkItem>
                  </ListItem>
                </ul>
              </nav>
            </div>
            <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
              <a
                href="/#"
                className="px-6 py-2.5 text-base font-medium text-dark hover:text-primary dark:text-white"
              >
                Sign In
              </a>

              <a
                href="/#"
                className="rounded-md bg-primary px-6 py-2.5 text-base font-medium text-white hover:bg-primary/90"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// import React from "react";
// import Link from "next/link";
// import ThemeToggle from "../common/ThemeToggle";

// const navLinks = [
//   { href: "/", label: "Home" },
//   { href: "/3d-model-viewer-online", label: "Online 3D Model Viewer" },
//   { href: "/about-us", label: "About Us" },
//   { href: "/auth/login", label: "Login" },
//   { href: "/auth/signup", label: "Sign Up" },
//   { href: "/contact-us", label: "Contact Us" },
//   { href: "/core-features", label: "Core Features" },
//   { href: "/custom-3d-modeling-service", label: "Custom 3d Modeling Service" },
//   { href: "/faqs", label: "FAQs" },
//   { href: "/panorama-image-viewer", label: "FAQs" },
//   { href: "/refund-policy", label: "Refund Policy" },
//   { href: "/visualize-interior-3d", label: "Visualize Interior 3d" },
// ];

// const NavLinks = () => {
//   console.log("Public Header Rendered");
//   return (
//     <nav>
//       <ul className="flex space-x-4">
//         {navLinks.map(({ href, label }) => (
//           <li key={href}>
//             <Link href={href} className="text-blue-600 hover:underline">
//               {label}
//             </Link>
//           </li>
//         ))}
//         <div>
//           <ThemeToggle />
//         </div>
//       </ul>
//     </nav>
//   );
// };

// // ✅ Wrap the named function component inside React.memo()

// export default React.memo(NavLinks);
