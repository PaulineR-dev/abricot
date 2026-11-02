import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Récupère les tâches assignées à l'utilisateur connecté
export async function GET() {
  // Lit le cookie de session transmis par le navigateur.
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer les tâches assignées
  const res = await fetch(`${API_URL}/dashboard/assigned-tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Récupère la réponse du serveur sous forme de texte, pour pouvoir la lire ensuite.
  const raw = await res.text();

  let data;
  try {
    // Convertit la réponse du serveur en JSON
    data = JSON.parse(raw);
  } catch {
    // Gestion d'erreur si le backend renvoie autre chose que du JSON
    return NextResponse.json(
      { error: "Réponse backend non JSON", raw },
      { status: 500 }
    );
  }

  // Gestion des erreurs backend
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur récupération tâches assignées" },
      { status: res.status }
    );
  }

  // Renvoie uniquement la liste des tâches contenue dans la réponse backend.
  return NextResponse.json(data.data.tasks);
}