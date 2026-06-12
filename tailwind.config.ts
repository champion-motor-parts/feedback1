import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#d9792d",
          600: "#b95520",
          700: "#8f351a",
          900: "#3d1d14"
        },
        ink: "#201816",
        line: "#e7ded7"
      },
      boxShadow: {
        soft: "0 16px 36px rgba(32, 24, 22, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
