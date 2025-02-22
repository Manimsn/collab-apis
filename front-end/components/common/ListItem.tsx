"use client";
import React, { useState } from "react";

const ListItem = ({ children, setOpen }: any) => {
  const [subMenu, setSubMenu] = useState(true);

  const childWithProps = React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      subMenu: subMenu,
      setSubMenu: setSubMenu,
    });
  });

  return (
    <li
      onClick={() => {
        if (setOpen) {
          setOpen(false);
        }
      }}
      className="submenu-item group relative 2xl:ml-12"
    >
      {childWithProps}
    </li>
  );
};

export default ListItem;
