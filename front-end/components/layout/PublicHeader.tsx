import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ListItem from "../common/ListItem";
import LinkItem from "../common/LinkItem";
import Dropdown from "../common/Dropdown";
import DropdownItem from "../common/DropdownItem";
import AuthNavigation from "../common/AuthNavigation";

const Navbar8 = () => {
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
    //bg-red sm:bg-green md:bg-blue lg:bg-yellow xl:bg-purple 2xl-pink
    <div className="fixed top-0 left-0 right-0 bg-light-1 z-50 dark:bg-dark-2">
      <header
        className={`flex w-full items-center bg-white dark:bg-dark-3 h-16
    font-inter font-semibold lg:mx-4 lg:my-6 lg:rounded-full lg:w-[97%] xl:w-[98%]
    `}
      >
        <div className="container mx-auto md:max-w-none xl:max-w-none md:mx-0 lg:mx-2 xl:mx-6">
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
                  className={`absolute right-4 top-full z-50 w-full max-w-[250px] rounded-lg py-5 shadow lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none ${
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

              <AuthNavigation />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar8;
