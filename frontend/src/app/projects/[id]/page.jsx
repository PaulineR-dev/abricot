"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectDetail(props) {
  // Récupération de l'ID du projet
  const { id } = use(props.params);
  const router = useRouter();

  // Données du projet et erreurs
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  // États pour la création de tâche
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskStatus, setTaskStatus] = useState("TODO");
  const [taskAssignees, setTaskAssignees] = useState([]);

  // Recherche d’utilisateurs pour assigner une tâche
  const [searchUser, setSearchUser] = useState("");
  const [userResults, setUserResults] = useState([]);

  // États pour l’édition d’une tâche
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [editAssignees, setEditAssignees] = useState([]);

  // États pour afficher les sélecteurs d’assignés
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
  const [showEditAssigneeSelector, setShowEditAssigneeSelector] = useState(false);

  // États pour l’édition du projet
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMembers, setEditMembers] = useState([]);

  // Nouveau commentaire pour une tâche
  const [newComment, setNewComment] = useState({});

  // Charge les informations du projet (titre, description, membres)
  async function reloadProject() {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    setProject(data); // On stocke les données du projet
    setEditMembers(data.project.members); // Pré-remplissage des membres pour l’édition
  }

  // Charge les tâches du projet (avec assignés)
  async function reloadTasks() {
    const res = await fetch(`/api/projects/${id}/tasks`);
    const data = await res.json();

    // On met à jour uniquement la partie "tasks" du projet
    setProject((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        tasks: data, // L’API renvoie déjà data.tasks
      },
    }));
  }

  // Recharge les commentaires d’une tâche spécifique
  async function reloadComments(taskId) {
    const res = await fetch(`/api/projects/${id}/tasks/${taskId}/comments`);
    const comments = await res.json();

    // On remplace les commentaires uniquement pour la tâche concernée
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

  // Charge le projet et les tâches au montage
  useEffect(() => {
    async function load() {
      await reloadProject();   // Charge les informations du projet
      await reloadTasks();     // Charge les tâches avec assignés
    }
    load();
  }, [id]);

  // Rôles de l’utilisateur dans le projet
  const isOwner = project?.project?.userRole === "ADMIN";
  const isMember = project?.project?.userRole === "MEMBER";

  // Recherche d’utilisateurs (assignation de tâches)
  useEffect(() => {
    if (searchUser.trim().length < 2) {
      setUserResults([]);
      return;
    }

    async function search() {
      const res = await fetch(`/api/users?query=${searchUser}`);
      const data = await res.json();

      if (res.ok) {
        setUserResults(data);
      }
    }

    search();
  }, [searchUser]);

  // États de chargement / erreur
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!project) return <p>Chargement...</p>;

  // Ancienne fonction toggle
  // const toggleAssignee = (userId, current, setter) => {
  //   if (current.includes(userId)) {
  //     setter(current.filter((id) => id !== userId));
  //   } else {
  //     setter([...current, userId]);
  //   }
  // };

return (
  <div style={{ padding: "20px" }}>
    {/* HEADER PROJET */}
    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
      <h1 style={{ margin: 0 }}>{project.project.name}</h1>

      {isOwner && (
        <>
          <button
            onClick={() => {
              setEditTitle(project.project.name);
              setEditDescription(project.project.description);
              setEditMembers(project.project.members);
              setShowEditProjectModal(true);
            }}
            style={{
              padding: "8px 14px",
              background: "red",
              color: "white",
              borderRadius: "5px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            modifier le projet
          </button>

          <button
            onClick={async () => {
              if (!confirm("Supprimer ce projet ?")) return;
              const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
              if (res.ok) router.push("/projects");
              else alert("Erreur lors de la suppression du projet");
            }}
            style={{
              padding: "8px 14px",
              background: "#b00000",
              color: "white",
              borderRadius: "5px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            supprimer le projet
          </button>
        </>
      )}
    </div>

    <p>{project.project.description}</p>

    {/* PROPRIÉTAIRE */}
    <div style={{ marginTop: "20px" }}>
      <h3>Propriétaire</h3>
      <p>{project.project.owner.email}</p>
    </div>

    {/* CONTRIBUTEURS */}
    <div style={{ marginTop: "20px" }}>
      <h3>Contributeurs</h3>
      <ul style={{ paddingLeft: "20px" }}>
        {project.project.members.map((m) => (
          <li key={m.id}>
            {m.user.email} — <strong>{m.role}</strong>
          </li>
        ))}
      </ul>
    </div>

    {/* TÂCHES */}
    <div style={{ marginTop: "30px" }}>
      <h3>Tâches ({project.project.tasks.length})</h3>

      {(isOwner || isMember) && (
        <button
          onClick={() => {
            setTaskTitle("");
            setTaskDescription("");
            setTaskDue("");
            setTaskStatus("TODO");
            setTaskAssignees([]);
            setShowTaskModal(true);
          }}
          style={{
            padding: "10px 15px",
            background: "black",
            color: "white",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          + Nouvelle tâche
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {project.project.tasks.map((task) => (
          <div
            key={task.id}
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <h4>{task.title}</h4>
            <p>{task.description}</p>

            <p>
              <strong>Status :</strong> {task.status}
            </p>

            <p>
              <strong>Échéance :</strong>{" "}
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "Aucune"}
            </p>

            {/* ASSIGNÉS */}
            <p>
              <strong>Assignée à :</strong>{" "}
              {task.assignees && task.assignees.length > 0
                ? task.assignees
                    .map((a) => a.user.name || a.user.email)
                    .join(", ")
                : "Aucun collaborateur"}
            </p>

            {/* COMMENTAIRES */}
            <div style={{ marginTop: "10px" }}>
              <strong>Commentaires :</strong>
              {task.comments && task.comments.length > 0 ? (
                <ul style={{ paddingLeft: "20px" }}>
                  {task.comments.map((c) => (
                    <li key={c.id}>
                      <em>{c.author.email}</em> : {c.content}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontStyle: "italic" }}>Aucun commentaire.</p>
              )}

              {(isOwner || isMember) && (
                <div style={{ marginTop: "8px" }}>
                  <textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment[task.id] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [task.id]: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <button
                    onClick={async () => {
                      const content = String(newComment[task.id] || "").trim();
                      if (!content) return;

                      const res = await fetch(
                        `/api/projects/${id}/tasks/${task.id}/comments`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ content }),
                        }
                      );

                      if (res.ok) {
                        setNewComment((prev) => ({ ...prev, [task.id]: "" }));
                        await reloadComments(task.id);
                      } else {
                        alert("Erreur lors de l'ajout du commentaire");
                      }
                    }}
                  >
                    Ajouter un commentaire
                  </button>
                </div>
              )}
            </div>

            {(isOwner || isMember) && (
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setTaskToEdit(task);
                    setEditAssignees(
                      task.assignees
                        ? task.assignees.map((a) => a.user.id)
                        : []
                    );
                    setShowEditModal(true);
                  }}
                  style={{
                    padding: "8px 12px",
                    background: "#444",
                    color: "white",
                    borderRadius: "5px",
                  }}
                >
                  Modifier
                </button>

                {isOwner && (
                  <button
                    onClick={async () => {
                      if (!confirm("Supprimer cette tâche ?")) return;
                      const res = await fetch(
                        `/api/projects/${id}/tasks/${task.id}`,
                        { method: "DELETE" }
                      );
                      if (res.ok) {
                        await reloadTasks();
                      } else {
                        alert("Erreur lors de la suppression de la tâche");
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      background: "#b00000",
                      color: "white",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* MODALE CRÉATION TÂCHE */}
    {showTaskModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "10px",
            width: "450px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <h2>Nouvelle tâche</h2>

          <label>Titre*</label>
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <label>Description</label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <label>Échéance</label>
          <input
            type="date"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
            <label>Statut</label>
            <select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminée</option>
            </select>

            <label>Assigner à :</label>

            <div
              onClick={() => setShowAssigneeSelector(!showAssigneeSelector)}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                background: "#f9f9f9",
              }}
            >
              {taskAssignees.length === 0
                ? "Choisir un ou plusieurs collaborateurs"
                : taskAssignees.map((u) => u.name || u.email).join(", ")}
            </div>

            {showAssigneeSelector && (
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  background: "white",
                  padding: "10px",
                  marginTop: "5px",
                }}
              >
                {project.project.members.map((m) => (
                  <label
                    key={m.user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={taskAssignees.some((u) => u.id === m.user.id)}
                      onChange={() => {
                        if (taskAssignees.some((u) => u.id === m.user.id)) {
                          setTaskAssignees(
                            taskAssignees.filter((u) => u.id !== m.user.id)
                          );
                        } else {
                          setTaskAssignees([...taskAssignees, m.user]);
                        }
                      }}
                    />
                    {m.user.name || m.user.email}
                  </label>
                ))}
              </div>
            )}

            <button
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

                if (res.ok) {
                  await reloadTasks();
                  setShowTaskModal(false);
                } else {
                  alert("Erreur lors de la création de la tâche");
                }
              }}
              style={{
                padding: "10px",
                background: "black",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Enregistrer
            </button>

            <button
              onClick={() => setShowTaskModal(false)}
              style={{
                padding: "10px",
                background: "#ccc",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODALE ÉDITION TÂCHE */}
      {showEditModal && taskToEdit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              width: "450px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <h2>Modifier une tâche</h2>

            <label>Titre*</label>
            <input
              defaultValue={taskToEdit.title}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, title: e.target.value })
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

            <label>Description</label>
            <textarea
              defaultValue={taskToEdit.description}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, description: e.target.value })
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

            <label>Échéance</label>
            <input
              type="date"
              defaultValue={
                taskToEdit.dueDate
                  ? new Date(taskToEdit.dueDate).toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, dueDate: e.target.value })
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

            <label>Statut</label>
            <select
              defaultValue={taskToEdit.status}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, status: e.target.value })
              }
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminée</option>
            </select>

            <label>Assigner à :</label>

            <div
              onClick={() => setShowEditAssigneeSelector(!showEditAssigneeSelector)}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                background: "#f9f9f9",
              }}
            >
              {editAssignees.length === 0
                ? "Choisir un ou plusieurs collaborateurs"
                : project.project.members
                    .filter((m) => editAssignees.includes(m.user.id))
                    .map((m) => m.user.name || m.user.email)
                    .join(", ")}
            </div>

            {showEditAssigneeSelector && (
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  background: "white",
                  padding: "10px",
                  marginTop: "5px",
                }}
              >
                {project.project.members.map((m) => (
                  <label
                    key={m.user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editAssignees.includes(m.user.id)}
                      onChange={() => {
                        if (editAssignees.includes(m.user.id)) {
                          setEditAssignees(
                            editAssignees.filter((id) => id !== m.user.id)
                          );
                        } else {
                          setEditAssignees([...editAssignees, m.user.id]);
                        }
                      }}
                    />
                    {m.user.name || m.user.email}
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={async () => {
                const body = {
                  title: taskToEdit.title,
                  description: taskToEdit.description,
                  dueDate: taskToEdit.dueDate || null,
                  status: taskToEdit.status,
                  assigneeIds: Array.isArray(editAssignees) ? editAssignees : [],
                };

                const res = await fetch(`/api/projects/${id}/tasks/${taskToEdit.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });

                if (res.ok) {
                  await reloadTasks();
                  setShowEditModal(false);
                  setTaskToEdit(null);
                } else {
                  alert("Erreur lors de la mise à jour de la tâche");
                }
              }}
              style={{
                padding: "10px",
                background: "black",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Enregistrer
            </button>

            <button
              onClick={() => {
                setShowEditModal(false);
                setTaskToEdit(null);
              }}
              style={{
                padding: "10px",
                background: "#ccc",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}


      {/* MODALE PROJET (déjà existante) */}
      {showEditProjectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              width: "450px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <h2>Modifier un projet</h2>

            <label>Titre*</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

            <label>Description*</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

            <label>Ajouter un contributeur</label>
            <input
              type="text"
              placeholder="Tape un nom ou email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

            {userResults.length > 0 && (
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  background: "#fff",
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                {userResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={async () => {
                      const res = await fetch(`/api/projects/${id}/contributors`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: u.email }),
                      });

                      if (res.ok) {
                        await reloadProject();
                        setSearchUser("");
                        setUserResults([]);
                      } else {
                        alert("Erreur lors de l'ajout du contributeur");
                      }
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

            <label>Contributeurs actuels</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {editMembers.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                >
                  <span>{m.user.email}</span>

                  {m.role !== "OWNER" && (
                    <button
                      onClick={async () => {
                        const res = await fetch(
                          `/api/projects/${id}/contributors/${m.user.id}`,
                          { method: "DELETE" }
                        );

                        if (res.ok) {
                          await reloadProject();
                        } else {
                          alert("Erreur lors du retrait du contributeur");
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        background: "#b00000",
                        color: "white",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                const res = await fetch(`/api/projects/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: editTitle,
                    description: editDescription,
                  }),
                });

                if (res.ok) {
                  await reloadProject();
                  setShowEditProjectModal(false);
                } else {
                  alert("Erreur lors de la mise à jour");
                }
              }}
              style={{
                padding: "10px",
                background: "black",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Enregistrer
            </button>

            <button
              onClick={() => setShowEditProjectModal(false)}
              style={{
                padding: "10px",
                background: "#ccc",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}