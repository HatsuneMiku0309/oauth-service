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
      slate: colors.slate,
      gray: colors.coolGray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.amber,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald, 
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.violet,
      fuchsia: colors.fuchsia,
      pink: colors.ping,
      rose: colors.rose,
      black: colors.black,
      white: colors.white,
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
