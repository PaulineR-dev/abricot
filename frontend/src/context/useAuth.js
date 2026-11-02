"use client";

/**
 * Évite de répéter useContext(AuthContext) dans les composants et facilite l'accès aux informations de connexion.
 */

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  // Utilise React.useContext pour récupérer les valeurs du AuthContext
  // (user, login, logout, etc.)
  return useContext(AuthContext);
}