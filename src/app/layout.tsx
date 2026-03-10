import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
    display: "swap",
    weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "IAC — Diagnóstico de Madurez Digital",
    description:
        "Evalúa la madurez digital de tu organización en BIM, IA/RPA y PLM. Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios.",
    keywords: [
        "madurez digital",
        "BIM",
        "IA",
        "RPA",
        "PLM",
        "transformación digital",
        "diagnóstico",
        "ingeniería",
        "IAC",
        "Ingeniería Asistida por Computador",
    ],
    openGraph: {
        title: "IAC — Diagnóstico de Madurez Digital",
        description:
            "Evalúa la madurez digital de tu organización en BIM, IA/RPA y PLM. Ingeniería Asistida por Computador.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={`${syne.variable} ${dmSans.variable}`}>
            <body className="font-dm-sans antialiased">{children}</body>
        </html>
    );
}
