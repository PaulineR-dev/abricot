"use client";

import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charge le profil automatiquement au démarrage
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      throw new Error(data.error || "Login failed");
    }

    // Le cookie HTTP-only est déjà créé côté serveur
    // On recharge le profil pour remplir user
    const profileRes = await fetch("/api/profile");
    const profileData = await profileRes.json();
    setUser(profileData);

    setLoading(false);
  };

  // Fonction de déconnexion
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
