"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function Sidebar() {
  const { user, loading } = useContext(AuthContext);

  return (
    <aside style={{ padding: "20px", background: "#ddd" }}>
      <h3>Menu</h3>

      {loading ? (
        <p>Chargement...</p>
      ) : user ? (
        <ul>
          <li>Mes projets</li>
          <li>Mes tâches</li>
          <li>Mon profil</li>
        </ul>
      ) : (
        <p>Veuillez vous connecter</p>
      )}
    </aside>
  );
}
