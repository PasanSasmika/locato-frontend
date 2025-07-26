module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#212121',
        secondary: '#D5FF44'
      },
       fontFamily: {
      main: ['Poppins-Regular'],
      'main-bold': ['Poppins-Bold'],
    },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.pt-safe': {
          'padding-top': 'env(safe-area-inset-top, 0)',
        },
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom, 0)',
        },
        '.pl-safe': {
          'padding-left': 'env(safe-area-inset-left, 0)',
        },
        '.pr-safe': {
          'padding-right': 'env(safe-area-inset-right, 0)',
        },
        '.px-safe': {
          'padding-left': 'env(safe-area-inset-left, 0)',
          'padding-right': 'env(safe-area-inset-right, 0)',
        },
        '.py-safe': {
          'padding-top': 'env(safe-area-inset-top, 0)',
          'padding-bottom': 'env(safe-area-inset-bottom, 0)',
        },
      })
    },
  ],
}