import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lattice: {
          bg: "#0a0c14",
          panel: "#11141f",
          panel2: "#171b29",
          edge: "#252b3d",
          text: "#d8dde9",
          dim: "#8189a3",
          accent: "#7aa2ff",
          accent2: "#a07aff",
          good: "#6bd49c",
          warn: "#f4c168",
          rare: "#d693ff",
        },
      },
      fontFamily: {
        display: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
