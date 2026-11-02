import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: { default: "Abricot - Gestion de projets", template: "%s | Abricot" },
  description: "Organisez vos projets, vos tâches et votre équipe avec Abricot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
