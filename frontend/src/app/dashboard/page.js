"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  // Mode d’affichage : "list" ou "kanban"
  const [viewMode, setViewMode] = useState("list");

  // Données récupérées depuis l’API
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  // États de chargement / erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charge les données du tableau de bord au montage
  useEffect(() => {
    async function loadData() {
      try {
        // Appels parallèles : tâches assignées et projets liés
        const [tasksRes, projectsRes] = await Promise.all([
          fetch("/api/dashboard/assigned-tasks"),
          fetch("/api/dashboard/projects-with-tasks"),
        ]);

        // Gestion des erreurs HTTP
        if (!tasksRes.ok) throw new Error("Erreur chargement tâches");
        if (!projectsRes.ok) throw new Error("Erreur chargement projets");

        // Lecture JSON
        const tasksData = await tasksRes.json();
        const projectsData = await projectsRes.json();

        // Mise à jour du state/données React
        setTasks(tasksData || []);
        setProjects(projectsData || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // États de chargement / erreur
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <main className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-sm text-gray-600">
            Aperçu de vos projets et tâches.
          </p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded">
          + Créer un projet
        </button>
      </header>

      {/* Switch Liste / Kanban */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 border rounded ${
            viewMode === "list" ? "bg-black text-white" : ""
          }`}
          onClick={() => setViewMode("list")}
        >
          Liste
        </button>
        <button
          className={`px-3 py-1 border rounded ${
            viewMode === "kanban" ? "bg-black text-white" : ""
          }`}
          onClick={() => setViewMode("kanban")}
        >
          Kanban
        </button>
      </div>

      {/* Vue Liste */}
      {viewMode === "list" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Tâches assignées</h2>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600">
                    {task.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    Projet : {task.project?.name || "—"}
                  </div>
                </div>

                <a
                  href={`/projects/${task.projectId}`}
                  className="text-xs px-3 py-1 border rounded"
                >
                  Voir
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Vue Kanban */}
      {viewMode === "kanban" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Kanban du mois</h2>

          <div className="grid grid-cols-3 gap-4">
            {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
              <div key={status}>
                <h3 className="font-semibold mb-2">
                  {status === "TODO"
                    ? "À faire"
                    : status === "IN_PROGRESS"
                    ? "En cours"
                    : "Terminées"}
                </h3>

                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="border rounded p-3 flex flex-col gap-2"
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          {task.description}
                        </div>

                        <a
                          href={`/projects/${task.projectId}`}
                          className="text-xs px-3 py-1 border rounded self-end"
                        >
                          Voir
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vue Projets */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Projets avec vos tâches</h2>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-600">
                  {project.description}
                </div>
              </div>

              <a
                href={`/projects/${project.id}`}
                className="text-xs px-3 py-1 border rounded"
              >
                Voir le projet
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}