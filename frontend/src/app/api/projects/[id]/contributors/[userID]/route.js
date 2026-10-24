import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://localhost:8000";

export async function DELETE(req, context) {
  try {
    // 1. Récupérer proprement les paramètres de l'URL dynamiques
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
    const backendUrl = `${API_URL}/projects/${id}/contributors/${userId}`;
    const res = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const raw = await res.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { message: raw };
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Erreur lors de la suppression" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne du serveur Next.js" },
      { status: 500 }
    );
  }
}