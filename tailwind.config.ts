import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#064E3B", // Deep Forest Green
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          700: "#047857",
          900: "#064E3B",
        },
        secondary: {
          DEFAULT: "#9A3412", // Deep Saffron / Burnt Orange
          50: "#FFF7ED",
          500: "#F97316",
          700: "#C2410C",
          900: "#7C2D12",
        },
        surface: {
          DEFAULT: "#F9F7F2", // Cream / Parchment
          50: "#FDFCFB",
          100: "#F3F0E9",
          200: "#E7E2D3",
          500: "#A8A291",
          700: "#78716C",
          900: "#44403C",
        },
        accent: {
          DEFAULT: "#854D0E", // Bronze / Antique Gold
          500: "#B45309",
          700: "#92400E",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
      boxShadow: {
        'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};

export default config;
