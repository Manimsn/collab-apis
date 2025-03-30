// components/common/PaginationButton.tsx
import React from "react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
};

export const PaginationButton = ({
  onClick,
  disabled,
  isActive,
  children,
}: Props) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 min-w-10 items-center justify-center px-2 text-base font-medium border-r border-stroke 
        hover:bg-purple hover:text-white dark:border-white/10 
        ${disabled ? "opacity-50 cursor-not-allowed text-dark" : ""}
        ${
          isActive
            ? "bg-purple text-white font-bold hover:bg-purple/100"
            : "text-dark dark:text-white"
        }`}
    >
      {children}
    </button>
  );
};
