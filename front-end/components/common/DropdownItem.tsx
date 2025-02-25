import Link from "next/link";
import React from "react";

const DropdownItem = ({ dropdownLink, dropdownText, setOpen }: any) => {
  return (
    <Link
      href={dropdownLink}
      onClick={() => {
        if (setOpen) {
          setOpen(false);
        }
      }}
      className="block rounded px-4 py-[10px] text-sm text-body-color hover:bg-yellow hover:text-dark dark:text-dark-6"
    >
      {dropdownText}
    </Link>
  );
};

export default DropdownItem;
