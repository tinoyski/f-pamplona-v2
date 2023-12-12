"use client";

import { useTheme } from "next-themes";
import { BsFillMoonFill, BsFillSunFill } from "react-icons/bs";

export default function DarkThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-lg py-2 px-3 text-white hover:bg-blue-400/60 dark:text-gray-400 dark:hover:bg-gray-700"
    >
      {theme === "light" ? (
        <BsFillSunFill></BsFillSunFill>
      ) : (
        <BsFillMoonFill></BsFillMoonFill>
      )}
    </button>
  );
}
