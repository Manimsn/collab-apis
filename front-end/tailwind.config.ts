import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enables class-based dark mode
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
      },
      animation: {
        float: "float 2s ease-in-out infinite",
      },
      fontFamily: {
        clash: ["clashGrotesk-Variable"],
        mulish: ["Mulish", "sans-serif"],
        palanquin: ["Palanquin", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "idcolab-image": "url('/images/background/custom3dBg.jpeg')",
        "idcolab-land-image": "url('/images/background/team.jpg')",
        "idcolab-nature-image": "url('/images/background/nature.jpg')",
        "idcolab-claire-image": "url('/images/background/rachel-claire.jpg')",
        // 'hero': "url('/assets/images/collection-background.svg')",
        // 'card': "url('/assets/images/thumbnail-background.svg')",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        yellow: "#facc15",
        purple: "#6d28d9",
        "dark-1": "#020617",
        "dark-2": "#0f172a",
        "dark-3": "#1e293b",
        "dark-4": "#334155",
        "dark-5": "#475569",
        "light-0": "#ffffff",
        "light-1": "#f1f5f9",
        "light-2": "#e2e8f0",
        "light-3": "#cbd5e1",
        "light-4": "#94a3b8",
        "light-5": "#cbd5e1",
        "green-1": "#6CA958",
        "green-2": "#36E43E",
        red: "#ff3c2d",
        "red-2": "#FF5B61",
        success: "#6CA958",
        error: "#EF4444",
        warning: "#F59E0B",
      },
    },
  },
  plugins: [require("tailgrids/plugin")],
} satisfies Config;
