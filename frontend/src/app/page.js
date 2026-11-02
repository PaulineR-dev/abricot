import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Verifie la session a l'arrivee sur le site et redirige vers la bonne page.
export default async function HomePage() {
  // Lit le cookie de session enregistre dans le navigateur.
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // Sans session, envoie directement l'utilisateur vers la connexion.
  if (!token) {
    redirect("/login");
  }

  // Part du principe que la session est invalide jusqu'à confirmation du serveur.
  let isAuthenticated = false;

  try {
    const response = await fetch("http://localhost:8000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // Demande une réponse récente au backend, sans réutiliser une ancienne réponse.
    });
    // Une réponse sans erreur signifie que la session est valide.
    isAuthenticated = response.ok;
  } catch {
    isAuthenticated = false;
  }

  // Ouvre le profil si la session est valide, sinon retourne a la connexion.
  redirect(isAuthenticated ? "/profile" : "/login");
}