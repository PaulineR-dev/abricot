"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProject({ params }) {
  const { id } = params; // ID du projet à modifier
  const router = useRouter();

  const [name, setName] = useState(""); // Champ nom du projet
  const [description, setDescription] = useState(""); // Champ description
  const [error, setError] = useState(""); // Gestion des erreurs

  useEffect(() => {
    async function load() {
      // Récupère les informations du projet à éditer
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();

      // Pré-remplit les champs si la requête est OK
      if (res.ok) {
        setName(data.name);
        setDescription(data.description || "");
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); // Reset des erreurs

    try {
      // Envoie la mise à jour du projet
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error); // Gestion des erreurs backend

      router.push(`/projects/${id}`); // Redirection vers la page du projet
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Modifier le projet</h1>
      {error && <p>{error}</p>} {/* Affichage des erreurs */}

      <input value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <button type="submit">Enregistrer</button>
    </form>
  );
}