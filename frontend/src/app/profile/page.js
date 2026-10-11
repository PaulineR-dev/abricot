"use client";

import { useEffect, useState } from "react";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Impossible de charger le profil");

        const parts = data.name.split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        setUser({ ...data, firstName, lastName });

        setForm({
          firstName,
          lastName,
          email: data.email,
        });

      } catch (err) {
        setError(err.message);
      }
    }

    loadProfile();
  }, []);

  if (error) return <p>{error}</p>;
  if (!user || !form) return <p>Chargement du profil...</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const parts = data.name.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");

      setUser({ ...data, firstName, lastName });

      if (currentPassword && newPassword) {
        const pwdRes = await fetch("/api/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        const pwdData = await pwdRes.json();
        if (!pwdRes.ok) throw new Error(pwdData.error);

        setCurrentPassword("");
        setNewPassword("");
      }

      setSuccess("Informations mises à jour avec succès.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.pageBackground}>
      <div className={styles.profileBlock}>
        <h1 className={styles.title}>Mon compte</h1>

        <h2 className={styles.userName}>
          {user.firstName} {user.lastName}
        </h2>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nom</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Prénom</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              placeholder="•••••••••••"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              placeholder="•••••••••••"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Modifier les informations
          </button>
        </form>
      </div>
    </div>
  );
}