"use client";

import styles from "./signup.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Affiche le formulaire et gère la création d'un compte utilisateur.
export default function SignupPage() {
  // Permet de rediriger vers la page de connexion après l'inscription.
  const router = useRouter();
  // Mémorise les champs du formulaire, le message d'erreur et le chargement.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Envoie les informations saisies pour créer le compte.
  async function handleSubmit(e) {
    // Empêche le formulaire de recharger la page.
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Réunit le prénom et le nom dans le champ attendu par le serveur.
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      // Envoie le nom, l'adresse e-mail et le mot de passe au serveur.
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Après la création du compte, ouvre la page de connexion.
      router.push("/login");
    } catch (err) {
      // Affiche le message si la création du compte échoue.
      setError(err.message);
    } finally {
      // Réactive le bouton lorsque la tentative est terminée.
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <form onSubmit={handleSubmit} className={styles.container}>
          
          {/* Logo */}
          <Image
            src="/images/logo.png"
            alt="Logo Abricot"
            loading="eager"
            width={252.568}
            height={32.169}
            className={styles.logo}
          />

          {/* Titre */}
          <h1 className={styles.title}>Inscription</h1>

          {/* Erreur */}
          {error && <p className={styles.error} role="alert">{error}</p>}

          {/* Nom et prénom */}
          <label className={styles.label} htmlFor="signup-last-name">Nom</label>
          <input
            id="signup-last-name"
            className={styles.input}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nom"
            autoComplete="family-name"
            required
          />

          <label className={styles.label} htmlFor="signup-first-name">Prénom</label>
          <input
            id="signup-first-name"
            className={styles.input}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Prénom"
            autoComplete="given-name"
            required
          />

          {/* Label Email */}
          <label className={styles.label} htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />

          {/* Label Mot de passe */}
          <label className={styles.label} htmlFor="signup-password">Mot de passe</label>
          <input
            id="signup-password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            type="password"
            autoComplete="new-password"
          />

          {/* Bouton */}
          <button className={styles.button} disabled={loading}>
            {loading ? "Création..." : "S'inscrire"}
          </button>

          {/* Déjà inscrit ? */}
          <p className={styles.signup}>
            Déjà inscrit ?
            <Link href="/login">Se connecter</Link>
          </p>

        </form>
      </div>

      <div className={styles.right}></div>
    </div>
  );
}