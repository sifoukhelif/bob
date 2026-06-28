import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo:   ['var(--font-cairo)',   'sans-serif'],
        sans:    ['var(--font-sans)',    'sans-serif'],
        serif:   ['var(--font-display)', 'Georgia',   'serif'],
        display: ['var(--font-display)', 'serif'],
      },
      colors: {
        gold:   '#C9A84C',
        gold2:  '#E8C36A',
        bgDark: '#08080E',
      },
    },
  },
  plugins: [],
}
export default config
