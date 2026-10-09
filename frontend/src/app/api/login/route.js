import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Route POST — gère la connexion utilisateur
export async function POST(req) {
  const { email, password } = await req.json(); 
  // On récupère les infos envoyées par le formulaire

  const res = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),   // Envoie les identifiants au backend
  });

  let data;
  try {
    // On tente de lire la réponse du backend en JSON
    data = await res.json();
  } catch {
    // Si le backend renvoie autre chose que du JSON : erreur
    return NextResponse.json(
      { error: "Réponse invalide du serveur backend" },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur HTTP : on la transmet au frontend
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de connexion" },
      { status: res.status }
    );
  }

  const token = data.data.token; // Token JWT renvoyé par le backend
  const user = data.data.user;   // Informations utilisateur

  const cookieStore = await cookies();

  // On stocke le token dans un cookie sécurisé
  cookieStore.set({
    name: "session",
    value: token,
    httpOnly: true,   // Protège le cookie contre l'accès JS
    secure: false,    // À mettre sur true en production (HTTPS)
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // Expire dans 7 jours
  });

  // On renvoie les infos utilisateur au frontend
  return NextResponse.json({ user });
}