"use client";

/**
 * Hook raccourci pour accéder à AuthContext sans répéter useContext(AuthContext).
 * Permet de garder les composants plus simples, lisibles et faciles à maintenir.
 */

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  // Utilise React.useContext pour récupérer les valeurs du AuthContext
  // (user, login, logout, etc.)
  return useContext(AuthContext);
}