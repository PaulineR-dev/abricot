import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

export async function GET() {
  // Récupère le cookie de session (authentification)
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Si pas de token → utilisateur non connecté
  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Appel backend pour récupérer tous les projets
  const res = await fetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    data = await res.json(); // Lecture JSON
  } catch {
    // Backend a renvoyé autre chose que du JSON
    return NextResponse.json(
      { error: "Réponse invalide du serveur backend" },
      { status: 500 }
    );
  }

  // Si erreur backend → renvoie l’erreur au frontend
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de récupération des projets" },
      { status: res.status }
    );
  }

  // Succès → renvoie la liste des projets
  return NextResponse.json(data.data.projects);
}

export async function POST(req) {
  // Récupère le token de session
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie l’authentification
  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Corps de la requête contenant les données du projet
  const body = await req.json();

  // Appel backend pour créer un nouveau projet
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Auth backend
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), // Envoie les données du projet
  });

  let data;
  try {
    data = await res.json(); // Lecture JSON
  } catch {
    return NextResponse.json(
      { error: "Réponse invalide du serveur backend" },
      { status: 500 }
    );
  }

  // Si erreur backend → renvoie l’erreur
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de création du projet" },
      { status: res.status }
    );
  }

  // Succès → renvoie le projet créé
  return NextResponse.json(data.data.project);
}