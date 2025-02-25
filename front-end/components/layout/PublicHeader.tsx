"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import ListItem from "../common/ListItem";
import LinkItem from "../common/LinkItem";
import Dropdown from "../common/Dropdown";
import DropdownItem from "../common/DropdownItem";
import ThemeToggle from "../common/ThemeToggle";
import { ForwardArrowIcon } from "../icons";

export default function Header() {
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

  return (
    // <header className="flex w-full items-center bg-white dark:bg-dark ">
    // Default (w-full): Mobile-first approach (applies to all screens).
    // sm:w-3/4: At 640px (small screens), width becomes 75%.
    // md:w-1/2: At 768px (medium screens), width becomes 50%.
    // lg:w-1/3: At 1024px (large screens), width becomes 33.33%.
    // xl:w-1/4: At 1280px (extra-large screens), width becomes 25%.
    // 2xl:w-1/5: At 1536px and above, width becomes 20%.
    // bg-red sm:bg-green md:bg-blue lg:bg-yellow xl:bg-purple 2xl-pink
    <header
      className={`
        lg:mx-4 lg:my-8 xl:mx-4 xl:my-6 flex 
        w-full lg:w-[97%] xl:w-[98.5%] items-center lg:rounded-full bg-white px-6 py-3 shadow-md dark:bg-dark-3 h-16 font-inter font-semibold`}
    >
      <div className="container mx-auto max-w-none 2xl:w-full xl:mx-2">
        <div className="relative -mx-4 flex items-center justify-between">
          <div className="w-60 max-w-full px-4">
            <Link href="/#" className="block w-full py-5">
              <Image
                src="/images/logodark.svg"
                width={150}
                height={100}
                className="hidden dark:block h-[42px]"
                alt="Dark Theme Image"
                priority
              />

              <Image
                src="/images/logo.svg"
                width={150}
                height={100}
                className="dark:hidden h-[42px] w-auto"
                alt="Light Theme Image"
                priority
              />
            </Link>
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
                className={`h-16 absolute right-4 top-full z-50 w-full max-w-[250px] rounded-lg bg-white py-5 shadow lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:px-6 lg:py-0 lg:shadow-none ${
                  !open && "hidden"
                } `}
              >
                <ul className="block lg:flex">
                  {navigation.map((item, index) => {
                    if (item.subMenu && item.panel) {
                      return (
                        <ListItem key={item.name}>
                          <LinkItem dropdown="true" NavLink="#">
                            {" "}
                            {item.name}{" "}
                          </LinkItem>
                          <Dropdown key={`drop-${item.name}`}>
                            {item.panel.map((subMenu, indexTwo) => {
                              return (
                                <DropdownItem
                                  key={`DropdownItem-${indexTwo}`}
                                  setOpen={setOpen}
                                  dropdownLink={subMenu.href}
                                  dropdownText={subMenu.name}
                                />
                              );
                            })}
                          </Dropdown>
                        </ListItem>
                      );
                    }
                    return (
                      <ListItem setOpen={setOpen} key={item.name}>
                        <LinkItem NavLink={item.href}>{item.name}</LinkItem>
                      </ListItem>
                    );
                  })}
                </ul>
              </nav>
            </div>
            <div
              className={` 
              w-[60%] md:w-[60%] lg:w-[46%] flex md:justify-end lg:justify-end`}
            >
              <ThemeToggle />
            </div>
            <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
              <Link
                href="/#"
                className="flex px-6 py-2.5 text-base text-dark hover:text-primary dark:text-white"
              >
                LOG IN
                <ForwardArrowIcon />
              </Link>

              <Link
                href="/#"
                className="rounded-md bg-purple px-6 py-2.5 text-base text-white hover:bg-primary/90"
              >
                SIGN UP
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
