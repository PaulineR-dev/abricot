"use client";

import { createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Charge le profil automatiquement au démarrage
  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") {
      setUser(null);
      setLoading(false);
      return;
    }

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

  // Fonction de connexion
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

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}