import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        minecraft: ['Minecraft', 'Monocraft', 'monospace'],
      },
      colors: {
        // Minecraft UI colors
        mc: {
          dark: '#1a1a1a',
          darker: '#0f0f0f',
          slot: '#8b8b8b',
          'slot-dark': '#373737',
          'slot-light': '#ffffff',
          border: '#555555',
          'border-light': '#c6c6c6',
          inventory: '#c6c6c6',
        },
        // Skyblock rarity colors
        rarity: {
          common: '#FFFFFF',
          uncommon: '#55FF55',
          rare: '#5555FF',
          epic: '#AA00AA',
          legendary: '#FFAA00',
          mythic: '#FF55FF',
          divine: '#55FFFF',
          special: '#FF5555',
          'very-special': '#AA0000',
        },
        // Minecraft formatting colors
        mctext: {
          black: '#000000',
          'dark-blue': '#0000AA',
          'dark-green': '#00AA00',
          'dark-aqua': '#00AAAA',
          'dark-red': '#AA0000',
          'dark-purple': '#AA00AA',
          gold: '#FFAA00',
          gray: '#AAAAAA',
          'dark-gray': '#555555',
          blue: '#5555FF',
          green: '#55FF55',
          aqua: '#55FFFF',
          red: '#FF5555',
          'light-purple': '#FF55FF',
          yellow: '#FFFF55',
          white: '#FFFFFF',
        },
      },
      boxShadow: {
        'mc-inset': 'inset -2px -4px 0 0 #373737, inset 2px 2px 0 0 #ffffff',
        'mc-outset': 'inset 2px 2px 0 0 #373737, inset -2px -4px 0 0 #ffffff',
        'mc-slot': 'inset 2px 2px 0 0 #373737, inset -2px -2px 0 0 #ffffff',
        'mc-slot-hover': 'inset 0 0 0 2px #FFAA00',
      },
      animation: {
        'slot-pulse': 'slotPulse 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slotPulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
