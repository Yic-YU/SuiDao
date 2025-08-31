/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'sui-blue': {
          light: 'var(--sui-blue-light)',
          medium: 'var(--sui-blue-medium)',
          dark: 'var(--sui-blue-dark)',
        },
        'sui-indigo': {
          light: 'var(--sui-indigo-light)',
          medium: 'var(--sui-indigo-medium)',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'media', // 或者使用 'class' 如果你想要手动控制
}
