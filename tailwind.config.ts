import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sidebar: "#221A3B",
        brand: {
          50: "#EEEDFE",
          100: "#CECBF6",
          200: "#AFA9EC",
          400: "#7F77DD",
          600: "#534AB7",
          800: "#3C3489",
          900: "#26215C",
        },
        ink: {
          DEFAULT: "#221B36",
          2: "#6B6480",
          3: "#9A93A8",
        },
        line: "rgba(38,33,92,0.09)",
      },
      borderRadius: {
        xl: "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
