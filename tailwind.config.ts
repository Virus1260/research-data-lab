import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // CSS variable-based tokens — work in both light and dark
        bg: "var(--bg)",
        "bg-panel": "var(--bg-panel)",
        "bg-surface": "var(--bg-surface)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-hover": "var(--bg-hover)",
        "bg-inset": "var(--bg-inset)",
        overlay: "var(--overlay)",
        hairline: "var(--border)",
        "hairline-strong": "var(--border-strong)",
        "on-amber": "var(--on-amber)",
        "chart-grid": "var(--chart-grid)",

        cryo: {
          DEFAULT: "var(--cryo)",
          subtle: "var(--cryo-subtle)",
          glow: "var(--cryo-glow)",
        },
        amber: {
          signal: "var(--amber)",
          bright: "var(--amber-bright)",
          subtle: "var(--amber-subtle)",
          glow: "var(--amber-glow)",
        },
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
          dim: "var(--ink-dim)",
        },

        obsidian: {
          DEFAULT: "var(--on-amber)",
          canvas: "var(--bg)",
          panel: "var(--bg-panel)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "panel-glow": "0 0 24px -6px var(--cryo-glow)",
        "amber-glow": "0 0 24px -6px var(--amber-glow)",
        "hairline-inset": "inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
