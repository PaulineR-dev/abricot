"use client"; 

import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  // Stocke le token + récupère celui du localStorage au chargement
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  // Connexion : enregistre le token en mémoire + localStorage
  const login = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // Fournit token + login + logout à toute l'application
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}