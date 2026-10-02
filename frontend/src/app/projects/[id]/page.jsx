"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectDetail(props) {
  const { id } = use(props.params);
  const router = useRouter();

  const [project, setProject] = useState(null); // Stocke les données du projet
  const [error, setError] = useState(""); // Gestion des erreurs

  useEffect(() => {
    async function load() {
      try {
        // Récupère les infos du projet depuis l’API interne
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error); // Erreur backend
        setProject(data); // Stocke le projet
      } catch (err) {
        setError(err.message); // Affiche l’erreur
      }
    }
    load();
  }, [id]); // Recharge si l’ID change

  // Affichage des erreurs
  if (error) return <p>{error}</p>;

  if (!project) return <p>Chargement...</p>;

  async function deleteProject() {
    // Supprime le projet via l’API interne
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects"); // Retour à la liste
  }

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>

      <h3>Propriétaire :</h3>
      <p>{project.owner.email}</p>

      <h3>Membres :</h3>
      <ul>
        {project.members.map((m) => (
          <li key={m.id}>
            {m.user.email} ({m.role})
          </li>
        ))}
      </ul>

      <h3>Tâches ({project._count.tasks}) :</h3>
      <ul>
        {project.tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> — {task.status} — {task.priority}
            <br />
            Créée par : {task.creator.email}
            <br />
            {task.description}
          </li>
        ))}
      </ul>

      {/* Actions réservées au propriétaire */}
      {project.userRole === "OWNER" && (
        <>
          <button onClick={() => router.push(`/projects/${id}/edit`)}>
            Modifier le projet
          </button>

          <button onClick={deleteProject}>
            Supprimer le projet
          </button>
        </>
      )}
    </div>
  );
}