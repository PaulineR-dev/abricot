import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

export async function DELETE(req, { params }) {
  // Récupère le token de session (authentification)
  const token = cookies().get("session")?.value;

  // Si pas de token → utilisateur non connecté
  if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Appel au backend pour retirer un contributeur du projet
  const res = await fetch(
    `${API_URL}/projects/${params.id}/contributors/${params.userId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // Lecture de la réponse backend
  const data = await res.json();

  // Si erreur backend → renvoie l’erreur au frontend
  if (!res.ok) return NextResponse.json({ error: data.message }, { status: res.status });

  // Succès → contributeur retiré
  return NextResponse.json({ success: true });
}