import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

/* ============================
      GET — LISTE DES TÂCHES
   ============================ */
export async function GET(req, context) {
  const { id } = await context.params; 
  // id = projet dont on veut récupérer les tâches

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est authentifié
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer toutes les tâches du projet
  const res = await fetch(`${API_URL}/projects/${id}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const raw = await res.text(); 

  let data;
  try {
    // On essaie de convertir la réponse en JSON
    data = JSON.parse(raw);
  } catch {
    // Si ce n'est pas du JSON : erreur
    return NextResponse.json(
      { error: "Réponse backend non JSON", raw },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur récupération tâches" },
      { status: res.status }
    );
  }

  return NextResponse.json(data.data.tasks, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

/* ============================
      POST — CRÉER UNE TÂCHE
   ============================ */
export async function POST(req, context) {
  const { id } = await context.params; 

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie l'authentification
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json(); 

  // Appel backend pour créer la tâche
  const res = await fetch(`${API_URL}/projects/${id}/tasks`, {
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
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si erreur backend : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur création tâche" },
      { status: res.status }
    );
  }

  // Renvoie la tâche créée
  return NextResponse.json(data.data.task);
}