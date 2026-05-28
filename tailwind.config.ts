import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // あきFP ブランドカラー
        navy: "#1A2B4A",
        gold: "#D4A017",
        lightgold: "#F5C242",
        cream: "#FBF6E9",
        brandblue: "#2f6fb0",
        brandred: "#c0392b",
        lineGreen: "#06C755",
      },
    },
  },
  plugins: [],
};

export default config;
