import { useEffect } from "react";
import { computeMoviePalette, getImageUrl, toRgba } from "../lib/color";

export const useHeroPalette = (activeMovie) => {
  useEffect(() => {
    if (!activeMovie || !getImageUrl(activeMovie)) {
      return undefined;
    }

    let cancelled = false;

    const applyPalette = async () => {
      const palette = await computeMoviePalette(activeMovie);
      if (cancelled) return;

      const appRoot = document.querySelector(".app-shell");
      if (!appRoot) return;

      appRoot.style.setProperty("--tint", palette.tint);
      appRoot.style.setProperty("--bg-base", palette.bg);
      appRoot.style.setProperty("--accent", palette.accent);
      appRoot.style.setProperty("--accent-soft", toRgba(palette.accent, 0.18));
    };

    applyPalette();

    return () => {
      cancelled = true;
    };
  }, [activeMovie]);
};
