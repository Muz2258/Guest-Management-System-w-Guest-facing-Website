/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pri: '#4F1E8B',
          pri_dark_100: '#391762',
          pri_light_100: '#6D34B2',
          sec: '#DDC8F8',
          sec_light_100: '#F5EDFF',
          sec_light_200: '#FAF5FF',
          accent: '#177B61',
        },
        neutral: {
          neu_100: '#FFFFFF',
          neu_96: '#F5F5F5',
          neu_46: '#767676',
          neu_0: '#000000'
        },
        denotive: {
          denote_red: '#AE4646',
          denote_yellow_light: '#FDF2D3',
          denote_green_light: '#C9EEE4'
        }
      },
      fontFamily: {
        // Overide tailwind's default font-family
        sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],

        // Set custom semantic font-family
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Lato', 'Segoe UI', 'system-ui', 'Arial', 'sans-serif']
      },
      fontSize: {
        'title-mobile': ['4rem', {
          fontWeight: '400',
          lineHeight: '1.15',
          fontFamily: ['Playfair Display', 'Georgia', 'serif']
        }],
        'heading-mobile': ['1.5rem', {
          fontWeight: '400',
          lineHeight: '1.15',
          fontFamily: ['Playfair Display', 'Georgia', 'serif']
        }],
        'heading-mobile-m': ['1.25rem', {
          fontWeight: '400',
          lineHeight: '1.15',
          fontFamily: ['Playfair Display', 'Georgia', 'serif']
        }],
        'heading-mobile-sm': ['1rem', {
          fontWeight: '400',
          lineHeight: '1.15',
          fontFamily: ['Playfair Display', 'Georgia', 'serif']
        }],
        'heading-mobile-s': ['0.75rem', {
          fontWeight: '400',
          lineHeight: '1.15',
          fontFamily: ['Playfair Display', 'Georgia', 'serif']
        }],
        'body-mobile': ['0.875rem', {
          fontWeight: '400',
          lineHeight: '1.25'
        }],
        'body-mobile-m': ['0.75rem', {
          fontWeight: '400',
          lineHeight: '1.25'
        }],
        'body-mobile-sm': ['0.625rem', {
          fontWeight: '400',
          lineHeight: '1.25'
        }],
        'body-mobile-s': ['0.5rem', {
          fontWeight: '400',
          lineHeight: '1.25'
        }]
      }
    },
  },
  plugins: [],
}