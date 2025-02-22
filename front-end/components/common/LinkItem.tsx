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
      className={`relative flex px-6 py-2 text-base font-medium text-body-color group-hover:text-dark dark:text-dark-6 dark:group-hover:text-white  2xl:inline-flex 2xl:py-6 2xl:pl-0 2xl:pr-4 ${
        dropdown &&
        "after:absolute after:right-5 after:top-1/2 after:mt-[-2px] after:h-2 after:w-2 after:translate-y-[-50%] after:rotate-45 after:border-b-2 after:border-r-2 after:border-current 2xl:after:right-0"
      }`}
    >
      {children}
    </Link>
  );
};

export default LinkItem;
