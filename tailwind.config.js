/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
        },
        accent: {
          DEFAULT: "#F97316",
          dark: "#EA580C",
        },
        surface: "#F8FAFC",
        card: "#FFFFFF",
        muted: "#6B7280",
        ink: "#111827",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Thai", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.08)",
        cardHover: "0 8px 30px -4px rgba(15, 23, 42, 0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}
