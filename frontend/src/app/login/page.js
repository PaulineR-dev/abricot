"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // États pour stocker les valeurs du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // États pour gérer l'affichage des erreurs et le chargement
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // Empêche le rechargement de la page
    setError("");       // Réinitialise les erreurs
    setLoading(true);   // Active le bouton "Connexion..."

    try {
      // Envoie les identifiants à la route Next.js /api/login
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Récupère la réponse JSON (user ou erreur)
      const data = await res.json();

      // Si la réponse n'est pas OK → erreur
      if (!res.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      // Si tout est bon → redirection vers /profile
      router.push("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Connexion</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        type="password"
        autoComplete="current-password"
      />

      <button disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}