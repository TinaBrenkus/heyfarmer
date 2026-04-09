import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hey Farmer Earthy Brand Colors
        'farm-green': {
          DEFAULT: '#4A5E35',
          50: '#F0EDE4',
          100: '#DDD8C8',
          200: '#B8B49E',
          300: '#9A9A7E',
          400: '#7E8A62',
          500: '#6B7F4A',
          600: '#5E7240',
          700: '#526638',
          800: '#4A5E35',
          900: '#3A4A28',
        },
        'terra': {
          DEFAULT: '#C4622D',
          50: '#FAF0E8',
          100: '#F0DCC8',
          200: '#E8C4A0',
          300: '#E0A880',
          400: '#D98E60',
          500: '#D07340',
          600: '#C4622D',
          700: '#B35526',
          800: '#8C4420',
          900: '#6B3318',
        },
        'soil': {
          DEFAULT: '#2C2C24',
          50: '#FAF7F0',
          100: '#F5F2EA',
          200: '#E8E4D8',
          300: '#D4D0BE',
          400: '#A09E90',
          500: '#5C5C4A',
          600: '#4A4A3C',
          700: '#3A3A30',
          800: '#2C2C24',
          900: '#1E1E18',
        },
        'cream': '#FAF7F0',
        'warm-border': '#E8E4D8',
      },
    },
  },
  plugins: [],
} satisfies Config;
