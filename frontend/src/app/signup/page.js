"use client";

import styles from "./signup.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
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
            width={252.568}
            height={32.169}
            className={styles.logo}
          />

          {/* Titre */}
          <h1 className={styles.title}>Inscription</h1>

          {/* Erreur */}
          {error && <p className={styles.error} role="alert">{error}</p>}

          {/* Label Nom */}
          <label className={styles.label} htmlFor="signup-name">Nom</label>
          <input
            id="signup-name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom"
            autoComplete="name"
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