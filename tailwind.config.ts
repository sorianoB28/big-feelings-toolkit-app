import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#862633",
        "primary-dark": "#6e1f2a",
        dark: "#231F20",
        surface: "#ffffff",
        background: "#E6E6E6",
        "border-soft": "#e3e3e3",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(35 31 32 / 0.08)",
        md: "0 6px 16px -8px rgb(35 31 32 / 0.22)",
        lg: "0 18px 30px -16px rgb(35 31 32 / 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
