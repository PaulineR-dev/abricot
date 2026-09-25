"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { getProfile } from "@/api/api";

export default function ProfilePage() {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const data = await getProfile(token);
        setUser(data.data.user);
      } catch {
        setUser(null);
      }
    }

    load();
  }, [token]);

  if (!user) return <p>Impossible de charger le profil.</p>;

  return (
    <div>
      <h1>Profil utilisateur</h1>
      <p>Email : {user.email}</p>
      <p>Nom : {user.name}</p>
    </div>
  );
}