import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

// Route pour retirer un contributeur d'un projet
export async function DELETE(req, context) {
  const { id, userId } = await context.params;
  // On récupère l'id du projet et l'id du contributeur à retirer

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Vérifie que l'utilisateur est authentifié
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Appel backend pour retirer le contributeur du projet
  const res = await fetch(`${API_URL}/projects/${id}/contributors/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({})); 
  // On tente de lire la réponse, sinon on renvoie un objet vide

  // Si le backend renvoie une erreur : on la transmet
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Erreur backend lors du retrait" },
      { status: res.status }
    );
  }

  // Succès : contributeur retiré
  return NextResponse.json({ success: true });
}
