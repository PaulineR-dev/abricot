import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="not-found-title">
        <p className={styles.code}>404</p>
        <h1 className={styles.title} id="not-found-title">
          Cette page est introuvable
        </h1>
        <p className={styles.description}>
          La page que vous recherchez n’existe pas ou a été déplacée.
        </p>
        <Link className={styles.link} href="/">
          Retour à l’accueil
        </Link>
      </section>
    </div>
  );
}
