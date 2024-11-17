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
      },
      screens: {
        'sm400': '400px',
        'sm500': '500px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
    },
    fontFamily: {
      'poppins': ['Poppins', 'sans-serif']
    }
  },
  plugins: [],
}

