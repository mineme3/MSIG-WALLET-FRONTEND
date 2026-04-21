/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",   // Indigo
        secondary: "#8b5cf6", // Purple
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
        dark: "#0f172a",
        card: "#1e293b",
      },
    },
  },
  plugins: [],
};