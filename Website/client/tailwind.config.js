/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5F00',
          success: '#2D5A27',
        },
        base: {
          background: '#F9F9F9',
          surface: '#FFFFFF',
        },
        border: {
          DEFAULT: '#D1D5DB',
        },
        text: {
          main: '#1A202C',
          muted: '#718096',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Source Code Pro', 'monospace'],
      },
      spacing: {
        // 8px grid system
        '0.5': '4px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '6': '48px',
        '8': '64px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#1A202C',
            lineHeight: '1.75',
            a: {
              color: '#FF5F00',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: '#E55500',
              },
            },
            strong: {
              color: '#1A202C',
              fontWeight: '600',
            },
            code: {
              color: '#1A202C',
              fontFamily: 'JetBrains Mono, Source Code Pro, monospace',
              fontSize: '0.875em',
              backgroundColor: '#F9F9F9',
              padding: '0.25em 0.5em',
              borderRadius: '0.25em',
              border: '1px solid #D1D5DB',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            blockquote: {
              color: '#718096',
              borderLeftColor: '#FF5F00',
              borderLeftWidth: '2px',
              fontStyle: 'normal',
              backgroundColor: '#F9F9F9',
              padding: '1em',
            },
            h1: {
              color: '#1A202C',
              fontWeight: '700',
            },
            h2: {
              color: '#1A202C',
              fontWeight: '600',
            },
            h3: {
              color: '#1A202C',
              fontWeight: '600',
            },
            h4: {
              color: '#1A202C',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
