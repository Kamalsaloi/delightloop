/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#111216',
        grey: { 1: '#55575F', 2: '#6E6F7C', 3: '#8B8D95', 4: '#C4C5CB' },
        line: { DEFAULT: '#EBEBE8', soft: '#F1F1EF', strong: '#E4E4E1' },
        page: '#F6F6F4',
        fill: { DEFAULT: '#F3F3F1', hover: '#FAFAF9' },
        violet: { DEFAULT: '#6559F7', edge: '#5547E6', link: '#5A3FE6', soft: '#EFEEFE' },
        amber: { bg: '#FFF3DC', text: '#9A5B00', bar: '#F2C46D' },
        green: { DEFAULT: '#22B573', text: '#1E8A58' },
        linkedin: '#0A66C2',
        hubspot: '#FF7A59',
      },
      boxShadow: {
        card: '0 0 0 1px #EBEBE8, 0 1px 2px rgba(17,18,22,.04)',
        primary: 'inset 0 0 0 1px #5547E6, inset 0 1px 0 rgba(255,255,255,.18)',
        secondary: '0 1px 2px rgba(17,18,22,.05)',
        seg: '0 1px 2px rgba(17,18,22,.06), 0 0 0 1px rgba(17,18,22,.04)',
        pop: '0 0 0 1px #EBEBE8, 0 12px 32px rgba(17,18,22,.10), 0 2px 6px rgba(17,18,22,.05)',
        panel: '0 0 0 1px #EBEBE8, 0 24px 48px -28px rgba(17,18,22,.30)',
      },
      borderRadius: { card: '20px' },
    },
  },
  plugins: [],
}
