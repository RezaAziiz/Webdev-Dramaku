import { useEffect, useState } from "react";
import { discover } from "../services/movieService";
import { unwrapList } from "../lib/media";
import { normalizeMovie } from "../adapters/mediaAdapter";

export const useGenreFeed = ({ genreId, mediaType }) => {
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
    const type = mediaType === "TV Show" ? "tv" : "movie";
    discover(type, { genre: genreId })
      .then((response) => {
        if (!isCurrent) return;
        const items = unwrapList(response);
        setItems(items.map(normalizeMovie));
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not load titles for this genre.",
        );
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [attempt, genreId, mediaType]);

  return { items, loading, error, retry: () => setAttempt((a) => a + 1) };
};
