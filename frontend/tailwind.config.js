/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF4F8B",
        secondary: "#FFF1F6",
        dark: "#1F2937",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 25px -5px rgba(255, 79, 139, 0.1), 0 8px 10px -6px rgba(255, 79, 139, 0.05)',
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
}
