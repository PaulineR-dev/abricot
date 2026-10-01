import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // Récupère le cookie "session" (qui contient le token JWT)
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Si aucun token → l'utilisateur n'est pas connecté
  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Appelle le backend pour récupérer le profil en envoyant le token dans le header Authorization
  const res = await fetch("http://localhost:8000/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Essaye de lire la réponse JSON du backend
  let data;
  try {
    data = await res.json();
  } catch {
    // Si le backend renvoie autre chose que du JSON → erreur
    return NextResponse.json(
      { error: "Réponse invalide du serveur backend" },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur → on la transmet au front
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de profil" },
      { status: res.status }
    );
  }

  // Renvoie uniquement l'objet user au front
  return NextResponse.json(data.data.user);
}