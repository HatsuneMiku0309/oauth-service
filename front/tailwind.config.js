"use strict";
const colors = require("tailwindcss/colors");

module.exports = {
  mode: 'jit',
  purge: {
    defaultExtractor: (content) => {
      const contentWithoutStyleBlocks = content.replace(
        /<style[^]+?<\/style>/gi,
        ""
      );
      return (
        contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) ||
        []
      );
    },
    content: ["./*.html", "./src/**/*.vue", "./src/**/*.{js,ts,jsx,tsx}"]
  },
  darkMode: "class", // or 'media' or 'class'
  theme: {
    flex: {
      1: "1 1 0%",
      2: "2 2 0%",
      auto: "1 1 auto",
      initial: "0 1 auto",
      none: "none",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.coolGray,
      red: colors.red,
      yellow: colors.amber,
      green: colors.emerald,
      blue: colors.blue,
      teal: colors.teal,
      indigo: colors.indigo,
      purple: colors.violet,
      pink: colors.ping,
    },
    extend: {},
  },
  variants: {
    extend: {
      overflow: ["hover"],
    },
  },
  plugins: [],
};
