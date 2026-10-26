import { useEffect, useState } from "react";
import { getTrending } from "../services/movieService";
import { unwrapList } from "../lib/media";
import { normalizeMovie } from "../adapters/mediaAdapter";

export const useTrendingFeed = () => {
  const [attempt, setAttempt] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError("");
    getTrending()
      .then((response) => {
        if (!isCurrent) return;
        setItems(unwrapList(response).map(normalizeMovie));
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : "Could not load trending titles.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  return { items, loading, error, retry: () => setAttempt((a) => a + 1) };
};
