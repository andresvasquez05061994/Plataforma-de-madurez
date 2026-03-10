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
                background: "#FFFFFF",
                foreground: "#0A0A0F",
                accent: "#1A1AFF",
                urgency: "#FF3D1F",
                "accent-light": "#E8E8FF",
                "accent-dark": "#1414CC",
                "surface-white": "#FFFFFF",
                "surface-muted": "#EDEAE4",
                "text-muted": "#6B6B76",
                "text-light": "#9B9BA5",
                "border-light": "#E0DDD7",
                "border-dark": "#C8C5BF",
                success: "#22C55E",
            },
            fontFamily: {
                syne: ["var(--font-syne)", "sans-serif"],
                "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "slide-up": "slideUp 0.6s ease-out forwards",
                "slide-in-right": "slideInRight 0.4s ease-out forwards",
                "slide-in-left": "slideInLeft 0.4s ease-out forwards",
                "scale-in": "scaleIn 0.3s ease-out forwards",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "wave-1": "wave 1.2s ease-in-out infinite",
                "wave-2": "wave 1.2s ease-in-out 0.1s infinite",
                "wave-3": "wave 1.2s ease-in-out 0.2s infinite",
                "wave-4": "wave 1.2s ease-in-out 0.3s infinite",
                "wave-5": "wave 1.2s ease-in-out 0.4s infinite",
                "progress-fill": "progressFill 0.8s ease-out forwards",
                "badge-pop": "badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(30px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                slideInLeft: {
                    "0%": { opacity: "0", transform: "translateX(-30px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.9)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                wave: {
                    "0%, 100%": { transform: "scaleY(0.5)" },
                    "50%": { transform: "scaleY(1.5)" },
                },
                progressFill: {
                    "0%": { width: "0%" },
                    "100%": { width: "var(--progress-width)" },
                },
                badgePop: {
                    "0%": { opacity: "0", transform: "scale(0)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
