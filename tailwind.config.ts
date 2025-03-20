import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust to your project's file structure
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class", // Crucial for class-based dark mode
};
export default config;