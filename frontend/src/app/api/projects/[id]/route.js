import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

export async function GET(req, context) {
  const { id } = await context.params; // Récupère l'ID du projet depuis l'URL

  const cookieStore = await cookies(); // Accès aux cookies
  const token = cookieStore.get("session")?.value; // Token de session pour l'auth

  // Si pas de token → utilisateur non authentifié
  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Appel backend pour récupérer un projet spécifique
  const res = await fetch(`${API_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    data = await res.json(); // Lecture de la réponse JSON
  } catch {
    // Si le backend renvoie autre chose que du JSON → erreur
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur → on la transmet au frontend
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de récupération du projet" },
      { status: res.status }
    );
  }

  // Succès → renvoie le projet
  return NextResponse.json(data.data.project);
}

export async function PUT(req, context) {
  const { id } = await context.params; // ID du projet à modifier

  const cookieStore = await cookies(); // Récupère les cookies
  const token = cookieStore.get("session")?.value; // Token de session

  // Vérifie l'authentification
  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  const body = await req.json(); // Données envoyées pour la mise à jour

  // Appel backend pour modifier le projet
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`, // Authentification backend
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), // Envoie les modifications
  });

  let data;
  try {
    data = await res.json(); // Lecture JSON
  } catch {
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si erreur backend → renvoie l'erreur
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de mise à jour du projet" },
      { status: res.status }
    );
  }

  // Succès → renvoie le projet mis à jour
  return NextResponse.json(data.data.project);
}

export async function DELETE(req, context) {
  const { id } = await context.params; // ID du projet à supprimer

  const cookieStore = await cookies(); // Cookies utilisateur
  const token = cookieStore.get("session")?.value; // Token de session

  // Vérifie l'authentification
  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Appel backend pour supprimer le projet
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    data = await res.json(); // Lecture JSON
  } catch {
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si erreur backend → renvoie l'erreur
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de suppression du projet" },
      { status: res.status }
    );
  }

  // Succès → projet supprimé
  return NextResponse.json({ success: true });
}