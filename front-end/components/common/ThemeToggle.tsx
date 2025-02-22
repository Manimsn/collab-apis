"use client";

import { toggleTheme } from "@/redux/slices/themeSlice";
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { ToggleThemeIcon } from "../icons";

export default function ThemeToggle() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();
  console.log("Them--------", theme);

  if (!theme) return null; // Prevents hydration issues

  return (
    <label className="relative inline-flex cursor-pointer select-none items-center">
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={() => dispatch(toggleTheme())}
        className="sr-only"
      />
      <ToggleThemeIcon checked={theme} />
    </label>
  );
}
