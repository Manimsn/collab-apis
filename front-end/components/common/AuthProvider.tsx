"use client";

import { createContext, useContext } from "react";
// import { useAuth } from "@/hooks/useAuth";

const AuthContext = createContext<{ isAuthenticated: boolean }>({
  isAuthenticated: false,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { isAuthenticated } = useAuth();
  const isAuthenticated = false;

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);
