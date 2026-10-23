/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        tint: "var(--tint)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        surface: "var(--surface-raised)",
      },
      fontFamily: {
        sans: ["var(--font-ui)"],
      },
      borderRadius: {
        card: "var(--radius-card)",
        panel: "var(--radius-panel)",
        pill: "var(--radius-pill)",
      },
    },
  },
  plugins: [],
}