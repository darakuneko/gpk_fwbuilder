import type { Config } from 'tailwindcss'
import flowbitePlugin from 'flowbite/plugin'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
    "node_modules/flowbite-react/lib/esm/**/*.js"
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    flowbitePlugin
  ],
}

export default config