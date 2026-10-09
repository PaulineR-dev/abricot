import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Récupérer les commentaires d'une tâche
export async function GET(req, context) {
  const { id, taskId } = await context.params;
  // On récupère l'id du projet et l'id de la tâche

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est authentifié
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer les commentaires de la tâche
  const res = await fetch(`${API_URL}/projects/${id}/tasks/${taskId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    // On tente de lire la réponse du backend en JSON
    data = await res.json();
  } catch {
    // Si le backend renvoie autre chose que du JSON : erreur
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de récupération des commentaires" },
      { status: res.status }
    );
  }

  // Renvoie la liste des commentaires
  return NextResponse.json(data.data.comments);
}

// Créer un commentaire sur une tâche
export async function POST(req, context) {
  const { id, taskId } = await context.params;
  // On récupère l'id du projet et de la tâche

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est authentifié
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json(); 
  // Contenu du commentaire envoyé par le frontend

  // Appel backend pour créer un commentaire
  const res = await fetch(`${API_URL}/projects/${id}/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data;
  try {
    // Lecture de la réponse backend
    data = await res.json();
  } catch {
    // Si le backend renvoie autre chose que du JSON : erreur
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur création commentaire" },
      { status: res.status }
    );
  }

  // Renvoie le commentaire créé
  return NextResponse.json(data.data.comment);
}