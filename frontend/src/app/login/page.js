"use client";

import styles from "./login.module.css";
import Image from "next/image";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

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
          
          <Image
            src="/images/logo.png"
            alt="Logo Abricot"
            width={252.568}
            height={32.169}
            className={styles.logo}
          />

          <h1 className={styles.title}>Connexion</h1>

          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.label}>Email</label>

          <input
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className={styles.label}>Mot de passe</label>

          <input
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />

          <button className={styles.button} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className={styles.forgot}>Mot de passe oublié ?</p>

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