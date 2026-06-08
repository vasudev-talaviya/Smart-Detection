/** @type {import('tailwindcss').Config} */
/* eslint-env node */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  // Re-triggering build to apply daisyui v4 themes correctly
  plugins: [require("daisyui")],
  daisyui: {
    themes: true,
    darkTheme: "dark",
  },
}
