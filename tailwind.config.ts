import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'ping-call': 'ping_call 3s cubic-bezier(0.21, 0.98, 0.6, 0.99) 2.5s infinite',
        'zoom-calling': 'zoom_calling 3s ease-out 1s infinite',
        'ring-calling': 'ring_call 1s ease-in-out .5s infinite',
      },
      keyframes: {
        ping_call: {
          '0%': {opacity: "1"},
          '50%, 100%': { scale: "1.5", opacity: "0" },
        },
        zoom_calling: {
          "0%": { scale: "1"},
          "40%": { scale: "1.15"},
          "60%, 100%": { scale: "1"},
        },
        ring_call: {
          "0%, 100%": { animationTimingFunction: "cubic-bezier(0.8,0,1,1)", rotate: "10deg", scale: "1"},
          "60%": { animationTimingFunction: "cubic-bezier(0,0,0.2,1)", rotate: "-10deg", scale: "1.05"},
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: 'class'
    })
  ],
};
export default config;
