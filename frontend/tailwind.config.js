/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        primary: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          light: '#F1F5F9'
        },
        secondary: {
          DEFAULT: '#475569',
          light: '#94A3B8'
        },
        brand: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
          subtle: 'rgba(79, 70, 229, 0.08)'
        },
        cyan: {
          DEFAULT: '#06B6D4',
          light: '#ECFEFF',
          dark: '#0E7490'
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
          text: '#047857',
          border: '#A7F3D0'
        },
        transferable: {
          bg: '#CFFAFE',
          text: '#0E7490'
        },
        missing: {
          bg: '#FEF3C7',
          text: '#92400E'
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
          text: '#92400E',
          border: '#FDE68A'
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: '#FEF2F2',
          border: '#FECACA'
        }
      },
      borderRadius: {
        'input': '10px',
        'card': '16px',
        'container': '16px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'elevation': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'modal': '0 20px 48px -8px rgba(15, 23, 42, 0.16)'
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        inter: ['var(--font-body)', 'Inter', 'sans-serif'],
        heading: ['var(--font-heading)', 'Poppins', 'sans-serif'],
        poppins: ['var(--font-heading)', 'Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
