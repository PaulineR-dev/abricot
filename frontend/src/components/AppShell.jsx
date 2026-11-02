"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

// Entoure chaque page avec les éléments communs du site et le contexte de connexion.
export default function AppShell({ children }) {
  // Lit le chemin de la page actuellement affichée.
  const pathname = usePathname();
  // Les pages de connexion et d'inscription sont affichées sans en-tête ni menu.
  const hideLayout = ["/login", "/signup"].includes(pathname);
  // Affiche les pages avec leur mise en page et le contexte de connexion.
  return (
    <AuthProvider>
      {hideLayout ? children : <><Header /><main style={{ flex: 1 }}>{children}</main><Sidebar /></>}
    </AuthProvider>
  );
}