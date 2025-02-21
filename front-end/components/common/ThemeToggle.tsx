"use client";

import { toggleTheme } from "@/redux/slices/themeSlice";
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";

export default function ThemeToggle() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();

  if (!theme) return null; // Prevents hydration issues

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 border rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white"
    >
      {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </button>
  );
}
