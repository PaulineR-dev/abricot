import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// =========================
//        GET PROJECT
// =========================
export async function GET(req, context) {
  const { id } = await context.params; 
  // id = projet à récupérer

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est authentifié
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer un projet
  const res = await fetch(`${API_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const raw = await res.text(); 
  // Le backend peut renvoyer du texte : on lit avant de parser

  let data;
  try {
    // On tente de convertir la réponse en JSON
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
      { error: data.message || "Erreur de récupération du projet" },
      { status: res.status }
    );
  }

  // Renvoie les données du projet
  return NextResponse.json(data.data);
}

// =========================
//        UPDATE PROJECT
// =========================
export async function PUT(req, context) {
  const { id } = await context.params; 
  // id = projet à mettre à jour

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie l'authentification
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json(); 
  // Données de mise à jour envoyées par le frontend

  // Appel backend pour mettre à jour le projet
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text(); 
  // Lecture brute avant tentative de JSON

  let data;
  try {
    // On tente de lire la réponse en JSON
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Réponse backend non JSON", raw },
      { status: 500 }
    );
  }

  // Si erreur backend : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur lors de la mise à jour" },
      { status: res.status }
    );
  }

  // Renvoie le projet mis à jour
  return NextResponse.json(data.data);
}

// =========================
//        DELETE PROJECT
// =========================
export async function DELETE(req, context) {
  const { id } = await context.params; 
  // id = projet à supprimer

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie l'authentification
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour supprimer le projet
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await res.text(); 
  // Lecture brute avant tentative de JSON

  let data;
  try {
    // On tente de lire la réponse en JSON
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Réponse backend non JSON", raw },
      { status: 500 }
    );
  }

  // Si erreur backend : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur lors de la suppression" },
      { status: res.status }
    );
  }

  // Succès : projet supprimé
  return NextResponse.json({ success: true });
}