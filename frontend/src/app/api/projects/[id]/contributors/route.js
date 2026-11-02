import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Cette route ajoute une personne a un projet.
export async function POST(req, context) {
  const { id } = await context.params;
  // On récupère l'id du projet depuis l'URL

  // Récupère le cookie qui contient la session de l'utilisateur.
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  const body = await req.json(); 
  // Recupere l'adresse e-mail de la personne à ajouter au projet.

  // Demande au serveur d'ajouter cette personne au projet.
  const res = await fetch(`${API_URL}/projects/${id}/contributors`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Envoie la session pour identifier l'utilisateur.
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // Convertit la réponse du serveur en données que le programme peut lire.
  const data = await res.json(); 

  // Si le serveur signale une erreur, la renvoie au navigateur.
  if (!res.ok) {
    return NextResponse.json({ error: data.message }, { status: res.status });
  }

  // Confirme au navigateur que le contributeur a bien été ajouté.
  return NextResponse.json({ success: true });
}