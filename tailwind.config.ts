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
        primary: "#4F8CFF",
        "primary-dark": "#356FE0",
        secondary: "#7C6CFF",
        accent: "#5ED3B3",
        dark: "#172033",
        surface: "#ffffff",
        background: "#F7FAFC",
        "background-end": "#EAF2FF",
        "border-soft": "#D8E5FF",
      },
      backgroundImage: {
        "gradient-bg": "linear-gradient(180deg, #F7FAFC 0%, #EAF2FF 100%)",
        "gradient-card":
          "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)",
        "gradient-accent":
          "linear-gradient(135deg, rgba(79,140,255,0.18) 0%, rgba(124,108,255,0.16) 52%, rgba(94,211,179,0.22) 100%)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      boxShadow: {
        sm: "0 10px 24px -18px rgb(79 140 255 / 0.24)",
        md: "0 18px 40px -24px rgb(79 140 255 / 0.28)",
        lg: "0 30px 72px -36px rgb(53 111 224 / 0.34)",
        glass: "0 24px 60px -32px rgb(23 32 51 / 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
