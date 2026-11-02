import { Geist, Geist_Mono, Inter, Manrope, Montserrat } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

// Définit le titre et la description par défaut des pages du site.
export const metadata = {
  title: { default: "Abricot - Gestion de projets", template: "%s | Abricot" },
  description: "Organisez vos projets, vos tâches et votre équipe avec Abricot.",
};

// Charge les polices utilisées dans l'application.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400", "600", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["600", "700"] });

// Définit la structure générale qui entoure toutes les pages.
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable} ${montserrat.variable}`}>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
