"use client";

import styles from "./login.module.css";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      router.push("/profile");
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
          <h1 className={styles.title}>Connexion</h1>

          {/* Erreur */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Label Email */}
          <label className={styles.label}>Email</label>

          {/* Champ Email */}
          <input
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          {/* Label Mot de passe */}
          <label className={styles.label}>Mot de passe</label>

          {/* Champ Mot de passe */}
          <input
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />

          {/* Bouton */}
          <button className={styles.button} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {/* Mot de passe oublié */}
          <p className={styles.forgot}>Mot de passe oublié ?</p>

          {/* Créer un compte */}
          <p className={styles.signup}>
            Pas encore de compte ?
            <span onClick={() => router.push("/signup")}>Créer un compte</span>
          </p>

        </form>
      </div>

      <div className={styles.right}></div>
    </div>
  );
}