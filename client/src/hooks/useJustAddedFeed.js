import { useEffect, useState } from "react";
import { getJustAdded } from "../services/movieService";
import { unwrapList } from "../lib/media";
import { normalizeMovie } from "../adapters/mediaAdapter";

export const useJustAddedFeed = () => {
  const [attempt, setAttempt] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError("");
    Promise.allSettled([getJustAdded("movie"), getJustAdded("tv")]).then(
      (results) => {
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
              : "Could not load the latest titles.",
          );
        }
        setLoading(false);
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  return { items, loading, error, retry: () => setAttempt((a) => a + 1) };
};
