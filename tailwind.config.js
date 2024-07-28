/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'utama': 'url("@/assets/img/bg-utama.jpg")'
      }
    },
    fontFamily: {
      'poppins': ['Poppins', 'sans-serif']
    }
  },
  plugins: [],
}

