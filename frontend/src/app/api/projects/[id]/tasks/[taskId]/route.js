import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// GET une tâche — récupère les détails d'une tâche précise
export async function GET(req, context) {
  const { id, taskId } = await context.params;
  // id = projet, taskId = tâche

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est authentifié
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer la tâche
  const res = await fetch(`${API_URL}/projects/${id}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    // On tente de lire la réponse en JSON
    data = await res.json();
  } catch {
    // Si le backend renvoie autre chose : erreur
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de récupération de la tâche" },
      { status: res.status }
    );
  }

  // Renvoie la tâche
  return NextResponse.json(data.data.task);
}

// Met à jour une tâche
export async function PUT(req, context) {
  const { id, taskId } = await context.params;
  // id = projet, taskId = tâche

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie l'authentification
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json(); 
  // Données de mise à jour envoyées par le frontend

  // Appel backend pour mettre à jour la tâche
  const res = await fetch(`${API_URL}/projects/${id}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de mise à jour de la tâche" },
      { status: res.status }
    );
  }

  // Renvoie la tâche mise à jour
  return NextResponse.json(data.data.task);
}

// DELETE une tâche
export async function DELETE(req, context) {
  const { id, taskId } = await context.params;
  // id = projet, taskId = tâche

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie l'authentification
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour supprimer la tâche
  const res = await fetch(`${API_URL}/projects/${id}/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    // Lecture de la réponse backend
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si erreur backend : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de suppression de la tâche" },
      { status: res.status }
    );
  }

  // Succès : tâche supprimée
  return NextResponse.json({ success: true });
}