/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F8F9FB',
          100: '#F1F3F7',
          200: '#E5E8F0',
          300: '#D2D7E5',
          600: '#2A303C',
          800: '#191D24',
          900: '#11141A',
        },
        accent: {
          green: '#00BA88',
          lightGreen: '#E6F9F3',
          orange: '#FF8A00',
          red: '#FF4D4D',
          blue: '#0088FF',
        }
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'modal': '0 25px 60px -15px rgba(15, 23, 42, 0.22), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
