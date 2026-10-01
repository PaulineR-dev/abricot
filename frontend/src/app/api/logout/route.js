import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Accède au gestionnaire de cookies de Next.js (API async)
  // Supprime le cookie "session"
  cookies().set({
    name: "session", // nom du cookie à supprimer
    value: "",       // vide le contenu
    path: "/",       // même chemin que lors de la création
    maxAge: 0,       // 0 = suppression immédiate
  });

  // Renvoie une réponse simple au front pour confirmer la déconnexion
  return NextResponse.json({ message: "Déconnecté" });
}