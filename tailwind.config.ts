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
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#e11d2f",
          600: "#c8102e",
          700: "#a20d25",
          900: "#3f050d"
        },
        ink: "#121212",
        line: "#e6e8ec"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(18, 18, 18, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
