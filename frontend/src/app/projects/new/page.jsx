"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Page de création d'un projet
export default function NewProjectPage() {
  const router = useRouter(); // Pour rediriger après création

  // Champs du formulaire
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contributors, setContributors] = useState("");

  // Affichage des erreurs
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      // Envoie les données au backend
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          // Convertit la chaîne en tableau d'emails
          contributors: contributors
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/projects"); // Redirection après création
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Nouveau projet</h1>
      {error && <p>{error}</p>}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      <input
        value={contributors}
        onChange={(e) => setContributors(e.target.value)}
        placeholder="Contributeurs (emails séparés par des virgules)"
      />

      <button type="submit">Créer</button>
    </form>
  );
}