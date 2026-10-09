import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Récupère les tâches assignées à l'utilisateur connecté
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérification d'authentification via le cookie "session"
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer les tâches assignées
  const res = await fetch(`${API_URL}/dashboard/assigned-tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const raw = await res.text();

  let data;
  try {
    // Le backend renvoie du texte, donc on essaie juste de le transformer en JSON
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

  return NextResponse.json(data.data.tasks);
}