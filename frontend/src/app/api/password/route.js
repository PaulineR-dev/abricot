import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Route pour changement de mot de passe
export async function PUT(req) {
  // Récupère les cookies pour retrouver la session de l'utilisateur.
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Lit les mots de passe envoyés par le formulaire.
  const body = await req.json(); 
  // On récupère l'ancien et le nouveau mot de passe envoyés par le frontend

  // Envoie les deux mots de passe au serveur pour effectuer le changement.
  const res = await fetch("http://localhost:8000/auth/password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    }),
  });

  const data = await res.json(); // Lecture de la réponse backend

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur lors du changement de mot de passe" },
      { status: res.status }
    );
  }

  // Succès : mot de passe modifié
  return NextResponse.json({ success: true });
}