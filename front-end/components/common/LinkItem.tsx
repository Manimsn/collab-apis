import Link from "next/link";

const LinkItem = ({
  children,
  NavLink,
  subMenu,
  setSubMenu,
  dropdown,
}: any) => {
  const handleClick = () => {
    // event.preventDefault();
    setSubMenu(!subMenu);
  };

  return (
    <Link
      href={NavLink}
      onClick={handleClick}
      className={`relative flex px-6 py-2 text-base lg:text-xs xl:text-base text-body-color group-hover:text-dark dark:text-dark-6 dark:group-hover:text-white  lg:inline-flex lg:py-6 lg:pl-0 lg:pr-4 ${
        dropdown &&
        "after:absolute after:right-5 after:top-1/2 after:mt-[-2px] after:h-2 after:w-2 after:translate-y-[-50%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-current lg:after:right-0"
      }`}
    >
      {children}
    </Link>
  );
};

export default LinkItem;
