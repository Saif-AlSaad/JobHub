/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nordic Teal & Warm Terracotta Core Palette
        background: '#FAF8F5',       // Warm Alabaster Cream
        alabaster: '#FAF8F5',
        card: '#FFFFFF',             // Pure White
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
          subtle: '#F3EFEA',         // Soft Warm Stone
        },
        stone: {
          50: '#FAF8F5',
          100: '#F3EFEA',
          200: '#E7E5E4',
          400: '#A8A29E',
          500: '#78716C',
          700: '#44403C',
          900: '#1C1917',
          subtle: '#F3EFEA',
          border: '#E7E5E4',
          muted: '#78716C',
          charcoal: '#1C1917',
        },
        border: '#E7E5E4',           // Warm Stone Gray

        // Primary Brand: Deep Forest Teal
        primary: {
          DEFAULT: '#0F766E',        // Deep Forest Teal
          hover: '#115E59',          // Darker Pine Teal
          light: '#CCFBF1',          // Soft Mint Wash
          tint: '#CCFBF1',
          border: '#99F6E4',
          text: '#1C1917',           // Warm Charcoal
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          600: '#0D9488',
          700: '#0F766E',            // Deep Forest Teal
          800: '#115E59',            // Darker Pine Teal
          900: '#134E4A',
          DEFAULT: '#0F766E',
          deep: '#0F766E',
          pine: '#115E59',
          mint: '#CCFBF1',
        },

        // Secondary / High-Conversion CTA Accent: Warm Terracotta Coral
        secondary: {
          DEFAULT: '#78716C',        // Warm Stone Gray for secondary/muted text
          light: '#A8A29E',
          dark: '#1C1917',
        },
        terracotta: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          500: '#F97316',            // Warm Terracotta Coral
          600: '#EA580C',            // Deep Terracotta
          700: '#C2410C',
          DEFAULT: '#F97316',
          hover: '#EA580C',
          light: '#FFEDD5',
          border: '#FED7AA',
          text: '#C2410C',
        },
        cta: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          light: '#FFEDD5',
          border: '#FED7AA',
          text: '#C2410C',
        },

        // Brand alias for consistency
        brand: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          light: '#CCFBF1',
          subtle: 'rgba(15, 118, 110, 0.08)',
          accent: '#F97316',
          'accent-hover': '#EA580C',
        },

        // Semantic soft-tint badge system
        badge: {
          teal: {
            bg: '#CCFBF1',
            text: '#0F766E',
            border: '#99F6E4',
          },
          terracotta: {
            bg: '#FFEDD5',
            text: '#C2410C',
            border: '#FED7AA',
          },
          salary: {
            bg: '#ECFDF5',
            text: '#047857',
            border: '#A7F3D0',
          },
          urgent: {
            bg: '#FEF3C7',
            text: '#B45309',
            border: '#FDE68A',
          },
        },
        cyan: {
          DEFAULT: '#0F766E',
          light: '#CCFBF1',
          dark: '#115E59',
        },
        success: {
          DEFAULT: '#047857',
          bg: '#ECFDF5',
          text: '#047857',
          border: '#A7F3D0',
        },
        transferable: {
          bg: '#CCFBF1',
          text: '#0F766E',
        },
        missing: {
          bg: '#FEF3C7',
          text: '#B45309',
        },
        warning: {
          DEFAULT: '#B45309',
          bg: '#FEF3C7',
          text: '#B45309',
          border: '#FDE68A',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: '#FEF2F2',
          border: '#FECACA',
        },
      },
      borderRadius: {
        'input': '10px',
        'card': '12px',
        'container': '16px',
      },
      boxShadow: {
        'subtle': '0 2px 6px rgba(28, 25, 23, 0.03)',
        'card': '0 2px 6px rgba(28, 25, 23, 0.03)',
        'card-hover': '0 12px 24px -4px rgba(15, 118, 110, 0.08)',
        'search': '0 10px 25px -5px rgba(28, 25, 23, 0.05)',
        'warm-cta': '0 4px 12px rgba(249, 115, 22, 0.25)',
        'elevation': '0 10px 30px -4px rgba(28, 25, 23, 0.06)',
        'modal': '0 20px 48px -8px rgba(28, 25, 23, 0.14)',
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
