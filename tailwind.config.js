module.exports = {
  content: [
    "./src/**/*.{md,html,js,njk}",
  ],
  theme: {
    extend: {},
    screens: {
      'sm': '640px',
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
}
