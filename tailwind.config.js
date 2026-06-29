/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:    'var(--c-paper)',
        offwhite: 'var(--c-offwhite)',
        ink:      'var(--c-ink)',
        red:      'var(--c-red)',
        muted:    'var(--c-muted)',
        surface:  'var(--c-surface)',
        border:   'var(--c-border)',
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
        serif:   ['"DM Serif Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
