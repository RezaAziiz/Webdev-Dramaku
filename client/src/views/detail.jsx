import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CommentList from "../components/comment";
import { useAuth } from "../contexts/AuthContext";
import { getGenres } from "../services/catalogService";
import { getMovieDetails, getSeasonDetails } from "../services/movieService";
import * as commentService from "../services/commentService";
import * as watchlistService from "../services/watchlistService";
import * as watchHistoryService from "../services/watchHistoryService";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER_POSTER =
  "https://via.placeholder.com/300x450?text=No+Image+Available";
const PLACEHOLDER_AVATAR = "https://via.placeholder.com/100";
const PLAYER_THEME = "14b8a6"; // teal-500, matches the site's accent, no leading '#'
const TIMEUPDATE_SAVE_INTERVAL_MS = 15000;

const toImageUrl = (path) => (path ? `${IMAGE_BASE}${path}` : PLACEHOLDER_POSTER);

const generateGenreColors = (genres) => {
  const colors = {};

  const colorPalette = [
    "#f87171",
    "#fbbf24",
    "#34d399",
    "#ec4899",
    "#60a5fa",
    "#f43f5e",
    "#a855f7",
    "#10b900",
    "#4338ca",
    "#fb923c",
    "#e879f9",
    "#a3e635",
    "#2563eb",
    "#9ca3af",
    "#fca5a5",
    "#fde047",
    "#4ade80",
    "#f9a8d4",
    "#93c5fd",
    "#f8719d",
    "#8b5cf6",
    "#bbf7d0",
    "#4f46e5",
    "#fdba74",
    "#e0aaff",
    "#bef264",
    "#7dd3fc",
    "#d4e100",
    "#166534",
    "#65a30d",
    "#fbcfe8",
    "#f97316",
    "#fde68a",
    "#0ea5e9",
    "#9aa800",
    "#22c55e",
    "#c084fc",
    "#14532d",
    "#2dd4bf",
    "#d1fae5",
    "#d946ef",
    "#0284c7",
    "#a3e635",
    "#6366f1",
    "#059669",
    "#facc15",
    "#b91c1c",
    "#4c1d95",
    "#dc2626",
    "#1d4ed8",
  ];

  genres.forEach((genre, index) => {
    colors[genre.name.toLowerCase()] = colorPalette[index % colorPalette.length];
  });

  return colors;
};

const MovieDetail = () => {
  const { id, mediaType } = useParams();
  const [movie, setMovie] = useState(null);
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [filterRating, setFilterRating] = useState(0);
  const [genreColors, setGenreColors] = useState({});
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const { isAuthenticated: isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  const isTv = mediaType === "tv";
  const lastProgressSaveRef = useRef(0);

  // Genre -> color map (used for the genre pill backgrounds below).
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await getGenres();
        setGenreColors(generateGenreColors(genres));
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  // Title details (raw TMDB passthrough: credits, videos, recommendations).
  useEffect(() => {
    if (!id || !mediaType) return;

    const fetchMovieDetails = async () => {
      try {
        const data = await getMovieDetails(mediaType, id);
        setMovie(data);
        setSelectedSeason(1);
        setSelectedEpisode(1);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [id, mediaType]);

  // Comments for this title.
  useEffect(() => {
    if (!id || !mediaType) return;

    const fetchComments = async () => {
      try {
        const data = await commentService.getComments(mediaType, id);
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [id, mediaType]);

  // Watchlist membership check.
  useEffect(() => {
    if (!isLoggedIn || !token || !id || !mediaType) {
      setIsInWatchlist(false);
      return;
    }

    const checkWatchlist = async () => {
      try {
        const watchlist = await watchlistService.getWatchlist(token);
        setIsInWatchlist(
          (watchlist || []).some(
            (item) =>
              Number(item.tmdb_id) === Number(id) &&
              item.media_type === mediaType,
          ),
        );
      } catch (error) {
        console.error("Error checking watchlist:", error);
      }
    };

    checkWatchlist();
  }, [isLoggedIn, token, id, mediaType]);

  // Episode list for the selected season (TV only).
  useEffect(() => {
    if (!isTv || !id) return;

    const fetchEpisodes = async () => {
      try {
        const data = await getSeasonDetails(id, selectedSeason);
        setEpisodes(data?.episodes || []);
      } catch (error) {
        console.error("Error fetching season details:", error);
        setEpisodes([]);
      }
    };

    fetchEpisodes();
  }, [isTv, id, selectedSeason]);

  // Resume from "Continue Watching" progress, if any.
  useEffect(() => {
    if (!isLoggedIn || !token || !id || !mediaType) return;

    const resumeProgress = async () => {
      try {
        const history = await watchHistoryService.getContinueWatching(token);
        const entry = (history || []).find(
          (item) =>
            Number(item.tmdb_id) === Number(id) &&
            item.media_type === mediaType,
        );
        if (entry) {
          if (entry.season) setSelectedSeason(entry.season);
          if (entry.episode) setSelectedEpisode(entry.episode);
        }
      } catch (error) {
        console.error("Error fetching continue watching progress:", error);
      }
    };

    resumeProgress();
  }, [isLoggedIn, token, id, mediaType]);

  // Sync playback progress from the vidrock player back to our watch history.
  useEffect(() => {
    if (!isLoggedIn || !token || !id || !mediaType) return undefined;

    const handleMessage = (event) => {
      if (event.origin !== "https://vidrock.net") return;
      if (event.data?.type !== "PLAYER_EVENT") return;

      const payload = event.data.data || event.data;
      const playerEvent = payload?.event;
      const currentTime = payload?.currentTime;
      const duration = payload?.duration;

      if (typeof currentTime !== "number" || typeof duration !== "number") {
        return;
      }

      const saveProgress = () => {
        watchHistoryService
          .saveProgress(
            {
              tmdbId: Number(id),
              mediaType,
              season: isTv ? selectedSeason : undefined,
              episode: isTv ? selectedEpisode : undefined,
              watchedSeconds: currentTime,
              durationSeconds: duration,
            },
            token,
          )
          .catch((error) =>
            console.error("Error saving watch progress:", error),
          );
      };

      if (
        playerEvent === "pause" ||
        playerEvent === "seeked" ||
        playerEvent === "ended"
      ) {
        saveProgress();
      } else if (playerEvent === "timeupdate") {
        const now = Date.now();
        if (now - lastProgressSaveRef.current >= TIMEUPDATE_SAVE_INTERVAL_MS) {
          lastProgressSaveRef.current = now;
          saveProgress();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isLoggedIn, token, id, mediaType, isTv, selectedSeason, selectedEpisode]);

  if (!movie) return <div>Loading...</div>;

  const title = movie.title || movie.name || "Title Not Available";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const genres = movie.genres || [];
  const cast = movie.credits?.cast || [];
  const country = movie.production_countries?.[0]?.name;
  const runtimeLabel = isTv
    ? movie.number_of_seasons
      ? `${movie.number_of_seasons} season${movie.number_of_seasons > 1 ? "s" : ""}, ${movie.number_of_episodes || "?"} episodes`
      : null
    : movie.runtime
      ? `${movie.runtime} min`
      : null;

  const trailer =
    movie.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    ) ||
    movie.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Teaser",
    );
  const videoId = trailer?.key;

  const playerQuery = `autoplay=false&theme=${PLAYER_THEME}&download=true&nextbutton=true&episodeselector=true`;
  const playerSrc = isTv
    ? `https://vidrock.net/tv/${id}/${selectedSeason}/${selectedEpisode}?${playerQuery}`
    : `https://vidrock.net/movie/${id}?${playerQuery}`;
  // Fallback / alternative provider (simpler, no progress-tracking events):
  // const playerSrc = isTv
  //   ? `https://moviesapi.to/tv/${id}-${selectedSeason}-${selectedEpisode}`
  //   : `https://moviesapi.to/movie/${id}`;

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || rating === 0) {
      alert("Please provide a comment and a rating.");
      return;
    }

    try {
      await commentService.addComment(
        id,
        mediaType,
        { commentText, rate: rating },
        token,
      );

      setCommentText("");
      setRating(0);
      setIsCommentFormVisible(false);

      const data = await commentService.getComments(mediaType, id);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isLoggedIn) {
      return navigate("/login");
    }

    try {
      await watchlistService.addToWatchlist(Number(id), mediaType, token);
      setIsInWatchlist(true);
      alert("Added to your watchlist.");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      alert("Failed to add to watchlist.");
    }
  };

  const filteredComments = filterRating
    ? comments.filter((comment) => comment.rate === filterRating)
    : comments;

  const displayComments = filteredComments.map((comment) => ({
    user: comment.username,
    date: comment.created_at,
    rating: comment.rate,
    text: comment.comment,
  }));

  return (
    <div>
      <main className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-none w-full md:w-1/5">
            <img
              src={toImageUrl(movie.poster_path)}
              alt={`${title} Poster`}
              className="w-full h-72 rounded shadow-lg mb-4 object-cover"
            />
            <button
              onClick={handleAddToWatchlist}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow"
            >
              {isInWatchlist ? "In Your Watchlist" : "+ Add to My Watchlist"}
            </button>
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl text-gray-200 font-bold mb-2">{title}</h1>

            {/* Year and Country */}
            <div className="flex items-center gap-2 mb-3">
              {year ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium text-black bg-white">
                  {year}
                </span>
              ) : (
                <span className="text-sm text-gray-200">Year: Unknown</span>
              )}

              {country ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium text-black bg-white">
                  {country}
                </span>
              ) : null}

              {runtimeLabel ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium text-black bg-white">
                  {runtimeLabel}
                </span>
              ) : null}
            </div>

            <p className="text-sm text-gray-200 mb-4">
              {movie.overview || "No synopsis available"}
            </p>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {genres.length > 0 ? (
                genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full text-sm font-medium text-black"
                    style={{
                      backgroundColor:
                        genreColors[genre.name.toLowerCase()] || "#9ca3af",
                    }}
                  >
                    {genre.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-200">
                  No genres available
                </span>
              )}
            </div>

            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-yellow-400 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .587l3.668 7.568 8.332 1.213-6.016 5.885 1.418 8.288L12 18.897l-7.402 3.888 1.418-8.288L.584 9.368l8.332-1.213z" />
              </svg>
              <p className="text-sm text-gray-200">
                Rating:{" "}
                {movie.vote_average
                  ? Number(movie.vote_average).toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Stars Section */}
        <div className="my-8 text-center">
          <h2 className="text-2xl text-gray-200 font-bold mb-4">Stars</h2>
          <div className="flex justify-center space-x-7 flex-wrap">
            {cast.length > 0 ? (
              cast.slice(0, 9).map((actor) => (
                <div
                  key={actor.id || actor.cast_id}
                  className="flex flex-col items-center flex-shrink-0"
                >
                  <img
                    src={
                      actor.profile_path
                        ? toImageUrl(actor.profile_path)
                        : PLACEHOLDER_AVATAR
                    }
                    alt={actor.name}
                    className="w-20 h-20 bg-gray-700 rounded-full mb-2 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_AVATAR;
                    }}
                  />
                  <p className="text-gray-200 whitespace-normal break-words text-center max-w-[70px] text-xs">
                    {actor.name || "No name available"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No actors available</p>
            )}
          </div>
        </div>

        {/* Streaming Player */}
        <div className="bg-gray-800 rounded mb-8 p-4 md:p-6">
          <h2 className="text-2xl text-gray-200 font-bold mb-4">Watch Now</h2>

          {isTv && (
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                className="bg-gray-700 text-white p-2 rounded"
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(Number(e.target.value));
                  setSelectedEpisode(1);
                }}
              >
                {Array.from(
                  { length: movie.number_of_seasons || 1 },
                  (_, i) => i + 1,
                ).map((season) => (
                  <option key={season} value={season}>
                    Season {season}
                  </option>
                ))}
              </select>

              <select
                className="bg-gray-700 text-white p-2 rounded"
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(Number(e.target.value))}
              >
                {(episodes.length > 0
                  ? episodes
                  : [{ episode_number: 1, name: "Episode 1" }]
                ).map((episode) => (
                  <option
                    key={episode.episode_number}
                    value={episode.episode_number}
                  >
                    Episode {episode.episode_number}
                    {episode.name ? ` - ${episode.name}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              key={playerSrc}
              src={playerSrc}
              title="Video player"
              allowFullScreen
              frameBorder="0"
              className="absolute top-0 left-0 w-full h-full rounded shadow-lg"
            ></iframe>
          </div>
        </div>

        {/* Trailer Section */}
        <div className="bg-gray-800 rounded mb-8 p-10">
          <h2 className="text-2xl text-gray-200 font-bold mb-4 text-center">
            Trailer
          </h2>
          <div className="flex items-center justify-center">
            {videoId ? (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded shadow-lg"
              ></iframe>
            ) : (
              <p>No trailer available</p>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-800 p-4 rounded mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              People think about this {isTv ? "show" : "movie"}
            </h2>
            {isLoggedIn ? (
              <button
                onClick={() => setIsCommentFormVisible(!isCommentFormVisible)}
                className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition duration-300"
              >
                Add Comment
              </button>
            ) : (
              <p className="text-gray-400">Please log in to add a comment.</p>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-white">({comments.length}) Comments</p>
            <div className="flex items-center">
              <span className="text-white mr-2">Filter by:</span>
              <select
                className="bg-gray-700 text-white p-2 rounded"
                onChange={(e) => setFilterRating(Number(e.target.value))}
                defaultValue={filterRating}
              >
                <option value="0" className="text-white">
                  All ratings
                </option>
                <option value="5" className="text-yellow-500">
                  ★★★★★
                </option>
                <option value="4" className="text-yellow-500">
                  ★★★★☆
                </option>
                <option value="3" className="text-yellow-500">
                  ★★★☆☆
                </option>
                <option value="2" className="text-yellow-500">
                  ★★☆☆☆
                </option>
                <option value="1" className="text-yellow-500">
                  ★☆☆☆☆
                </option>
              </select>
            </div>
          </div>

          {isCommentFormVisible && (
            <div className="mb-4">
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${rating >= star ? "text-yellow-400" : "text-gray-600"}`}
                    onClick={() => setRating(star)}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.571 8.332 1.215-6.0 5.874 1.417 8.239L12 18.897l-7.417 3.9 1.417-8.239-6.0-5.874 8.332-1.215z" />
                  </svg>
                ))}
              </div>

              <textarea
                rows="3"
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2 text-white rounded bg-gray-600 focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handleCommentSubmit}
                  className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition duration-300"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          <CommentList comments={displayComments} />
        </div>
      </main>
    </div>
  );
};

export default MovieDetail;
