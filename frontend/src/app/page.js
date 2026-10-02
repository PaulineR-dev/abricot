"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter(); // Permet la navigation côté client

  async function handleLogout() {
    // Appelle l'API interne pour supprimer le cookie de session
    await fetch("/api/logout", { method: "POST" });

    // Redirige vers la page de connexion
    router.push("/login");
  }

  return (
    <div>
      <h1>Accueil</h1>

      <button onClick={handleLogout}>
        Se déconnecter
      </button>
    </div>
  );
}