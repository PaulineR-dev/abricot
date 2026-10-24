"use client";

import { useEffect, useState } from "react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import styles from "./dashboard.module.css";

function normalizeTaskStatus(status) {
  const normalized = String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (["TODO", "TO_DO", "A_FAIRE"].includes(normalized)) return "TODO";
  if (["IN_PROGRESS", "INPROGRESS", "EN_COURS"].includes(normalized)) return "IN_PROGRESS";
  if (["DONE", "COMPLETED", "TERMINE", "TERMINEE"].includes(normalized)) return "DONE";
  return normalized;
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState("list");
  const [tasks, setTasks] = useState([]);
  const [taskSearch, setTaskSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const visibleTasks = tasks.filter((task) =>
    task.title?.toLowerCase().includes(taskSearch.trim().toLowerCase())
  );
  const [showModal, setShowModal] = useState(false);
  useEscapeKey(showModal, () => setShowModal(false));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [contributors, setContributors] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showContributorSelector, setShowContributorSelector] = useState(false);

  function openCreateProjectModal() {
    setTitle("");
    setDescription("");
    setContributors([]);
    setSelectedUsers([]);
    setSearch("");
    setResults([]);
    setShowContributorSelector(false);
    setShowModal(true);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, userRes] = await Promise.all([
          fetch("/api/dashboard/assigned-tasks"),
          fetch("/api/profile"),
        ]);

        if (!tasksRes.ok) throw new Error("Impossible de charger vos tâches assignées.");
        if (!userRes.ok) throw new Error("Impossible de charger votre profil.");

        const tasksData = await tasksRes.json();
        const userData = await userRes.json();
        if (!Array.isArray(tasksData)) throw new Error("La liste des tâches reçue est invalide.");

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
    if (search.trim().length < 2) return;

    let isCurrentSearch = true;

    async function searchUsers() {
      try {
        const res = await fetch(`/api/users?query=${search}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (isCurrentSearch) setResults(data);
      } catch (err) {
        console.error(err);
      }
    }

    searchUsers();
    return () => {
      isCurrentSearch = false;
    };
  }, [search]);

  async function handleCreateProject(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          description: description,
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

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
  <main className={`${styles.dashboard} ${viewMode === "kanban" ? styles.kanbanView : ""}`}>
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <h1 className={styles.dashboardTitle}>Tableau de bord</h1>

        <p className={styles.dashboardSubtitle}>
          Bonjour {user?.name}, voici un aperçu de vos projets et tâches
        </p>
      </div>

      <button
        type="button"
        aria-pressed={viewMode === "list"}
        className={styles.createProjectBtn}
        onClick={openCreateProjectModal}
      >
        + Créer un projet
      </button>
    </header>

    {showModal && (
      <div className={styles.projectCreateOverlay}>
        <div
          className={styles.projectCreateModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-create-project-title"
        >
          <button type="button" className={styles.projectCreateClose} aria-label="Fermer" onClick={() => setShowModal(false)}>×</button>
          <h2 id="dashboard-create-project-title">Créer un projet</h2>

          <form onSubmit={handleCreateProject}>
            <div>
              <label htmlFor="dashboard-project-title">Titre*</label>
              <input
                id="dashboard-project-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="dashboard-project-description">Description*</label>
              <textarea
                id="dashboard-project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="dashboard-project-contributor">Contributeur</label>
              <button
                id="dashboard-project-contributor"
                type="button"
                className={styles.contributorSelector}
                aria-expanded={showContributorSelector}
                onClick={() => setShowContributorSelector((open) => !open)}
              >
                {selectedUsers.length ? `${selectedUsers.length} collaborateur${selectedUsers.length > 1 ? "s" : ""}` : "Choisir un ou plusieurs collaborateurs"}
              </button>

              {showContributorSelector && <input
                id="dashboard-project-contributor-search"
                type="text"
                className={styles.contributorSearch}
                placeholder="Rechercher un collaborateur"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Rechercher un collaborateur"
              />}

              {showContributorSelector && search.trim().length >= 2 && results.length > 0 && (
                <div className={styles.projectContributorDropdown}>
                  {results.map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      className={styles.projectContributorOption}
                      onClick={() => {
                        if (!contributors.includes(u.email)) {
                          setContributors([...contributors, u.email]);
                          setSelectedUsers([...selectedUsers, u]);
                        }
                        setSearch("");
                        setResults([]);
                      }}
                    >
                      {u.name} ({u.email})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUsers.length > 0 && <div className={styles.projectSelectedContributors}>
              {selectedUsers.map((u) => (
                <div key={u.id} className={styles.projectSelectedContributor}>
                  <span>{u.name}</span>
                  <button
                    type="button"
                    className={styles.contributorRemoveBtn}
                    onClick={() => {
                      setContributors((current) => current.filter((email) => email !== u.email));
                      setSelectedUsers((current) => current.filter((selected) => selected.id !== u.id));
                    }}
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>}

            <button
              type="submit"
              className={styles.projectCreateSubmit}
              disabled={!title.trim() || !description.trim()}
            >
              Ajouter un projet
            </button>
          </form>

        </div>
      </div>
    )}

    <div className={styles.switch}>
      <button
        type="button"
        className={`${styles.switchBtn} ${styles.switchBtnList} ${
          viewMode === "list" ? styles.active : ""
        }`}
        onClick={() => setViewMode("list")}
      >
        <img src="/images/icone-list.png" alt="" aria-hidden="true" />
        <span>Liste</span>
      </button>

      <button
        type="button"
        aria-pressed={viewMode === "kanban"}
        className={`${styles.switchBtn} ${styles.switchBtnKanban} ${
          viewMode === "kanban" ? styles.active : ""
        }`}
        onClick={() => setViewMode("kanban")}
      >
        <img
          src="/images/icone-kanban.png"
          alt=""
          aria-hidden="true"
          style={{ width: "15px", height: "15.38px" }}
        />
        <span>Kanban</span>
      </button>

    </div>

    {viewMode === "list" && (
      <section className={styles.tasksSection}>
        <div className={styles.listHeading}>
          <div>
            <h2 className={styles.sectionTitle}>Mes tâches assignées</h2>
            <p className={styles.sectionSubtitle}>Par ordre de priorité</p>
          </div>
          <label className={styles.taskSearchBox}>
            <input
              type="search"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Rechercher une tâche"
              aria-label="Rechercher une tâche par nom"
            />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </label>
        </div>
        <ul className={styles.tasksList}>
          {visibleTasks.length === 0 ? (
            <li className={styles.emptySearch}>
              {taskSearch.trim() ? "Aucune tâche trouvée." : "Aucune tâche assignée."}
            </li>
          ) : visibleTasks.map((task) => {
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
                        className={`${styles.metaIcon} ${styles.folder}`}
                      />
                      <span>{task.project?.name}</span>
                    </div>

                    <div className={styles.metaSeparator}></div>

                    <div className={styles.metaItem}>
                      <img
                        src="/images/calendrier.png"
                        alt="Date"
                        className={`${styles.metaIcon} ${styles.calendar}`}
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
                        className={`${styles.metaIcon} ${styles.comment}`}
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
      <section
        className={`${styles.tasksSection} ${styles.kanbanMode}`}
      >
        <div className={styles.kanbanGrid}>
          {["TODO", "IN_PROGRESS", "DONE"].map((status) => {
            const filtered = tasks.filter((task) => normalizeTaskStatus(task.status) === status);

            return (
              <div key={status} className={styles.kanbanColumn}>
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>
                    {status === "TODO"
                      ? "À faire"
                      : status === "IN_PROGRESS"
                      ? "En cours"
                      : "Terminées"}
                  </span>

                  <span className={styles.columnCount}>{filtered.length}</span>
                </div>

                {filtered.map((task) => {
                  const commentCount = task.comments?.length || 0;

                  const statusClass =
                    status === "TODO"
                      ? styles.statusTODO
                      : status === "IN_PROGRESS"
                      ? styles.statusINPROGRESS
                      : styles.statusDONE;

                  return (
                    <div key={task.id} className={styles.kanbanCard}>
                      <span
                        className={`${styles.statusBadgeKanban} ${statusClass}`}
                      >
                        {status === "TODO"
                          ? "À faire"
                          : status === "IN_PROGRESS"
                          ? "En cours"
                          : "Terminée"}
                      </span>

                      <div className={styles.cardTitle}>{task.title}</div>

                      <div className={styles.cardDesc}>{task.description}</div>

                      <div className={styles.metaRowKanban}>
                        <div className={styles.metaItemKanban}>
                          <img
                            src="/images/dossier.png"
                            alt="Projet"
                            className={`${styles.metaIconKanban} ${styles.folder}`}
                          />
                          <span>{task.project?.name}</span>
                        </div>

                        <div className={styles.metaSeparatorKanban}></div>

                        <div className={styles.metaItemKanban}>
                          <img
                            src="/images/calendrier.png"
                            alt="Date"
                            className={`${styles.metaIconKanban} ${styles.calendar}`}
                          />
                          <span>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                            }) : "Sans échéance"}
                          </span>
                        </div>

                        <div className={styles.metaSeparatorKanban}></div>

                        <div className={styles.metaItemKanban}>
                          <img
                            src="/images/commentaire.png"
                            alt="Commentaires"
                            className={`${styles.metaIconKanban} ${styles.comment}`}
                          />
                          <span>{commentCount}</span>
                        </div>
                      </div>

                      <a
                        href={`/projects/${task.projectId}`}
                        className={styles.btnViewKanban}
                      >
                        Voir
                      </a>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
    )}

    </main>
  );
}