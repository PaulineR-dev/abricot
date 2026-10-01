import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  // Récupère les données envoyées par le formulaire (email + password)
  const { email, password } = await req.json();

  // Envoie la requête de connexion au backend
  const res = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
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

  // Si la connexion échoue → renvoie l'erreur au front
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de connexion" },
      { status: res.status }
    );
  }

  // Récupère le token et les informations utilisateur renvoyés par le backend
  const token = data.data.token;
  const user = data.data.user;

  // Accède au gestionnaire de cookies de Next.js (API async)
  const cookieStore = await cookies();

  // Stocke le token dans un cookie HTTP-only sécurisé
  cookieStore.set({
    name: "session",      // nom du cookie
    value: token,         // contenu = token JWT
    httpOnly: true,       // inaccessible depuis le JavaScript du navigateur
    secure: false,        // true en production (HTTPS)
    sameSite: "lax",      // évite les problèmes de navigation
    path: "/",            // cookie disponible sur tout le site
    maxAge: 60 * 60 * 24 * 7, // expire dans 7 jours
  });

  // Renvoie les infos utilisateur au front (sans le token)
  return NextResponse.json({ user });
}