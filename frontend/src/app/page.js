import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/login");
  }

  let isAuthenticated = false;

  try {
    const response = await fetch("http://localhost:8000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    isAuthenticated = response.ok;
  } catch {
    isAuthenticated = false;
  }

  redirect(isAuthenticated ? "/profile" : "/login");
}