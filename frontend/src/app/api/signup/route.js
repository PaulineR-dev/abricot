export async function POST(req) {
  try {
    // Lit les informations saisies dans le formulaire de création de compte.
    const body = await req.json();

    // Envoie ces informations au serveur pour créer le compte.
    const res = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Récupère le résultat renvoyé par le serveur.
    const data = await res.json();

    // Renvoie le résultat au formulaire avec le statut du serveur.
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Signale une erreur inattendue lors de la création du compte.
    console.error("Erreur API signup:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erreur interne API signup",
      }),
      { status: 500 }
    );
  }
}