import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F8F9FB",
                foreground: "#1B2A4A",
                accent: "#FDB813",
                "accent-hover": "#E5A611",
                "accent-light": "#FFF8E1",
                navy: {
                    50: "#F0F3F7",
                    100: "#D9E0EB",
                    200: "#B3C1D6",
                    300: "#8DA2C2",
                    400: "#5A7BA8",
                    500: "#3A5A8A",
                    600: "#1B2A4A",
                    700: "#162240",
                    800: "#111A33",
                    900: "#0B1226",
                },
                surface: "#FFFFFF",
                "surface-alt": "#F1F3F6",
                muted: "#64748B",
                light: "#94A3B8",
                border: "#E2E8F0",
                "border-focus": "#CBD5E1",
                success: "#10B981",
                warning: "#F59E0B",
                urgency: "#EF4444",
            },
            fontFamily: {
                syne: ["var(--font-syne)", "sans-serif"],
                body: ["var(--font-dm-sans)", "sans-serif"],
            },
            borderRadius: {
                "2xl": "16px",
                "3xl": "20px",
                "4xl": "24px",
            },
            boxShadow: {
                card: "0 1px 3px rgba(27,42,74,0.04), 0 4px 12px rgba(27,42,74,0.06)",
                "card-hover": "0 4px 16px rgba(27,42,74,0.08), 0 8px 24px rgba(27,42,74,0.06)",
                gold: "0 4px 14px rgba(253,184,19,0.3)",
                "gold-lg": "0 8px 24px rgba(253,184,19,0.35)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
                "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
                "scale-in": "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "wave-1": "wave 1.2s ease-in-out infinite",
                "wave-2": "wave 1.2s ease-in-out 0.1s infinite",
                "wave-3": "wave 1.2s ease-in-out 0.2s infinite",
                "wave-4": "wave 1.2s ease-in-out 0.3s infinite",
                "wave-5": "wave 1.2s ease-in-out 0.4s infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(24px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(24px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.92)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                wave: {
                    "0%, 100%": { transform: "scaleY(0.5)" },
                    "50%": { transform: "scaleY(1.5)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
