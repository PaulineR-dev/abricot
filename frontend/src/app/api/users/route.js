import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

export async function GET(req) {
  // Recupere le cookie qui contient la session de l'utilisateur.
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est authentifié
  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Récupère le paramètre de recherche dans l'URL
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  // Le backend exige un paramètre "query" non vide
  if (!query || query.trim() === "") {
    return NextResponse.json(
      { error: "Paramètre de recherche requis" },
      { status: 400 }
    );
  }

  // Envoie le texte recherche au serveur pour trouver des utilisateurs.
  const res = await fetch(`${API_URL}/users/search?query=${query}`, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });

  const data = await res.json(); // Convertit la reponse du serveur en donnees utilisables.

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de recherche" },
      { status: res.status }
    );
  }

  // Envoie au navigateur la liste des utilisateurs trouves.
  return NextResponse.json(data.data.users);
}