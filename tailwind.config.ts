import type { Config } from "tailwindcss";

// Design tokens for Workout Tracker.
// Palette is grounded in the two disciplines this app tracks: iron (gym)
// and pavement (running). Colors are muted/earthy on purpose - this is a
// tool you glance at mid-set, not a marketing page.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#17181A", // warm near-black, like a gym floor
        surface: "#202226", // card background
        "surface-2": "#292C31", // hover / nested surface
        "surface-3": "#33363C", // borders on surfaces
        ink: "#EDEBE6", // chalk-white body text
        "ink-dim": "#9B9C9F", // secondary / muted text
        "ink-faint": "#6C6E73", // placeholders, disabled
        line: "#34363B", // hairline borders
        gym: {
          DEFAULT: "#C1502E", // oxidized iron - weights/strength
          dim: "#7A3520",
          soft: "#2A1D18", // background tint for gym badges/cards
        },
        run: {
          DEFAULT: "#3E93A8", // steel-blue - running
          dim: "#285D6B",
          soft: "#132228",
        },
        rest: {
          DEFAULT: "#8C8E94", // neutral graphite
          soft: "#232427",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;