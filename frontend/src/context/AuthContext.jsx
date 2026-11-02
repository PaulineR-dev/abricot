"use client";

import { createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Partage les informations et actions de connexion avec les composants de l'application.
export const AuthContext = createContext();

// Fournit les informations de connexion aux pages affichées dans children.
export function AuthProvider({ children }) {
  // Mémorise l'utilisateur connecté et indique si son profil est en cours de chargement.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Vérifie la session et charge le profil à chaque changement de page.
  useEffect(() => {
    // Les pages de connexion et de création de compte ne nécessitent pas de profil.
    if (pathname === "/login" || pathname === "/signup") {
      setUser(null);
      setLoading(false);
      return;
    }

    // Demande au serveur les informations du profil connecté.
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
  }, [pathname]);

  // Envoie les identifiants, puis charge le profil si la connexion réussit.
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la connexion.");

      // Récupère les informations du compte qui vient de se connecter.
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error || "Impossible de charger le profil.");
      setUser(profileData);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Ferme la session sur le serveur et vide les informations du profil.
  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  // Met à jour le profil partagé après une modification du compte.
  const updateUser = (updatedUser) => setUser(updatedUser);

  // Rend ces informations et actions disponibles aux composants enfants.
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}