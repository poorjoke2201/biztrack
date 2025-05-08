/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        // Refined Color Palette inspired by the video
        colors: {
          'brand-primary': '#14B8A6', // Your existing teal
          'primary-accent': '#A78BFA', // Lavender/Purple accent (like buttons in video)
          'primary-accent-dark': '#8B5CF6',
          'background-dark': '#111827', // Deep gray/almost black
          'background-light': '#1F2937', // Slightly lighter gray for cards/sections
          'glass-border': 'rgba(255, 255, 255, 0.1)', // Subtle white border for glassy elements
          'text-main': '#E5E7EB', // Light gray for primary text on dark
          'text-secondary': '#9CA3AF', // Medium gray for secondary text
          'text-accent': '#A78BFA', // Accent text color
          // Gradients for text (can add more)
          'gradient-orange-pink': 'linear-gradient(90deg, #ff7e5f, #feb47b)',
          'gradient-purple-blue': 'linear-gradient(90deg, #A78BFA, #3B82F6)',
        },
        // Animations and Keyframes
        animation: {
          'typewriter': 'typewriter 2s steps(44) 1s 1 normal both, blinkTextCursor 500ms steps(44) infinite normal',
          'fadeIn': 'fadeIn 1.5s ease-out forwards', // Slower fade-in
          'fadeInDelayed': 'fadeIn 1.5s 0.5s ease-out forwards', // Fade-in with delay
          'shine': 'shine 4s linear infinite',
        },
        keyframes: {
          typewriter: {
            'from': { width: '0' },
            'to': { width: '100%' }
          },
          blinkTextCursor: {
            'from': { 'border-right-color': 'rgba(229, 231, 235, 0.75)' }, // Use text-main color
            'to': { 'border-right-color': 'transparent' }
          },
          fadeIn: {
            'from': { opacity: 0, transform: 'translateY(10px)' },
            'to': { opacity: 1, transform: 'translateY(0)' }
          },
          shine: {
            '0%': { backgroundPosition: '-200% center' },
            '100%': { backgroundPosition: '200% center' },
          },
        },
        // Add animation delay utilities
        animationDelay: {
          '500': '500ms',
          '1000': '1000ms',
          '1500': '1500ms',
          '2000': '2000ms',
          '2500': '2500ms', // For subheadline fade-in after typing
        },
        // Extend background image for gradients
        backgroundImage: {
          'gradient-primary-accent': 'linear-gradient(to right, theme(colors.primary-accent), theme(colors.primary-accent-dark))',
          'gradient-hero': 'linear-gradient(145deg, theme(colors.background-dark) 0%, theme(colors.background-light) 100%)', // Example gradient background
          'gradient-glass': 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', // Subtle gradient for glass effect
          'gradient-text-orange-pink': 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)', // Example text gradient
          'gradient-text-purple-blue': 'linear-gradient(90deg, #a78bfa, #3b82f6)', // Example text gradient
        },
        // Ensure backdrop blur utilities are available
        backdropBlur: {
          xs: '2px',
          sm: '4px',
          DEFAULT: '8px',
          md: '12px',
          lg: '16px',
          xl: '24px',
          '2xl': '40px',
          '3xl': '64px',
        }
      },
    },
    plugins: [
      // Plugin to add animation-delay utilities (e.g., animate-delay-2000)
      function ({ addUtilities, theme, e }) {
        const delays = theme('animationDelay');
        const utilities = Object.entries(delays).map(([key, value]) => ({
          [`.${e(`animate-delay-${key}`)}`]: { 'animation-delay': value },
        }));
        addUtilities(utilities);
      }
    ],
  }