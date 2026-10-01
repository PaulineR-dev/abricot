"use client";

import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Stocke les infos utilisateur (null si non connecté)
  const [user, setUser] = useState(null);

  // Indique si une action de login est en cours
  const [loading, setLoading] = useState(false);

  // Fonction de connexion : appelle /api/login
  const login = async (email, password) => {
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // Si erreur → on arrête et on remonte l'erreur
    if (!res.ok) {
      setLoading(false);
      throw new Error(data.error || "Login failed");
    }

    // Si OK → on stocke l'utilisateur dans le contexte
    setUser(data.user);
    setLoading(false);
  };

  // Fonction de déconnexion : appelle /api/logout
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null); // Supprime l'utilisateur du contexte
  };

  // Fournit les valeurs à tous les composants enfants
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}