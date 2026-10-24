import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Vous devez être connecté pour générer des tâches." }, { status: 401 });
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "La génération IA n'est pas configurée : ajoutez MISTRAL_API_KEY au serveur frontend." }, { status: 503 });
  }

  let prompt;
  try {
    ({ prompt } = await request.json());
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 4000) {
    return NextResponse.json({ error: "La description doit contenir entre 1 et 4 000 caractères." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Tu aides à planifier un projet. À partir de la demande, propose exactement trois tâches concrètes, distinctes et pertinentes. Réponds uniquement en JSON valide sous la forme {\"tasks\":[{\"title\":\"...\",\"description\":\"...\"},{\"title\":\"...\",\"description\":\"...\"},{\"title\":\"...\",\"description\":\"...\"}]}. Chaque titre doit être court et chaque description préciser le travail attendu. N'ajoute aucun autre champ ni texte autour du JSON."
          },
          { role: "user", content: prompt.trim() },
        ],
      }),
      cache: "no-store",
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Mistral task generation failed:", response.status, result);
      return NextResponse.json({ error: "Mistral n'a pas pu générer les propositions. Réessayez." }, { status: 502 });
    }

    const content = result.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    const tasks = Array.isArray(parsed?.tasks)
      ? parsed.tasks.slice(0, 3).map((task) => ({
          title: typeof task.title === "string" ? task.title.trim().slice(0, 160) : "",
          description: typeof task.description === "string" ? task.description.trim().slice(0, 2000) : "",
        })).filter((task) => task.title && task.description)
      : [];

    if (tasks.length !== 3) {
      return NextResponse.json({ error: "Les propositions générées sont incomplètes. Essayez une autre description." }, { status: 502 });
    }
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Mistral task generation error:", error);
    return NextResponse.json({ error: "Impossible de contacter Mistral pour le moment." }, { status: 502 });
  }
}