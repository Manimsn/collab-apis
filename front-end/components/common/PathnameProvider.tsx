"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

const PathnameContext = createContext<{ pathname: string }>({ pathname: "/" });

export default function PathnameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <PathnameContext.Provider value={{ pathname }}>
      {children}
    </PathnameContext.Provider>
  );
}

// Custom hook to use the pathname context
export const usePathnameContext = () => useContext(PathnameContext);
