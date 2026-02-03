import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "off-black": "var(--off-black)",
        accent: {
          DEFAULT: "#ffe700",
          foreground: "#0c0c0c",
        },
      },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(255, 231, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
