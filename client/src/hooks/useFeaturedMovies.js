import { useEffect, useState } from "react";
import { getFeaturedMovies } from "../services/movieService";

const useFeaturedMovies = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFeaturedMovies();
        if (isMounted) {
          setFeaturedMovies(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  return { featuredMovies, loading, error };
};

export default useFeaturedMovies;
