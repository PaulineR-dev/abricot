"use client";

import { useEffect, useState } from "react";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import styles from "./profile.module.css";

// Affiche le profil et gère la modification des informations du compte.
export default function ProfilePage() {
  // Récupère les actions communes pour actualiser le profil et fermer la session.
  const { updateUser, logout } = useContext(AuthContext);
  const router = useRouter();
  // Stocke les informations du profil, les champs du formulaire et les messages.
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Déconnecte l'utilisateur puis le redirige vers la page de connexion.
  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  useEffect(() => {
    // Charge le profil depuis le serveur lorsque la page s'ouvre.
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Impossible de charger le profil");

        // Sépare le nom complet reçu du serveur en prénom et nom.
        // Sépare le nom renvoyé en prénom et nom pour actualiser la page.
      const parts = String(data.name || "").split(" ");
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

  // Affiche une erreur ou un message de chargement avant le formulaire.
  if (error) return <p>{error}</p>;
  if (!user || !form) return <p>Chargement du profil...</p>;

  // Enregistre les changements du profil et, si demandé, du mot de passe.
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Exige les deux champs de mot de passe, ou aucun des deux.
    if (Boolean(currentPassword) !== Boolean(newPassword)) {
      setError("Renseignez le mot de passe actuel et le nouveau mot de passe.");
      return;
    }

    try {
      // Envoie les nouvelles informations du profil au serveur.
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Sépare le nom renvoyé en prénom et nom pour actualiser la page.
      const parts = String(data.name || "").split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");

      setUser({ ...data, firstName, lastName });
      updateUser?.(data);

      // Change aussi le mot de passe si les deux champs ont été remplis.
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
            <label htmlFor="profile-last-name">Nom</label>
            <input
              id="profile-last-name"
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profile-first-name">Prénom</label>
            <input
              id="profile-first-name"
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profile-current-password">Mot de passe actuel</label>
            <input
              id="profile-current-password"
              type="password"
              value={currentPassword}
              placeholder="•••••••••••"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profile-new-password">Nouveau mot de passe</label>
            <input
              id="profile-new-password"
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

      <div className={styles.logoutArea}>
        <button type="button" className={`${styles.submitButton} ${styles.logoutButton}`} onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}