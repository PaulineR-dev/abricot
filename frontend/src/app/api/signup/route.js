export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
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