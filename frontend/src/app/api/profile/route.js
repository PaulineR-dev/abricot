import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Récupère le profil de l'utilisateur connecté
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour récupérer les informations du profil
  const res = await fetch("http://localhost:8000/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
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

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur de profil" },
      { status: res.status }
    );
  }

  // Renvoie les informations utilisateur
  return NextResponse.json(data.data.user);
}

// Route PUT pour mettre à jour les informations du profil
export async function PUT(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const name = `${body.firstName} ${body.lastName}`.trim(); 
  // On reconstruit le champ "name" attendu par le backend

  // Appel backend pour mettre à jour le profil
  const res = await fetch("http://localhost:8000/auth/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email: body.email,
    }),
  });

  let data;
  try {
    // Lecture de la réponse backend
    data = await res.json();
  } catch {
    // Si le backend renvoie autre chose que du JSON : erreur
    return NextResponse.json(
      { error: "Réponse invalide du backend" },
      { status: 500 }
    );
  }

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur lors de la mise à jour" },
      { status: res.status }
    );
  }

  // Renvoie le profil mis à jour
  return NextResponse.json(data.data.user);
}