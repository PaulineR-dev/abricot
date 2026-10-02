import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

export async function POST(req, { params }) {
  // Récupère le token de session pour authentifier la requête
  const token = cookies().get("session")?.value;

  // Si pas de token → utilisateur non connecté
  if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Contenu de la requête contenant l'email du contributeur à ajouter
  const body = await req.json();

  // Appel au backend pour ajouter un contributeur au projet
  const res = await fetch(`${API_URL}/projects/${params.id}/contributors`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Authentification backend
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), // Envoie l'email du contributeur
  });

  // Lecture de la réponse backend
  const data = await res.json();

  // Si erreur backend → renvoie l'erreur au frontend
  if (!res.ok) return NextResponse.json({ error: data.message }, { status: res.status });

  // Succès → contributeur ajouté
  return NextResponse.json({ success: true });
}