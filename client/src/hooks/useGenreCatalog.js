import { useEffect, useState } from "react";
import { getGenres } from "../services/catalogService";
import { unwrapList } from "../lib/media";

export const useGenreCatalog = () => {
  const [attempt, setAttempt] = useState(0);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError("");
    getGenres()
      .then((response) => {
        if (!isCurrent) return;
        const items = unwrapList(response);
        setGenres(items);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(
          err instanceof Error ? err.message : "Genres could not be loaded.",
        );
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  return { genres, loading, error, retry: () => setAttempt((a) => a + 1) };
};
