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
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          900: "#78350f"
        },
        ink: "#11100e",
        line: "#e7e5e4"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
