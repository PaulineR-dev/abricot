"use client";

import { NextResponse } from "next/server";

export function middleware(req) {
  // Récupère le token stocké dans le cookie "session"
  const token = req.cookies.get("session")?.value;

  // Liste des routes qui nécessitent d'être connecté
  const protectedRoutes = ["/profile", "/dashboard", "/projects"];

  // Vérifie si l'URL demandée commence par une route protégée
  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Si la route est protégée et qu'il n'y a pas de token → redirection vers /login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Sinon, on laisse passer la requête normalement
  return NextResponse.next();
}