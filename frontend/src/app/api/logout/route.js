import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "session", // nom du cookie à supprimer
    value: "",       // vide le contenu
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",       // même chemin que lors de la création
    maxAge: 0,       // 0 = suppression immédiate
  });

  // Renvoie une réponse simple au front pour confirmer la déconnexion
  return NextResponse.json({ message: "Déconnecté" });
}
