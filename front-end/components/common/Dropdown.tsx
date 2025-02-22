import React from "react";

const Dropdown = ({ children, subMenu }: any) => {
  return (
    <div
      className={`relative left-0 top-full rounded-lg bg-light-0 px-4 transition-all group-hover:opacity-100 dark:bg-dark-2 2xl:invisible 2xl:absolute 2xl:top-[115%] 2xl:w-[250px] 2xl:p-4 2xl:opacity-0 2xl:shadow-lg 2xl:group-hover:visible 2xl:group-hover:top-full
       ${subMenu ? "hidden 2xl:block" : "block"}`}
    >
      {children}
    </div>
  );
};

export default Dropdown;
