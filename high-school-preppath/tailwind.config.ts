import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#1D3557',
        accent: '#2A9D8F',
        bg: '#F8F9FA',
        card: '#FFFFFF'
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
