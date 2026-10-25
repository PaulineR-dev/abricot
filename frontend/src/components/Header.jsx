"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import styles from "./header.module.css";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  const initials = (() => {
    if (!user) return "";

    if (user.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }

    return user.email[0].toUpperCase();
  })();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Image
          src="/images/logo.png"
          alt="Logo Abricot"
          width={0}
          height={0}
          sizes="100vw"
          className={styles.logo}
        />
      </div>

      <nav className={styles.center} aria-label="Navigation principale">
        <button
          type="button"
          className={`${styles.navItem} ${pathname.startsWith("/dashboard") ? styles.active : ""}`}
          aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
          onClick={() => router.push("/dashboard")}
        >
          <Image
            src="/images/dashboard-header.png"
            alt="Dashboard icon"
            width={24}
            height={24}
            className={styles.icon}
          />
          <span className={styles.text}>Tableau de bord</span>
        </button>

        <button
          type="button"
          className={`${styles.navItem} ${pathname.startsWith("/projects") ? styles.active : ""}`}
          aria-current={pathname.startsWith("/projects") ? "page" : undefined}
          onClick={() => router.push("/projects")}
        >
          <Image
            src="/images/projects-header.png"
            alt="Projects icon"
            width={0}
            height={0}
            sizes="100vw"
            className={styles.icon}
          />
          <span className={styles.text}>Projets</span>
        </button>
      </nav>

      <button
        type="button"
        className={styles.right}
        aria-label={`Ouvrir le profil de ${user?.name || user?.email || "l’utilisateur"}`}
        onClick={() => router.push("/profile")}
      >
        {loading ? (
          <div className={styles.avatar}>â€¦</div>
        ) : user ? (
          <div className={styles.avatar}>{initials}</div>
        ) : (
          <div className={styles.avatar}>?</div>
        )}
      </button>
    </header>
  );
}
