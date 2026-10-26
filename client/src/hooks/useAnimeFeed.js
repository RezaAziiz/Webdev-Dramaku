import { useEffect, useState } from "react";
import { discover } from "../services/movieService";
import { unwrapList } from "../lib/media";
import { normalizeMovie } from "../adapters/mediaAdapter";

export const useAnimeFeed = ({ genreId }) => {
  const [attempt, setAttempt] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (genreId == null) {
      setItems([]);
      setError("");
      setLoading(false);
      return undefined;
    }
    let isCurrent = true;
    setLoading(true);
    setError("");
    Promise.allSettled([
      discover("movie", { genre: genreId }),
      discover("tv", { genre: genreId }),
    ]).then((results) => {
      if (!isCurrent) return;
      const items = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => unwrapList(result.value));
      setItems(items.map(normalizeMovie));
      const failed = results.find((result) => result.status === "rejected");
      if (failed) {
        setError(
          failed.reason instanceof Error
            ? failed.reason.message
            : "Could not load anime titles.",
        );
      }
      setLoading(false);
    });
    return () => {
      isCurrent = false;
    };
  }, [attempt, genreId]);

  return { items, loading, error, retry: () => setAttempt((a) => a + 1) };
};
