"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Page liste des projets
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  // Modale de création
  const [showModal, setShowModal] = useState(false);

  // Champs du formulaire de création
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Contributeurs envoyés au backend (emails)
  const [contributors, setContributors] = useState([]);

  // Utilisateurs sélectionnés (affichage)
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Recherche utilisateurs
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  // Charge les projets et le tri par priorité
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const prioOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

        const sorted = [...data].sort((a, b) => {
          const minPrioA = Math.min(
            ...(a.tasks || []).map(t => prioOrder[t.priority] ?? 99),
            99
          );

          const minPrioB = Math.min(
            ...(b.tasks || []).map(t => prioOrder[t.priority] ?? 99),
            99
          );

          if (minPrioA !== minPrioB) return minPrioA - minPrioB;

          const minDateA = Math.min(
            ...(a.tasks || []).map(t =>
              t.dueDate ? new Date(t.dueDate).getTime() : Infinity
            ),
            Infinity
          );

          const minDateB = Math.min(
            ...(b.tasks || []).map(t =>
              t.dueDate ? new Date(t.dueDate).getTime() : Infinity
            ),
            Infinity
          );

          return minDateA - minDateB;
        });

        setProjects(sorted);
      } catch (err) {
        setError(err.message);
      }
    }

    loadProjects();
  }, []);

  // Recherche dynamique des utilisateurs
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }

    async function searchUsers() {
      try {
        const res = await fetch(`/api/users?query=${search}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    }

    searchUsers();
  }, [search]);

  // Création d’un projet
  async function handleCreateProject(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          description,
          contributors,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) return <p>{error}</p>;

  return (
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h1 style={{ marginBottom: "4px" }}>Mes projets</h1>
        <p style={{ marginTop: "0", color: "#555" }}>Gérez vos projets</p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        style={{
          background: "black",
          color: "white",
          padding: "10px 16px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
      >
        + Créer un projet
      </button>
    </div>

    {/* MODALE */}
    {showModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "8px",
            width: "400px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Créer un projet</h2>

          <form onSubmit={handleCreateProject}>
            <div>
              <label>Titre*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Description*</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* AUTOCOMPLETE */}
            <div>
              <label>Ajouter un contributeur</label>
              <input
                type="text"
                placeholder="Tape un nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Résultats */}
              {results.length > 0 && (
                <div
                  style={{
                    border: "1px solid #ccc",
                    marginTop: "4px",
                    borderRadius: "4px",
                    background: "#fff",
                    maxHeight: "150px",
                    overflowY: "auto",
                  }}
                >
                  {results.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        if (!contributors.includes(u.email)) {
                          setContributors([...contributors, u.email]);
                          setSelectedUsers([...selectedUsers, u]);
                        }
                        setSearch("");
                        setResults([]);
                      }}
                      style={{
                        padding: "8px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {u.name} ({u.email})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags contributeurs */}
            <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  style={{
                    background: "#eee",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  {u.name}
                </span>
              ))}
            </div>

            <button
              type="submit"
              style={{
                marginTop: "20px",
                background: "black",
                color: "white",
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Ajouter un projet
            </button>
          </form>

          <button
            onClick={() => setShowModal(false)}
            style={{
              marginTop: "10px",
              background: "#ddd",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    )}

    {/* Grille */}
    <div
      style={{
        marginTop: "30px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {projects
        .filter(p => p.members.length > 0)
        .map((p) => {
          const totalTasks = p.tasks?.length || 0;
          const doneTasks = p.tasks?.filter((t) => t.status === "DONE").length || 0;
          const progression = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{p.name}</h3>

                <p style={{ color: "#555", fontSize: "14px" }}>{p.description}</p>

                <div style={{ marginTop: "10px" }}>
                  <p style={{ margin: "0 0 4px 0" }}>Progression {progression}%</p>
                  <div
                    style={{
                      height: "6px",
                      background: "#eee",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progression}%`,
                        height: "100%",
                        background: "black",
                      }}
                    ></div>
                  </div>
                  <p style={{ marginTop: "6px", fontSize: "13px", color: "#666" }}>
                    {doneTasks}/{totalTasks} tâches terminées
                  </p>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <p style={{ marginBottom: "6px" }}>Équipe ({p.members.length})</p>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {p.members.map((m) => {
                      const initials = m.user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase();

                      const roleLabel = m.role === "OWNER" ? "Admin" : "Contributeur";

                      return (
                        <div
                          key={m.id}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#eee",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          {initials}
                        </div>
                      );
                    })}

                    <span
                      style={{
                        background: "#ffb347",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        marginLeft: "8px",
                      }}
                    >
                      {p.members.some((m) => m.role === "OWNER") ? "Admin" : "Contributeur"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
    </div>
  </div>
);
}