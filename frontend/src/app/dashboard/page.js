"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState("list");
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [contributors, setContributors] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, userRes] = await Promise.all([
          fetch("/api/dashboard/assigned-tasks"),
          fetch("/api/profile"),
        ]);

        const tasksData = await tasksRes.json();
        const userData = await userRes.json();

        const prioOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

        const sortedTasks = [...tasksData].sort((a, b) => {
          return prioOrder[a.priority] - prioOrder[b.priority];
        });

        setTasks(sortedTasks);
        setUser(userData || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

  async function handleCreateProject(e) {
    e.preventDefault();

    const finalContributors = [...contributors, user?.email];

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          description: description,
          contributors: finalContributors,
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

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.dashboardTitle}>Tableau de bord</h1>

          <p className={styles.dashboardSubtitle}>
            Bonjour {user?.name}, voici un aperçu de vos projets et tâches
          </p>
        </div>

        <button
          className={styles.createProjectBtn}
          onClick={() => setShowModal(true)}
        >
          + Créer un projet
        </button>
      </header>

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

              <div>
                <label>Ajouter un contributeur</label>
                <input
                  type="text"
                  placeholder="Tape un nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

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

              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
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

      <div className={styles.switch}>
        <button
          className={`${styles.switchBtn} ${
            viewMode === "list" ? styles.active : ""
          }`}
          onClick={() => setViewMode("list")}
        >
          <img src="/images/icone-list.png" alt="Liste" />
          <span>Liste</span>
        </button>

        <button
          className={`${styles.switchBtn} ${
            viewMode === "kanban" ? styles.active : ""
          }`}
          onClick={() => setViewMode("kanban")}
        >
          <img
            src="/images/icone-kanban.png"
            alt="Kanban"
            style={{ width: "15px", height: "15.38px" }}
          />
          <span>Kanban</span>
        </button>
      </div>

      {viewMode === "list" && (
        <section className={styles.tasksSection}>
          <h2 className={styles.sectionTitle}>Mes tâches assignées</h2>
          <p className={styles.sectionSubtitle}>Par ordre de priorité</p>

          <ul className={styles.tasksList}>
            {tasks.map((task) => {
              const commentCount = task.comments?.length || 0;

              return (
                <li key={task.id} className={styles.taskCard}>
                  <div className={styles.taskInfo}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    <div className={styles.taskDesc}>{task.description}</div>

                    <div className={styles.taskMeta}>
                      <div className={styles.metaItem}>
                        <img
                          src="/images/dossier.png"
                          alt="Projet"
                          className={styles.metaIcon}
                        />
                        <span>{task.project?.name}</span>
                      </div>

                      <div className={styles.metaSeparator}></div>

                      <div className={styles.metaItem}>
                        <img
                          src="/images/calendrier.png"
                          alt="Date"
                          className={styles.metaIcon}
                        />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>

                      <div className={styles.metaSeparator}></div>

                      <div className={styles.metaItem}>
                        <img
                          src="/images/commentaire.png"
                          alt="Commentaires"
                          className={styles.metaIcon}
                        />
                        <span>{commentCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.taskRight}>
                    <span
                      className={styles.statusBadge}
                      data-status={task.status}
                    >
                      {task.status === "TODO"
                        ? "À faire"
                        : task.status === "IN_PROGRESS"
                        ? "En cours"
                        : "Terminée"}
                    </span>

                    <a
                      href={`/projects/${task.projectId}`}
                      className={styles.btnView}
                    >
                      Voir
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {viewMode === "kanban" && (
        <section className={styles.tasksSection}>
          <h2 className={styles.sectionTitle}>Kanban du mois</h2>

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
    </main>
  );
}