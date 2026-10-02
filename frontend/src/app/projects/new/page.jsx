"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter(); // Navigation après création
  const [name, setName] = useState(""); // Nom du projet
  const [description, setDescription] = useState(""); // Description du projet
  const [contributors, setContributors] = useState(""); // Emails des contributeurs
  const [error, setError] = useState(""); // Gestion des erreurs

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); // Reset des erreurs

    try {
      // Envoie les données du nouveau projet à l’API interne
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          // Transforme la chaîne en tableau d’emails propres
          contributors: contributors
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error); // Gestion des erreurs backend

      router.push("/projects"); // Redirection vers la liste des projets
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Nouveau projet</h1>
      {error && <p>{error}</p>}

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />

      <input
        value={contributors}
        onChange={(e) => setContributors(e.target.value)}
        placeholder="Contributeurs (emails séparés par des virgules)"
      />

      <button type="submit">Créer</button>
    </form>
  );
}