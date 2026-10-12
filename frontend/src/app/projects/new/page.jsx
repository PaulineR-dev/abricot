"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./newProject.module.css";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [contributors, setContributors] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }

    async function searchUsers() {
      try {
        const res = await fetch(`/api/users?query=${search}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    }

    searchUsers();
  }, [search]);

  function addContributor(user) {
    if (!contributors.includes(user.email)) {
      setContributors([...contributors, user.email]);
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearch("");
    setResults([]);
  }

  function removeContributor(email) {
    setContributors(contributors.filter((c) => c !== email));
    setSelectedUsers(selectedUsers.filter((u) => u.email !== email));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          contributors,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/projects");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <button className={styles.close} onClick={() => router.push("/projects")}>
          ✕
        </button>

        <h1 className={styles.title}>Créer un projet</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label>Titre*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              required
            />
          </div>

          <div className={styles.field}>
            <label>Description*</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
              required
            />
          </div>

          <div className={styles.field}>
            <label>Contributeurs</label>

            <div className={styles.selectWrapper}>
              {search === "" && contributors.length === 0 && (
                <span className={styles.placeholder}>
                  Choisir un ou plusieurs collaborateurs
                </span>
              )}

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.inputSelect}
              />
            </div>

            {results.length > 0 && (
              <div className={styles.dropdown}>
                {results.map((u) => (
                  <div
                    key={u.id}
                    className={styles.dropdownItem}
                    onClick={() => addContributor(u)}
                  >
                    {u.name} ({u.email})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.tags}>
            {selectedUsers.map((u) => (
              <span key={u.id} className={styles.tag}>
                {u.name}
                <button
                  className={styles.removeTag}
                  onClick={() => removeContributor(u.email)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <button type="submit" className={styles.submit}>
            Ajouter un projet
          </button>
        </form>
      </div>
    </div>
  );
}