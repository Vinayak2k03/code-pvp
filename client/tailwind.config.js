const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: { ...{
              "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
              "error": "var(--error)",
              "secondary-fixed": "var(--secondary-fixed)",
              "primary-fixed-dim": "var(--primary-fixed-dim)",
              "primary-fixed": "var(--primary-fixed)",
              "on-tertiary-fixed": "var(--on-tertiary-fixed)",
              "surface-container-highest": "var(--surface-container-highest)",
              "surface-tint": "var(--surface-tint)",
              "surface-container-lowest": "var(--surface-container-lowest)",
              "on-surface": "var(--on-surface)",
              "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",
              "on-background": "var(--on-background)",
              "on-tertiary-container": "var(--on-tertiary-container)",
              "surface-dim": "var(--surface-dim)",
              "on-primary-container": "var(--on-primary-container)",
              "tertiary-fixed": "var(--tertiary-fixed)",
              "secondary-fixed-dim": "var(--secondary-fixed-dim)",
              "tertiary": "var(--tertiary)",
              "primary-container": "var(--primary-container)",
              "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
              "secondary": "var(--secondary)",
              "inverse-on-surface": "var(--inverse-on-surface)",
              "on-secondary": "var(--on-secondary)",
              "on-secondary-container": "var(--on-secondary-container)",
              "inverse-primary": "var(--inverse-primary)",
              "outline": "var(--outline)",
              "secondary-container": "var(--secondary-container)",
              "surface-container-high": "var(--surface-container-high)",
              "on-primary": "var(--on-primary)",
              "surface-container": "var(--surface-container)",
              "error-container": "var(--error-container)",
              "tertiary-container": "var(--tertiary-container)",
              "on-secondary-fixed": "var(--on-secondary-fixed)",
              "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
              "surface": "var(--surface)",
              "surface-bright": "var(--surface-bright)",
              "surface-variant": "var(--surface-variant)",
              "on-error": "var(--on-error)",
              "primary-code": "var(--primary-code)",
              "outline-variant": "var(--outline-variant)",
              "inverse-surface": "var(--inverse-surface)",
              "on-tertiary": "var(--on-tertiary)",
              "on-surface-variant": "var(--on-surface-variant)",
              "on-error-container": "var(--on-error-container)",
              "surface-container-low": "var(--surface-container-low)",
              "on-primary-fixed": "var(--on-primary-fixed)"
      },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
