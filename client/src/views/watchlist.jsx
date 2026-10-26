import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardMovie from "../components/cardMovie";
import { useAuth } from "../contexts/AuthContext";
import { getWatchlist, removeFromWatchlist } from "../services/watchlistService";
import { getMovieDetails } from "../services/movieService";
import { TMDB_POSTER_SIZE, tmdbImageUrl } from "../lib/media";

const PLACEHOLDER_POSTER =
  "https://via.placeholder.com/300x450?text=No+Image+Available";

// Adapts a raw TMDB details object into the flat shape this view renders.
const toDisplayItem = (tmdbId, mediaType, details) => ({
  tmdbId,
  mediaType,
  title: details?.title || details?.name || "Title Not Available",
  poster: details?.poster_path
    ? tmdbImageUrl(details.poster_path, TMDB_POSTER_SIZE)
    : PLACEHOLDER_POSTER,
  year: (details?.release_date || details?.first_air_date || "").slice(0, 4),
  genre: (details?.genres || []).map((g) => g.name).join(", "),
  rating: details?.vote_average,
});

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const { isAuthenticated: isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const fetchWatchlist = async () => {
      try {
        const entries = await getWatchlist(token);
        const items = await Promise.all(
          (entries || []).map(async (entry) => {
            try {
              const details = await getMovieDetails(
                entry.media_type,
                entry.tmdb_id,
              );
              return toDisplayItem(entry.tmdb_id, entry.media_type, details);
            } catch (error) {
              console.error(
                `Error fetching details for ${entry.media_type}/${entry.tmdb_id}:`,
                error,
              );
              return toDisplayItem(entry.tmdb_id, entry.media_type, null);
            }
          }),
        );
        setWatchlist(items);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    fetchWatchlist();
  }, [isLoggedIn, token]);

  const handleRemove = async (tmdbId, mediaType) => {
    try {
      await removeFromWatchlist(tmdbId, mediaType, token);
      setWatchlist((prev) =>
        prev.filter(
          (item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType),
        ),
      );
    } catch (error) {
      console.error("Error removing movie from watchlist:", error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h1 className="text-3xl font-semibold mb-6">Your Watchlist</h1>
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {watchlist.map((item) => (
            <div key={`${item.mediaType}-${item.tmdbId}`} className="relative">
              <CardMovie
                poster={item.poster}
                title={item.title}
                year={item.year}
                genre={item.genre}
                rating={
                  item.rating && Number(item.rating) > 0
                    ? Number(item.rating).toFixed(1)
                    : "N/A"
                }
                onClick={() =>
                  navigate(`/movies/${item.mediaType}/${item.tmdbId}`)
                }
              />
              <button
                onClick={() => handleRemove(item.tmdbId, item.mediaType)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">You have no movies in your watchlist.</p>
      )}
    </div>
  );
};

export default Watchlist;
