import { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'opay-green': '#2AB131',
        'opay-gray': '#F5F5F5',
      }, screens: {
        'xs': '480px',
        'sm': '640px',
        // ... other breakpoints
      }, fontSize: {
        'input-safe': '16px', // Add a safe font size class
      },
    },
  },
  plugins: [],
} satisfies Config