import { Geist, Geist_Mono, Inter, Manrope } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: { default: "Abricot - Gestion de projets", template: "%s | Abricot" },
  description: "Organisez vos projets, vos tâches et votre équipe avec Abricot.",
};

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400", "600", "700"] });

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable}`}>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}