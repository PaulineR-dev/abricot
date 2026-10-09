import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Route pour ajouter un contributeur à un projet
export async function POST(req, context) {
  const { id } = await context.params;
  // On récupère l'id du projet depuis l'URL

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  const body = await req.json(); 
  // Données envoyées par le frontend (email du contributeur)

  // Appel backend pour ajouter un contributeur au projet
  const res = await fetch(`${API_URL}/projects/${id}/contributors`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Authentification
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json(); // Lecture de la réponse backend

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json({ error: data.message }, { status: res.status });
  }

  // Succès : contributeur ajouté
  return NextResponse.json({ success: true });
}