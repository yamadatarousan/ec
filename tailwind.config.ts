import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts}',
    './src/data/**/*.{js,ts}',
    './src/types/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          50: '#fef7ed',
          100: '#fdecd3',
          200: '#fad5a5',
          300: '#f6b76d',
          400: '#f19132',
          500: '#ed750a',
          600: '#de5c05',
          700: '#b84608',
          800: '#95380e',
          900: '#7a2f0f',
        },
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
} satisfies Config;
