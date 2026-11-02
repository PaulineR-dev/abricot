import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Récupère les projets et leurs tâches pour l'utilisateur connecté
export async function GET() {
  // Récupère le cookie qui contient la session de l'utilisateur.
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer les projets contenant leurs tâches
  const res = await fetch(`${API_URL}/dashboard/projects-with-tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Récupère la réponse du serveur sous forme de texte.
  const raw = await res.text();

  let data;
  try {
    // On tente de convertir la réponse du backend en JSON
    data = JSON.parse(raw);
  } catch {
    // Si le backend renvoie autre chose que du JSON : erreur
    return NextResponse.json(
      { error: "Réponse backend non JSON", raw },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur HTTP : on la transmet au frontend
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur récupération projets avec tâches" },
      { status: res.status }
    );
  }

  // Envoie au navigateur la liste des projets fournie par le serveur.
  return NextResponse.json(data.data.projects);
}