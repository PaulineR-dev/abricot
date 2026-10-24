"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import styles from "./ProjectDetail.module.css";

function getInitialsFull(nameOrEmail) {
  if (!nameOrEmail) return "?";

  const name = nameOrEmail.trim();

  if (name.includes("@")) {
    return name.slice(0, 2).toUpperCase();
  }

  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return name[0].toUpperCase();
}

export default function ProjectDetail(props) {
  const { id } = use(props.params);
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  const { user: currentUser } = useContext(AuthContext);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAiTaskModal, setShowAiTaskModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTasks, setAiTasks] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [editingAiTask, setEditingAiTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskStatus, setTaskStatus] = useState("TODO");
  const [taskAssignees, setTaskAssignees] = useState([]);

  const [searchUser, setSearchUser] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [showEditProjectContributorSelector, setShowEditProjectContributorSelector] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [editAssignees, setEditAssignees] = useState([]);

  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
  const [showEditAssigneeSelector, setShowEditAssigneeSelector] =
    useState(false);

  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMembers, setEditMembers] = useState([]);

  useEscapeKey(showTaskModal, () => setShowTaskModal(false));
  useEscapeKey(showAiTaskModal, () => {
    if (!aiLoading) setShowAiTaskModal(false);
  });
  useEscapeKey(showEditModal, () => setShowEditModal(false));
  useEscapeKey(showEditProjectModal, () => setShowEditProjectModal(false));

  const [newComment, setNewComment] = useState({});

  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (e.target.closest(`.${styles.taskMenuWrapper}`)) return;
      setOpenMenu(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [expandedComments, setExpandedComments] = useState({});

  const [viewMode, setViewMode] = useState("list");
  const [taskStatusFilter, setTaskStatusFilter] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");

  const filteredTasks = (project?.project?.tasks || []).filter((task) => {
    const matchesStatus = !taskStatusFilter || task.status?.toUpperCase().trim() === taskStatusFilter;
    const matchesSearch = task.title?.toLowerCase().includes(taskSearch.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  async function reloadProject() {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Impossible de charger ce projet.");

    setProject(data);
    setEditMembers(data.project?.members || []);
  }

  async function generateAiTasks() {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de générer les tâches.");
      setAiTasks(data.tasks);
      setEditingAiTask(null);
    } catch (err) {
      setAiError(err.message || "Une erreur est survenue.");
    } finally {
      setAiLoading(false);
    }
  }

  function selectAiTask(task) {
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDue("");
    setTaskStatus("TODO");
    setTaskAssignees([]);
    setShowAiTaskModal(false);
    setShowTaskModal(true);
  }
  async function reloadTasks(force) {
    const res = await fetch(`/api/projects/${id}/tasks?force=${force}`);
    const tasks = await res.json();
    if (!res.ok) throw new Error(tasks.error || "Impossible de charger les tâches du projet.");

    setProject((prev) => prev ? ({
      ...prev,
      project: {
        ...prev.project,
        tasks: Array.isArray(tasks) ? tasks : [],
      },
    }) : prev);
  }

  async function reloadComments(taskId) {
    const res = await fetch(`/api/projects/${id}/tasks/${taskId}/comments`);
    const comments = await res.json();

    setProject((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        tasks: prev.project.tasks.map((t) =>
          t.id === taskId ? { ...t, comments } : t
        ),
      },
    }));
  }

  useEffect(() => {
    async function load() {
      try {
        await reloadProject();
        await reloadTasks(Date.now());
      } catch (loadError) {
        setError(loadError.message || "Impossible de charger ce projet.");
      }
    }
    load();
  }, [id]);

  const role = project?.project?.userRole?.toLowerCase();
  const isOwner = ["owner", "admin"].includes(role);
  const isMember = ["contributor", "member"].includes(role);
  const canDeleteProject = project?.project?.owner?.id === currentUser?.id;
  const assignableUsers = project?.project
    ? [project.project.owner, ...project.project.members.map((member) => member.user)]
        .filter((user, index, users) => user && users.findIndex((candidate) => candidate?.id === user.id) === index)
    : [];

  async function handleDeleteProject() {
    if (!canDeleteProject || !window.confirm("Supprimer définitivement ce projet et ses tâches ?")) return;

    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Impossible de supprimer le projet.");
      return;
    }

    window.dispatchEvent(new Event("projects:refresh"));
    router.push("/projects");
  }

  useEffect(() => {
    if (searchUser.trim().length < 2) {
      return;
    }

    let isCurrentSearch = true;

    async function search() {
      const res = await fetch(`/api/users?query=${searchUser}`);
      const data = await res.json();
      if (isCurrentSearch && res.ok) setUserResults(data);
    }

    search();
    return () => {
      isCurrentSearch = false;
    };
  }, [searchUser]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!project) return <p>Chargement...</p>;

  return (
    <div className={styles.pageWrapper}>
      {/* HEADER */}
      <div className={styles.headerWrapper}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backBtn}
            type="button"
            aria-label="Retour aux projets"
            onClick={() => {
              router.push("/projects");
              window.setTimeout(() => window.dispatchEvent(new Event("projects:refresh")), 100);
            }}
          >
            ←
          </button>

          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <h1 className={styles.projectTitle}>{project.project.name}</h1>

              {isOwner && (
                <button
                  type="button"
                  className={styles.projectEditLink}
                  onClick={() => {
                    setEditTitle(project.project.name);
                    setEditDescription(project.project.description);
                    setEditMembers(project.project.members);
                    setShowEditProjectContributorSelector(false);
                    setSearchUser("");
                    setUserResults([]);
                    setShowEditProjectModal(true);
                  }}
                >
                  Modifier
                </button>
              )}
              {canDeleteProject && (
                <button type="button" className={styles.projectEditLink} onClick={handleDeleteProject}>
                  Supprimer le projet
                </button>
              )}
            </div>

            <p className={styles.projectDescriptionHeader}>
              {project.project.description}
            </p>
          </div>
        </div>

        {(isOwner || isMember) && (
          <div className={styles.createTaskActions}>
            <button className={styles.createTaskBtn} onClick={() => { setTaskTitle(""); setTaskDescription(""); setTaskDue(""); setTaskStatus("TODO"); setTaskAssignees([]); setShowTaskModal(true); }}>
              Créer une tâche
            </button>
            <button className={styles.aiTaskBtn} onClick={() => { setAiPrompt(""); setAiTasks([]); setAiError(""); setEditingAiTask(null); setShowAiTaskModal(true); }}>
              <img src="/images/Star.png" alt="" aria-hidden="true" />
              IA
            </button>
          </div>
        )}
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className={styles.contentWrapper}>
        <div className={styles.contributorsBlock}>
          <div className={styles.contributorsLeft}>
            <span className={styles.contributorsTitle}>Contributeurs</span>
            <span className={styles.contributorsCount}>
              {project.project.members.length === 1
                ? "1 personne"
                : `${project.project.members.length} personnes`}
            </span>
          </div>

          <div className={styles.contributorsRight}>
            <div className={styles.personRow}>
              <div className={styles.adminInitial}>
                {project.project.owner.name.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.ownerBadgeBubble}>Propriétaire</div>
            </div>

            {project.project.members.filter((m) => m.user.id !== project.project.owner.id).map((m) => (
              <div key={m.id} className={styles.personRow}>
                <div className={styles.memberInitial}>
                  {m.user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.memberNameBubble}>{m.user.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TÂCHES */}
        <div className={styles.tasksSection}>
          <div className={styles.tasksHeaderRow}>
            <div className={styles.tasksHeaderLeft}>
              <h3 className={styles.tasksTitle}>Tâches</h3>
              <span className={styles.tasksSubtitle}>Par ordre de priorité</span>
            </div>

            <div className={styles.tasksViewSwitch}>
              <button
                className={`${styles.switchBtnProject} ${
                  viewMode === "list" ? styles.switchBtnProjectActive : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <img src="/images/icone-kanban.png" alt="" aria-hidden="true" className={styles.switchIcon} />
                <span>Liste</span>
              </button>

              <button
                type="button"
                aria-pressed={viewMode === "calendar"}
                className={`${styles.switchBtnProject} ${
                  viewMode === "calendar" ? styles.switchBtnProjectActive : ""
                }`}
                onClick={() => setViewMode("calendar")}
              >
                <img src="/images/icone-list.png" alt="" aria-hidden="true" className={styles.switchIcon} />
                <span>Calendrier</span>
              </button>
            </div>

            <div className={styles.taskFilters}>
              <div className={styles.statusFilterWrapper}>
                <button
                  type="button"
                  className={styles.statusFilterButton}
                  aria-expanded={showStatusDropdown}
                  onClick={() => setShowStatusDropdown((open) => !open)}
                >
                  <span>{taskStatusFilter === "TODO" ? "À faire" : taskStatusFilter === "IN_PROGRESS" ? "En cours" : taskStatusFilter === "DONE" ? "Terminée" : "Statut"}</span>
                  <span className={styles.statusFilterChevron} />
                </button>
                {showStatusDropdown && (
                  <div id="task-status-options" className={styles.statusFilterDropdown}>
                    {[
                      { value: null, label: "Tous les statuts" },
                      { value: "TODO", label: "À faire" },
                      { value: "IN_PROGRESS", label: "En cours" },
                      { value: "DONE", label: "Terminée" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value || "all"}
                        className={styles.statusFilterOption}
                        onClick={() => {
                          setTaskStatusFilter(option.value);
                          setShowStatusDropdown(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
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
          </div>

          {/* LIST VIEW */}
          {(viewMode === "list" || viewMode === "calendar") && (
            <div className={viewMode === "list" ? styles.tasksList : styles.calendarView}>
              {(viewMode === "calendar"
                ? filteredTasks.slice().sort((a, b) => {
                    const da = a.dueDate ? new Date(a.dueDate) : null;
                    const db = b.dueDate ? new Date(b.dueDate) : null;
                    if (!da && !db) return 0;
                    if (!da) return 1;
                    if (!db) return -1;
                    return da - db;
                  })
                : filteredTasks)
                .map((task) => (
                  <div key={task.id} className={styles.taskCard}>

                    {viewMode === "calendar" && (
                      <div className={styles.calendarDate}>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })
                          : "Aucune échéance"}
                      </div>
                    )}

                    {/* HEADER */}
                    <div className={styles.taskHeaderRow}>
                      <h4 className={styles.taskTitle}>{task.title}</h4>

                      <span
                        className={`${styles.statusBubble} ${
                          task.status === "DONE"
                            ? styles.statusDone
                            : task.status === "IN_PROGRESS"
                            ? styles.statusProgress
                            : styles.statusTodo
                        }`}
                      >
                        {task.status === "DONE" && "Terminée"}
                        {task.status === "IN_PROGRESS" && "En cours"}
                        {task.status === "TODO" && "À faire"}
                      </span>

                      <div className={styles.taskHeaderRight}>
                        <div className={styles.taskMenuWrapper}>
                          <button
                            type="button"
                            aria-label={`Actions pour ${task.title}`}
                            aria-expanded={openMenu === task.id}
                            className={styles.taskMenuBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === task.id ? null : task.id);
                            }}
                          >
                            <span className={styles.taskMenuDots}>...</span>
                          </button>

                          {openMenu === task.id && (
                            <div
                              className={styles.taskMenuDropdown}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isOwner && (
                                <button
                                  type="button"
                                  className={styles.taskMenuItem}
                                  onClick={() => {
                                    setTaskToEdit(task);
                                    setEditAssignees(
                                      task.assignees ? task.assignees.map((a) => a.user.id) : []
                                    );
                                    setShowEditModal(true);
                                  }}
                                >
                                  Modifier
                                </button>
                              )}

                              {(isOwner || isMember) && (
                                <button
                                  type="button"
                                  className={styles.taskMenuItem}
                                  onClick={async () => {
                                    if (!confirm("Supprimer cette tâche ?")) return;

                                    const res = await fetch(
                                      `/api/projects/${id}/tasks/${task.id}`,
                                      { method: "DELETE" }
                                    );

                                    if (res.ok) {
                                     await reloadTasks(Date.now());

                                    } else {
                                      alert("Erreur lors de la suppression de la tâche");
                                    }
                                  }}
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <p className={styles.taskDescription}>{task.description}</p>

                    {/* ÉCHÉANCE */}
                    {viewMode === "list" && <div className={styles.taskMetaRow}>
                      <span className={styles.metaLabel}>Échéance :</span>

                      <img src="/images/calendrier.png" alt="Échéance" className={styles.metaIcon} />

                      <span className={styles.metaText}>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                            })
                          : "Aucune échéance"}
                      </span>
                    </div>}

                    {/* ASSIGNÉS */}
                    <div className={styles.assigneesRow}>
                      <span className={styles.metaLabel}>Assigné à :</span>

                      {task.assignees && task.assignees.length > 0 ? (
                        task.assignees.map((a) => (
                          <div key={a.user.id} className={styles.assigneeItem}>
                            <div className={styles.assigneeAvatar}>
                              {getInitialsFull(a.user.name || a.user.email)}
                            </div>

                            <span className={styles.assigneeName}>
                              {a.user.name || a.user.email}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className={styles.noAssignee}>Aucun collaborateur</span>
                      )}
                    </div>

                    <div className={styles.separator}></div>

                    {/* COMMENTAIRES — HEADER */}
                    <button
                      type="button"
                      className={styles.commentsHeader}
                      aria-expanded={Boolean(expandedComments[task.id])}
                      onClick={() =>
                        setExpandedComments((prev) => ({
                          ...prev,
                          [task.id]: !prev[task.id],
                        }))
                      }
                    >
                      <span>
                        Commentaires ({task.comments ? task.comments.length : 0})
                      </span>

                      <svg
                        width="16"
                        height="8"
                        viewBox="0 0 16 8"
                        className={styles.vArrow}
                        style={{
                          transform: expandedComments[task.id] ? "rotate(0deg)" : "rotate(180deg)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <path d="M1 1 L8 7 L15 1" stroke="#0F0F0F" strokeWidth="1" fill="none" />
                      </svg>
                    </button>

                    {/* COMMENTAIRES — CONTENU */}
                    {expandedComments[task.id] && (
                      <div id={`comments-panel-${task.id}`} className={styles.commentsContent}>
                        {task.comments && task.comments.length > 0 ? (
                          task.comments.map((c) => (
                            <div key={c.id} className={styles.commentItem}>
                              <div className={styles.commentAvatar}>
                                {getInitialsFull(c.author.name || c.author.email)}
                              </div>

                              <div className={styles.commentBox}>
                                <div className={styles.commentHeader}>
                                  <span className={styles.commentAuthor}>
                                    {c.author.name || c.author.email}
                                  </span>

                                  <span className={styles.commentDate}>
                                    {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                    })}
                                    ,{" "}
                                    {new Date(c.createdAt).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>

                                <p className={styles.commentText}>{c.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={styles.noComments}>Aucun commentaire.</p>
                        )}

                        {/* AJOUTER UN COMMENTAIRE */}
                        {(isOwner || isMember) && (
                          <div className={styles.addCommentRow}>
                            <div className={styles.commentAvatar}>
                              {getInitialsFull(currentUser?.name || currentUser?.email)}
                            </div>

                            <textarea
                              className={styles.addCommentTextarea}
                              aria-label={`Ajouter un commentaire à ${task.title}`}
                              placeholder="Ajouter un commentaire..."
                              value={newComment[task.id] || ""}
                              onChange={(e) =>
                                setNewComment((prev) => ({
                                  ...prev,
                                  [task.id]: e.target.value,
                                }))
                              }
                            />

                            <button
                              className={styles.sendCommentBtn}
                              onClick={async () => {
                                const content = String(newComment[task.id] || "").trim();
                                if (!content) return;

                                const res = await fetch(
                                  `/api/projects/${id}/tasks/${task.id}/comments`,
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ content }),
                                  }
                                );

                                if (res.ok) {
                                  setNewComment((prev) => ({
                                    ...prev,
                                    [task.id]: "",
                                  }));
                                  await reloadComments(task.id);
                                } else {
                                  alert("Erreur lors de l'ajout du commentaire");
                                }
                              }}
                            >
                              Envoyer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

        </div>

        {showAiTaskModal && (
          <div className={styles.modalOverlay} onMouseDown={(e) => { if (e.target === e.currentTarget && !aiLoading) setShowAiTaskModal(false); }}>
            <div className={`${styles.modalCard} ${styles.aiTaskModal}`} role="dialog" aria-modal="true" aria-labelledby="ai-task-modal-title">
              <div className={styles.aiModalHeader}>
                <Image src="/images/Star.png" alt="" aria-hidden="true" width={20} height={20} className={styles.aiTitleStar} />
                <h2 id="ai-task-modal-title">Créer une tâche</h2>
                <button className={styles.aiCloseBtn} aria-label="Fermer" disabled={aiLoading} onClick={() => setShowAiTaskModal(false)}>×</button>
              </div>
              <div className={styles.aiPromptRow}>
                <textarea id="ai-task-prompt" className={styles.modalTextarea} aria-label="Décrivez les tâches que vous souhaitez ajouter" value={aiPrompt} maxLength={4000} placeholder="Décrivez les tâches que vous souhaitez ajouter..." onChange={(e) => setAiPrompt(e.target.value)} />
                <button className={styles.aiPromptSubmit} aria-label="Générer des propositions de tâches" disabled={aiLoading || !aiPrompt.trim()} onClick={generateAiTasks}>
                  <Image src="/images/IAbutton.png" alt="Générer des tâches avec l’IA" width={24} height={24} />
                </button>
              </div>
              {aiError && <p className={styles.aiError} role="alert">{aiError}</p>}
              {aiTasks.length > 0 && (
                <div className={styles.aiSuggestions}>
                  {aiTasks.map((task, index) => (
                    <article className={styles.aiSuggestionCard} key={`${index}-${task.title}`}>
                      {editingAiTask === index ? (
                        <div className={styles.aiEditFields}>
                          <input className={styles.modalInput} aria-label="Titre de la tâche proposée" value={task.title} onChange={(e) => setAiTasks((items) => items.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} />
                          <textarea className={styles.modalTextarea} aria-label="Description de la tâche proposée" value={task.description} onChange={(e) => setAiTasks((items) => items.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} />
                          <button className={styles.aiTextBtn} onClick={() => setEditingAiTask(null)}>Terminé</button>
                        </div>
                      ) : (
                        <button className={styles.aiSuggestionContent} onClick={() => selectAiTask(task)}>
                          <strong>{task.title}</strong><span>{task.description}</span>
                        </button>
                      )}
                      <div className={styles.aiSuggestionActions}>
                        <button className={styles.aiTextBtn} onClick={() => setAiTasks((items) => items.filter((_, i) => i !== index))}>Supprimer</button>
                        {editingAiTask !== index && <button className={styles.aiTextBtn} onClick={() => setEditingAiTask(index)}>Modifier</button>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* MODALE CRÉATION TÂCHE */}
        {showTaskModal && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalCard} ${styles.taskFormModal} ${styles.createTaskFormModal}`} role="dialog" aria-modal="true" aria-labelledby="create-task-modal-title">
              <button type="button" className={styles.modalCloseBtn} aria-label="Fermer" onClick={() => setShowTaskModal(false)}>×</button>
              <h2 id="create-task-modal-title">Créer une tâche</h2>

              <label htmlFor="create-task-title">Titre*</label>
              <input
                id="create-task-title"
                className={styles.modalInput}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />

              <label htmlFor="create-task-description">Description*</label>
              <textarea
                id="create-task-description"
                className={styles.modalTextarea}
                required
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />

              <label htmlFor="create-task-due">Échéance</label>
              <input
                id="create-task-due"
                type="date"
                className={styles.modalInput}
                required
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
              />

              <label htmlFor="create-task-assignee-trigger">Assigner à :</label>

              <button
                type="button"
                id="create-task-assignee-trigger"
                aria-label="Choisir les collaborateurs à assigner"
                aria-expanded={showAssigneeSelector}
                className={styles.assigneeSelector}
                onClick={() => setShowAssigneeSelector(!showAssigneeSelector)}
              >
                {taskAssignees.length === 0
                  ? "Choisir un ou plusieurs collaborateurs"
                  : taskAssignees.map((u) => u.name || u.email).join(", ")}
              </button>

              {showAssigneeSelector && (
                <div id="create-task-assignees" className={styles.assigneeDropdown}>
                  {assignableUsers.map((user) => (
                    <label key={user.id} className={styles.assigneeOption}>
                      <input
                        type="checkbox"
                        checked={taskAssignees.some((assignee) => assignee.id === user.id)}
                        onChange={() => {
                          if (taskAssignees.some((assignee) => assignee.id === user.id)) {
                            setTaskAssignees(
                              taskAssignees.filter((assignee) => assignee.id !== user.id)
                            );
                          } else {
                            setTaskAssignees([...taskAssignees, user]);
                          }
                        }}
                      />
                      {user.name || user.email}
                    </label>
                  ))}
                </div>
              )}

              <fieldset className={styles.taskStatusFieldset}>
                <legend>Statut :</legend>
                <div className={styles.taskStatusOptions}>
                  {[['TODO', 'À faire'], ['IN_PROGRESS', 'En cours'], ['DONE', 'Terminée']].map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={taskStatus === value} className={`${styles.taskStatusOption} ${styles[`taskStatus${value}`]}`} onClick={() => setTaskStatus(value)}>{label}</button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.modalButtonsRow}>
                <button
                  className={styles.modalPrimaryBtn}
                  disabled={!taskTitle.trim() || !taskDescription.trim() || !taskDue}
                  onClick={async () => {
                    const body = {
                      title: taskTitle,
                      description: taskDescription,
                      dueDate: taskDue || null,
                      status: taskStatus,
                      assigneeIds:
                        taskAssignees.length > 0
                          ? taskAssignees.map((u) => u.id)
                          : [],
                    };

                    const res = await fetch(`/api/projects/${id}/tasks`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    });

                    const newTask = await res.json();

                    if (res.ok) {
                      if (taskStatus !== "TODO") {
                        const statusRes = await fetch(`/api/projects/${id}/tasks/${newTask.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: taskStatus }),
                        });
                        if (!statusRes.ok) {
                          const statusError = await statusRes.json().catch(() => ({}));
                          alert(statusError.error || "La tâche a été créée, mais son statut n'a pas pu être enregistré.");
                          await reloadTasks(Date.now());
                          setShowTaskModal(false);
                          return;
                        }
                      }

                      await reloadTasks(Date.now());

                      setShowTaskModal(false);
                    }

                  }}
                >
                  + Ajouter une tâche
                </button>

                <button
                  className={styles.modalSecondaryBtn}
                  onClick={() => setShowTaskModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODALE ÉDITION TÂCHE */}
        {showEditModal && taskToEdit && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalCard} ${styles.taskFormModal} ${styles.editTaskFormModal}`} role="dialog" aria-modal="true" aria-labelledby="edit-task-modal-title">
              <button type="button" className={styles.modalCloseBtn} aria-label="Fermer" onClick={() => { setShowEditModal(false); setTaskToEdit(null); }}>×</button>
              <h2 id="edit-task-modal-title">Modifier</h2>

              <label htmlFor="edit-task-title">Titre</label>
              <input
                id="edit-task-title"
                className={styles.modalInput}
                value={taskToEdit.title || ""}
                onChange={(e) =>
                  setTaskToEdit({ ...taskToEdit, title: e.target.value })
                }
              />

              <label htmlFor="edit-task-description">Description</label>
              <textarea
                id="edit-task-description"
                className={styles.modalTextarea}
                value={taskToEdit.description || ""}
                onChange={(e) =>
                  setTaskToEdit({
                    ...taskToEdit,
                    description: e.target.value,
                  })
                }
              />

              <label htmlFor="edit-task-due">Échéance</label>
              <div className={styles.editDueDateField}>
                <span className={styles.editDueDateText}>
                  {taskToEdit.dueDate
                    ? new Date(taskToEdit.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                    : "Choisir une date"}
                </span>
                <span aria-hidden="true" className={styles.editDueDateIcon} />
                <input
                  id="edit-task-due"
                  type="date"
                  aria-label="Modifier l’échéance"
                  className={styles.editDueDatePicker}
                  value={taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().slice(0, 10) : ""}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, dueDate: e.target.value })}
                />
              </div>

              <label htmlFor="edit-task-assignee-trigger">Assigné à :</label>

              <button
                type="button"
                id="edit-task-assignee-trigger"
                aria-label="Modifier les collaborateurs assignés"
                aria-expanded={showEditAssigneeSelector}
                className={styles.assigneeSelector}
                onClick={() =>
                  setShowEditAssigneeSelector(!showEditAssigneeSelector)
                }
              >
                {editAssignees.length === 0
                  ? "Aucun collaborateur"
                  : `${editAssignees.length} collaborateur${editAssignees.length > 1 ? "s" : ""}`}
              </button>

              {showEditAssigneeSelector && (
                <div id="edit-task-assignees" className={styles.assigneeDropdown}>
                  {assignableUsers.map((user) => (
                    <label key={user.id} className={styles.assigneeOption}>
                      <input
                        type="checkbox"
                        checked={editAssignees.includes(user.id)}
                        onChange={() => {
                          if (editAssignees.includes(user.id)) {
                            setEditAssignees(
                              editAssignees.filter((id) => id !== user.id)
                            );
                          } else {
                            setEditAssignees([...editAssignees, user.id]);
                          }
                        }}
                      />
                      {user.name || user.email}
                    </label>
                  ))}
                </div>
              )}

              <fieldset className={styles.taskStatusFieldset}>
                <legend>Statut :</legend>
                <div className={styles.taskStatusOptions}>
                  {[['TODO', 'À faire'], ['IN_PROGRESS', 'En cours'], ['DONE', 'Terminée']].map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={(taskToEdit.status || 'TODO') === value} className={`${styles.taskStatusOption} ${styles[`taskStatus${value}`]}`} onClick={() => setTaskToEdit({ ...taskToEdit, status: value })}>{label}</button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.modalButtonsRow}>
                <button
                  className={styles.modalPrimaryBtn}
                  onClick={async () => {
                    const body = {
                  title: taskToEdit.title,
                  description: taskToEdit.description,
                  dueDate: taskToEdit.dueDate || null,
                  status: taskToEdit.status,
                  assigneeIds: editAssignees,
                };


                const res = await fetch(
                  `/api/projects/${id}/tasks/${taskToEdit.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  }
                );

                    const data = await res.json();


                const check = await fetch(
                  `/api/projects/${id}/tasks/${taskToEdit.id}`
                );

                const checkData = await check.json();


                if (res.ok) {
                  await reloadTasks(Date.now());
                  setShowEditModal(false);
                  setTaskToEdit(null);
                } else {
                  alert("Erreur lors de la mise à jour de la tâche");
                }
                  }}
                >
                  Enregistrer
                </button>

                <button
                  className={styles.modalSecondaryBtn}
                  onClick={() => {
                    setShowEditModal(false);
                    setTaskToEdit(null);
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODALE ÉDITION PROJET */}
        {showEditProjectModal && (
          <div className={`${styles.modalOverlay} ${styles.projectEditOverlay}`}>
            <div className={`${styles.modalCard} ${styles.projectFormModal}`} role="dialog" aria-modal="true" aria-labelledby="edit-project-modal-title">
              <button type="button" className={styles.modalCloseBtn} aria-label="Fermer" onClick={() => setShowEditProjectModal(false)}>×</button>
              <h2 id="edit-project-modal-title">Modifier un projet</h2>

              <div className={styles.projectFormFields}>
                <div className={styles.projectFormField}>
                  <label htmlFor="edit-project-title">Titre*</label>
                  <input
                    id="edit-project-title"
                    className={styles.modalInput}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.projectFormField}>
                  <label htmlFor="edit-project-description">Description*</label>
                  <textarea
                    id="edit-project-description"
                    className={styles.modalTextarea}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.projectFormField}>
                  <label htmlFor="edit-project-contributor">Contributeur</label>
                  <button
                    id="edit-project-contributor"
                    type="button"
                    className={styles.projectContributorSelector}
                    aria-expanded={showEditProjectContributorSelector}
                    onClick={() => setShowEditProjectContributorSelector((open) => !open)}
                  >
                    {(() => {
                      const count = editMembers.filter((member) => member.role !== "OWNER").length;
                      return count
                        ? `${count} collaborateur${count > 1 ? "s" : ""}`
                        : "Choisir un ou plusieurs collaborateurs";
                    })()}
                  </button>

                  {showEditProjectContributorSelector && (
                    <input
                      id="edit-project-contributor-search"
                      className={`${styles.modalInput} ${styles.projectContributorSearch}`}
                      type="text"
                      placeholder="Rechercher un collaborateur"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      aria-label="Rechercher un collaborateur"
                    />
                  )}

                  {showEditProjectContributorSelector && searchUser.trim().length >= 2 && userResults.length > 0 && (
                    <div className={styles.userResultsList}>
                  {userResults.filter((u) => !editMembers.some((member) => member.user?.id === u.id)).map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      className={styles.userResultItem}
                      onClick={async () => {
                        const res = await fetch(
                          `/api/projects/${id}/contributors`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: u.email }),
                          }
                        );

                        if (res.ok) {
                          await reloadProject();
                          await reloadTasks(Date.now());

                          setSearchUser("");
                          setUserResults([]);
                          setShowEditProjectContributorSelector(false);
                        } else {
                          alert("Erreur lors de l'ajout du contributeur");
                        }
                      }}
                    >
                      {u.name} ({u.email})
                    </button>
                  ))}
                </div>
              )}

                  <p className={styles.currentContributorsTitle}>Contributeurs actuels</p>
                  <div className={styles.contributorsEditList}>
                {editMembers.map((m) => (
                  <div key={m.id} className={styles.contributorEditItem}>
                    <span>{m.user.email}</span>

                    {m.role !== "OWNER" && (
                      
                  <button
                    type="button"
                    className={styles.contributorRemoveBtn}
                    onClick={async () => {

                    try {
                      const res = await fetch(
                        `/api/projects/${id}/contributors/${m.user.id}`,
                        { method: "DELETE" }
                      );

                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        alert(data.error || `Erreur HTTP ${res.status}`);
                        return;
                      }

                      // Mise à jour visuelle immédiate de la liste dans la modale
                      setEditMembers((prev) =>
                        prev.filter((member) => member.user.id !== m.user.id)
                      );

                      // Actualisation globale
                      await reloadProject();
                      await reloadTasks(Date.now());
                          } catch (error) {

                            alert("Impossible de contacter le serveur.");
                          }
                        }}
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalButtonsRow}>
                <button
                  type="button"
                  className={styles.modalPrimaryBtn}
                  disabled={!editTitle.trim() || !editDescription.trim()}
                  onClick={async () => {
                  const body = {
                    name: editTitle,
                    description: editDescription,
                  };

                  const res = await fetch(`/api/projects/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  });

                  if (res.ok) {
                    await reloadProject();
                    await reloadTasks(Date.now());
                    setShowEditProjectModal(false);
                  } else {
                    alert("Erreur lors de la mise à jour du projet");
                  }
                }}
                >
                  Enregistrer
                </button>

                <button
                  className={styles.modalSecondaryBtn}
                  onClick={() => setShowEditProjectModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div> 
    </div>   
  );
}