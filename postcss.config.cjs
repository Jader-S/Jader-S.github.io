/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    "./postcss-unocss.cjs": {
      content: [
        "./app/**/*.{html,js,ts,jsx,tsx}",
        "./components/**/*.{html,js,ts,jsx,tsx}",
        "./styles/**/*.{html,js,ts,jsx,tsx}",
      ],
    },
  },
};
