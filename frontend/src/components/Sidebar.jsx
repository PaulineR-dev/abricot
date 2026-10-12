"use client";

import Image from "next/image";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      
      {/* Gauche */}
      <div className={styles.left}>
        <Image
          src="/images/logo-sidebar.png"
          alt="Logo Abricot Sidebar"
          width={0}
          height={0}
          sizes="100vw"
          className={styles.logo}
        />
      </div>

      {/* Droite */}
      <div className={styles.right}>
        <span className={styles.title}>Abricot 2025</span>
      </div>

    </div>
  );
}