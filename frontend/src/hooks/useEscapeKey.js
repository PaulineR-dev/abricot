import { useEffect } from "react";

// Permet de fermer un élément ouvert lorsque la touche Échap est utilisée.
export function useEscapeKey(isOpen, onClose) {
  useEffect(() => {
    // N'écoute pas le clavier si rien n'est ouvert.
    if (!isOpen) return;

    // Ferme l'élément seulement si la touche Échap est pressée.
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }

    // Commence à écouter les touches et retire l'écouteur à la fin.
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
}