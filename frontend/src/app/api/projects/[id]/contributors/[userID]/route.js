import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

export async function DELETE(req, context) {
  try {
    // 1. Récupérer les paramètres de l'URL dynamiques
    const params = await context.params;
    const id = params?.id;
    const userId = params?.userId;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Paramètres manquants (id du projet ou userId)" },
        { status: 400 }
      );
    }

    // 2. Récupérer le token de session dans les cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 3. Appeler le back-end Express
    // Prépare l'adresse du projet et du membre à supprimer.
    const backendUrl = `${API_URL}/projects/${id}/contributors/${userId}`;
    const res = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Récupère le message renvoyé par le serveur après la suppression.
    const raw = await res.text();
    // res contient la réponse HTTP du backend ; text() récupère son contenu sous forme de texte.
    let data = {};
    try {
      // Si le texte est au format JSON, le convertit en objet pour accéder à ses informations.
      data = raw ? JSON.parse(raw) : {};
    } catch {
      // Si ce n'est pas du JSON, garde le texte comme message d'erreur.
      data = { message: raw };
    }

    // Si le serveur signale une erreur, la renvoie au navigateur.
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Erreur lors de la suppression" },
        { status: res.status }
      );
    }

    // Confirme au navigateur que la suppression a réussi.
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne du serveur Next.js" },
      { status: 500 }
    );
  }
}