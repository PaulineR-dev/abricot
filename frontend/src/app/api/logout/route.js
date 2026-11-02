import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Récupère les cookies pour pouvoir supprimer la session.
  const cookieStore = await cookies();
  cookieStore.set({
    name: "session", // nom du cookie à supprimer
    value: "", // vide le contenu
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Limite l'envoi du cookie depuis d'autres sites.
    path: "/",
    maxAge: 0, // 0 = suppression immédiate
  });

  // Renvoie une réponse simple au front pour confirmer la déconnexion
  return NextResponse.json({ message: "Déconnecté" });
}