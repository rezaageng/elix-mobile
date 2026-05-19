/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./components/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b96647',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        display: ['PlayfairDisplay_400Regular'],
        'display-medium': ['PlayfairDisplay_500Medium'],
        'display-semibold': ['PlayfairDisplay_600SemiBold'],
        'display-bold': ['PlayfairDisplay_700Bold'],
        'display-italic': ['PlayfairDisplay_400Regular_Italic'],
        'display-bold-italic': ['PlayfairDisplay_700Bold_Italic'],
      },
    },
  },
  plugins: [],
}
