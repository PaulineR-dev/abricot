"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]); // Liste des projets
  const [error, setError] = useState(""); // Gestion des erreurs

  useEffect(() => {
    async function load() {
      try {
        // Récupère tous les projets via l’API interne
        const res = await fetch("/api/projects");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error); // Erreur backend
        setProjects(data); // Stocke les projets
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Mes projets</h1>

      <Link href="/projects/new">Créer un projet</Link>

      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`}>{p.name}</Link>
            {" — "}
            <span>{p.userRole}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}