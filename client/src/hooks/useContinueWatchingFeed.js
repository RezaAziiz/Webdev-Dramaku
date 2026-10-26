import { useEffect, useState } from "react";
import { getContinueWatching } from "../services/watchHistoryService";
import { unwrapList } from "../lib/media";
import { normalizeContinueWatching } from "../adapters/mediaAdapter";

export const useContinueWatchingFeed = (token) => {
  const [attempt, setAttempt] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setItems([]);
      setError("");
      setLoading(false);
      return undefined;
    }
    let isCurrent = true;
    setLoading(true);
    setError("");
    getContinueWatching(token)
      .then((response) => {
        if (!isCurrent) return;
        setItems(
          unwrapList(response).map(normalizeContinueWatching),
        );
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your continue watching list.",
        );
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [attempt, token]);

  return { items, loading, error, retry: () => setAttempt((a) => a + 1) };
};
