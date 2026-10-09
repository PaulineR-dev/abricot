"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function Header() {
  const { user, loading } = useContext(AuthContext);

  return (
    <header style={{ padding: "20px", background: "#eee" }}>
      {loading ? (
        <p>Chargement...</p>
      ) : user ? (
        <p>Connecté en tant que : {user.email}</p>
      ) : (
        <p>Non connecté</p>
      )}
    </header>
  );
}
