"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import styles from "./projects.module.css";

// Crée les initiales affichées à côté du nom de chaque personne.
function getInitials(name) {
  const parts = (name || "?").trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0]?.slice(0, 2) || "?").toUpperCase();
}
// Affiche la liste des projets et permet de créer un nouveau projet.
export default function ProjectsPage() {
  // Mémorise les projets affichés et les éventuelles erreurs de chargement.
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  // Modale de création
  const [showModal, setShowModal] = useState(false);
  useEscapeKey(showModal, () => setShowModal(false));

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
  const [showContributorSelector, setShowContributorSelector] = useState(false);

  // Vide les champs du formulaire puis ouvre la fenêtre de création.
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

  // Charge les projets et leurs tâches, puis actualise la liste lorsqu’elle change.
  useEffect(() => {
    // Évite de mettre à jour la page si elle a été quittée avant la fin du chargement.
    let active = true;

    // Récupère la liste des projets, puis ajoute à chacun la liste de ses tâches.
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Attend que les tâches de tous les projets soient récupérées avant de continuer.
        const projectsWithTasks = await Promise.all(
          data.map(async (project) => {
            const tasksRes = await fetch(`/api/projects/${project.id}/tasks`, {
              cache: "no-store",
            });
            const tasks = await tasksRes.json();
            if (!tasksRes.ok) throw new Error(tasks.error || "Impossible de charger les tâches du projet");
            return { ...project, tasks: Array.isArray(tasks) ? tasks : [] };
          })
        );
        if (!active) return;

        // Classe d’abord les projets selon leur tâche la plus prioritaire, puis selon l’échéance la plus proche.
        const prioOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const sorted = [...projectsWithTasks].sort((a, b) => {
          // Un chiffre plus petit correspond à une priorité plus élevée ; 99 place les priorités inconnues après les autres.
          const minPrioA = Math.min(...(a.tasks || []).map((task) => prioOrder[task.priority] ?? 99), 99);
          const minPrioB = Math.min(...(b.tasks || []).map((task) => prioOrder[task.priority] ?? 99), 99);
          if (minPrioA !== minPrioB) return minPrioA - minPrioB;

          // Si la priorité est égale, compare les échéances les plus proches de chaque projet.
          const minDateA = Math.min(...(a.tasks || []).map((task) => task.dueDate ? new Date(task.dueDate).getTime() : Infinity), Infinity);
          const minDateB = Math.min(...(b.tasks || []).map((task) => task.dueDate ? new Date(task.dueDate).getTime() : Infinity), Infinity);
          return minDateA - minDateB;
        });

        setProjects(sorted);
        setError("");
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    // Recharge la liste après une mise à jour, un retour sur la page ou quand elle redevient visible.
    const refreshProjects = () => loadProjects();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadProjects();
    };

    loadProjects();
    window.addEventListener("projects:refresh", refreshProjects);
    window.addEventListener("popstate", refreshProjects);
    window.addEventListener("pageshow", refreshProjects);
    window.addEventListener("focus", refreshProjects);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      window.removeEventListener("projects:refresh", refreshProjects);
      window.removeEventListener("popstate", refreshProjects);
      window.removeEventListener("pageshow", refreshProjects);
      window.removeEventListener("focus", refreshProjects);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);
  // Recherche les personnes à ajouter au projet lorsque deux caractères ou plus sont saisis.
  useEffect(() => {
    if (search.trim().length < 2) return;

    // Permet d’ignorer une réponse si la recherche a changé entre-temps.
    let isCurrentSearch = true;

    // Demande au serveur les personnes correspondant à la recherche.
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

  // Envoie au serveur le titre, la description et les adresses des contributeurs choisis.
  async function handleCreateProject(e) {
    e.preventDefault();

    try {
      // Envoie le titre, la description et les personnes sélectionnées au serveur.
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

  // Affiche une erreur au lieu de la liste si le chargement a échoué.
  if (error) return <p>{error}</p>;

  // Affiche le titre, le formulaire de création et les cartes des projets.
  return (
  <div className={styles.page}>
    <div className={styles.header}>
      <div>
        <h1 className={styles.pageHeaderTitle}>Mes projets</h1>
        <p className={styles.pageHeaderSubtitle}>Gérez vos projets</p>
      </div>

      <button
        type="button"
        onClick={openCreateProjectModal}
        className={styles.createButton}
      >
        + Créer un projet
      </button>
    </div>

    {/* MODALE */}
    {showModal && (
      <div
        className={styles.modalOverlay}
      >
        <div
          className={`${styles.modalCard} ${styles.projectCreateModal}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="projects-create-title"
        >
          <button type="button" className={styles.projectModalClose} aria-label="Fermer" onClick={() => setShowModal(false)}>×</button>
          <h2 id="projects-create-title">Créer un projet</h2>

          <form onSubmit={handleCreateProject}>
            <div>
              <label htmlFor="create-project-title">Titre*</label>
              <input
                id="create-project-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="create-project-description">Description*</label>
              <textarea
                id="create-project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* AUTOCOMPLETE */}
            <div>
              <label htmlFor="create-project-contributor">Contributeur</label>
              <button
                id="create-project-contributor"
                type="button"
                className={styles.contributorSelector}
                aria-expanded={showContributorSelector}
                onClick={() => setShowContributorSelector((open) => !open)}
              >
                {selectedUsers.length ? `${selectedUsers.length} collaborateur${selectedUsers.length > 1 ? "s" : ""}` : "Choisir un ou plusieurs collaborateurs"}
              </button>

              {showContributorSelector && (
                <input
                  className={styles.contributorSearch}
                  type="text"
                  placeholder="Rechercher un collaborateur"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Rechercher un collaborateur"
                />
              )}

              {/* Résultats */}
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

            {/* Tags contributeurs */}
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
              className={styles.projectModalSubmit}
              disabled={!title.trim() || !description.trim()}
            >
              Ajouter un projet
            </button>
          </form>
        </div>
      </div>
    )}

    {/* Grille */}
    <div className={styles.projectsGrid}>
      {projects.map((p) => {
          const members = p.members || [];
          const contributors = members.filter((member) => member.user?.id !== p.owner?.id);
          const teamSize = contributors.length + (p.owner ? 1 : 0);
          const totalTasks = p.tasks?.length || 0;
          const doneTasks = p.tasks?.filter((task) => String(task.status || "").trim().toUpperCase() === "DONE").length || 0;
          const progression = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className={styles.projectCard}>
                <div className={styles.projectIntro}>
                  <h3 className={styles.projectName}>{p.name}</h3>
                  <p className={styles.projectDescription}>{p.description}</p>
                </div>

                <div className={styles.progressBlock}>
                  <p className={styles.progressTitle}>
                    <span>Progression</span>
                    <span>{progression}%</span>
                  </p>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progression}%` }} />
                  </div>
                  <p className={styles.progressCount}>
                    {doneTasks}/{totalTasks} tâches terminées
                  </p>
                </div>

                <div className={styles.team}>
                  <p className={styles.teamTitle}>
                    <img src="/images/union.png" alt="Icône de l’équipe" />
                    <span>Équipe ({teamSize})</span>
                  </p>
                  <div className={styles.teamMembers}>
                    {p.owner && (
                      <div className={styles.teamPerson}>
                        <div className={styles.ownerInitials} role="img" aria-label={`Initiales de ${p.owner.name}`}>
                          {getInitials(p.owner.name)}
                        </div>
                        <span className={styles.ownerLabel}>Propriétaire</span>
                      </div>
                    )}
                    {contributors.map((member) => (
                      <div
                        key={member.id}
                        className={styles.contributorInitials}
                        role="img"
                        aria-label={`Initiales de ${member.user.name}`}
                      >
                        {getInitials(member.user.name)}
                      </div>
                    ))}
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