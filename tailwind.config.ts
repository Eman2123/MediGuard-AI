import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          safe: "#16a34a",
          monitor: "#eab308",
          high: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
export default config;
