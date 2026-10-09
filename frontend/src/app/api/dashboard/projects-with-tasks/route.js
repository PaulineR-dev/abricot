import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Récupère les projets et leurs tâches pour l'utilisateur connecté
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est bien authentifié via le cookie "session"
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer les projets contenant leurs tâches
  const res = await fetch(`${API_URL}/dashboard/projects-with-tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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

  return NextResponse.json(data.data.projects);
}