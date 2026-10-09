"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  // Données utilisateur chargées depuis l’API
  const [user, setUser] = useState(null);

  // Formulaire éditable (nom, prénom, email)
  const [form, setForm] = useState(null);

  // États d’erreur / succès
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Gestion du changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Charge le profil au montage de la page
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Impossible de charger le profil");

        // Découpe du nom complet → prénom + nom
        const parts = data.name.split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        // Mise à jour des données React
        setUser({ ...data, firstName, lastName });

        // Pré-remplissage du formulaire
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

  // États de chargement / erreur
  if (error) return <p>{error}</p>;
  if (!user || !form) return <p>Chargement du profil...</p>;

  // Soumission du formulaire (profil + mot de passe)
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Mise à jour du profil (nom, prénom, email)
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Reconstruction prénom/nom après mise à jour
      const parts = data.name.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");

      setUser({ ...data, firstName, lastName });

      // Mise à jour du mot de passe (optionnelle)
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

        // Reset des champs mot de passe
        setCurrentPassword("");
        setNewPassword("");
      }

      setSuccess("Informations mises à jour avec succès.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "4px" }}>Mon compte</h1>

      <h2 style={{ marginTop: "0", marginBottom: "20px", fontSize: "18px", fontWeight: "normal" }}>
        {user.firstName} {user.lastName}
      </h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>

        <div>
          <label>Prénom</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <label>Mot de passe actuel</label>
          <input
            type="password"
            value={currentPassword}
            placeholder="•••••••••••"
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            placeholder="•••••••••••"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <button type="submit" style={{ marginTop: "20px" }}>
          Modifier les informations
        </button>
      </form>
    </div>
  );
}