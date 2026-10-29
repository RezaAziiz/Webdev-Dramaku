import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { saveProgress } from "../services/watchHistoryService";
import { TIMEUPDATE_SAVE_INTERVAL_MS } from "../lib/detail";

const PLAYER_ORIGIN = "https://vidrock.net";

export const useWatchHistorySync = ({ tmdbId, mediaType, season, episode }) => {
  const { isAuthenticated, token } = useAuth();
  const lastProgressSaveRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated || !token || !tmdbId || !mediaType) return undefined;
    if (mediaType === "tv" && (!season || !episode)) return undefined;

    const handleMessage = (event) => {
      if (event.origin !== PLAYER_ORIGIN) return;
      if (event.data?.type !== "PLAYER_EVENT") return;

      const payload = event.data.data || event.data;
      const playerEvent = payload?.event;
      const currentTime = payload?.currentTime;
      const duration = payload?.duration;

      if (typeof currentTime !== "number" || typeof duration !== "number") {
        return;
      }

      const recordProgress = () => {
        saveProgress(
          {
            tmdbId: Number(tmdbId),
            mediaType,
            season: mediaType === "tv" ? Number(season) : undefined,
            episode: mediaType === "tv" ? Number(episode) : undefined,
            watchedSeconds: currentTime,
            durationSeconds: duration,
          },
          token,
        ).catch((error) =>
          console.error("Error saving watch progress:", error),
        );
      };

      if (
        playerEvent === "pause" ||
        playerEvent === "seeked" ||
        playerEvent === "ended"
      ) {
        recordProgress();
      } else if (playerEvent === "timeupdate") {
        const now = Date.now();
        if (now - lastProgressSaveRef.current >= TIMEUPDATE_SAVE_INTERVAL_MS) {
          lastProgressSaveRef.current = now;
          recordProgress();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isAuthenticated, token, tmdbId, mediaType, season, episode]);
};
