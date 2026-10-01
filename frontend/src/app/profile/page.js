"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  // Stocke les infos utilisateur renvoyées par /api/profile
  const [user, setUser] = useState(null);

  // Stocke un éventuel message d'erreur
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        // Appelle la route Next.js qui récupère le profil depuis le backend
        const res = await fetch("/api/profile");

        // Lit la réponse JSON (soit user, soit erreur)
        const data = await res.json();

        // Si la réponse n'est pas OK → erreur
        if (!res.ok) {
          throw new Error(data.error || "Impossible de charger le profil");
        }

        setUser(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadProfile();
  }, []);

  if (error) return <p>{error}</p>;

  if (!user) return <p>Chargement du profil...</p>;

  return (
    <div>
      <h1>Profil utilisateur</h1>
      <p>Email : {user.email}</p>
      <p>Nom : {user.name}</p>
    </div>
  );
}