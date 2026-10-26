import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/detail.css";
import { useAuth } from "../contexts/AuthContext";
import { getMovieDetails, getSeasonDetails } from "../services/movieService";
import * as commentService from "../services/commentService";
import * as watchlistService from "../services/watchlistService";
import * as watchHistoryService from "../services/watchHistoryService";
import {
  TMDB_BACKDROP_SIZE,
  TMDB_POSTER_SIZE,
  tmdbImageUrl,
} from "../lib/media";
import {
  TIMEUPDATE_SAVE_INTERVAL_MS,
  buildDetailFacts,
  buildPlayerSrc,
  getRuntimeLabel,
  getStudio,
  getTitle,
  getTrailerVideoId,
  getYear,
  mapCommentsForDisplay,
} from "../lib/detail";
import DetailHero from "../components/detail/DetailHero";
import DetailFacts from "../components/detail/DetailFacts";
import EpisodeList from "../components/detail/EpisodeList";
import DetailPlayer from "../components/detail/DetailPlayer";
import CastGrid from "../components/detail/CastGrid";
import TrailerSection from "../components/detail/TrailerSection";
import CommentsSection from "../components/detail/CommentsSection";

const MovieDetail = () => {
  const { id, mediaType } = useParams();
  const [movie, setMovie] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [filterRating, setFilterRating] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState("");
  const { isAuthenticated: isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  const isTv = mediaType === "tv";
  const lastProgressSaveRef = useRef(0);
  const playerRef = useRef(null);

  // Title details (raw TMDB passthrough: credits, videos, recommendations).
  useEffect(() => {
    if (!id || !mediaType) return;

    let isCurrent = true;
    setDetailsLoading(true);
    setDetailError("");
    setMovie(null);

    const fetchMovieDetails = async () => {
      try {
        const data = await getMovieDetails(mediaType, id);
        if (!isCurrent) return;
        setMovie(data);
        const firstSeason = Array.isArray(data?.seasons)
          ? data.seasons.find((season) => Number(season.season_number) > 0)
          : null;
        setSelectedSeason(Number(firstSeason?.season_number) || 1);
        setSelectedEpisode(null);
      } catch (error) {
        if (!isCurrent) return;
        console.error("Error fetching movie details:", error);
        setDetailError("Could not load this title. Please try again.");
      } finally {
        if (isCurrent) setDetailsLoading(false);
      }
    };

    fetchMovieDetails();

    return () => {
      isCurrent = false;
    };
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
    if (!isTv || !id || !movie) {
      setEpisodes([]);
      setEpisodesLoading(false);
      setEpisodesError("");
      return undefined;
    }

    let isCurrent = true;
    setEpisodesLoading(true);
    setEpisodesError("");
    const fetchEpisodes = async () => {
      try {
        const data = await getSeasonDetails(id, selectedSeason);
        if (!isCurrent) return;
        const seasonEpisodes = Array.isArray(data?.episodes)
          ? data.episodes
          : [];
        setEpisodes(seasonEpisodes);
        setSelectedEpisode((currentEpisode) =>
          seasonEpisodes.some(
            (episode) => Number(episode.episode_number) === currentEpisode,
          )
            ? currentEpisode
            : (seasonEpisodes[0]?.episode_number ?? null),
        );
      } catch (error) {
        if (!isCurrent) return;
        console.error("Error fetching season details:", error);
        setEpisodes([]);
        setEpisodesError("Episode information is currently unavailable.");
      } finally {
        if (isCurrent) setEpisodesLoading(false);
      }
    };

    fetchEpisodes();

    return () => {
      isCurrent = false;
    };
  }, [isTv, id, movie, selectedSeason]);

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

  if (detailsLoading) {
    return (
      <main className="detail-page detail-state">
        <p role="status">Loading title details…</p>
      </main>
    );
  }

  if (detailError || !movie) {
    return (
      <main className="detail-page detail-state">
        <p role="alert">{detailError || "Title details are unavailable."}</p>
        <button
          type="button"
          className="detail-button detail-button--secondary"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </main>
    );
  }

  const title = getTitle(movie);
  const year = getYear(movie);
  const genres = Array.isArray(movie.genres) ? movie.genres : [];
  const cast = Array.isArray(movie.credits?.cast) ? movie.credits.cast : [];
  const country = movie.production_countries?.[0]?.name;
  const studio = getStudio(movie, isTv);
  const seasons = Array.isArray(movie.seasons)
    ? movie.seasons.filter((season) => Number(season.season_number) > 0)
    : [];
  const backdropPath = movie.backdrop_path || movie.poster_path;
  const backdropUrl = tmdbImageUrl(backdropPath, TMDB_BACKDROP_SIZE);
  const posterUrl = tmdbImageUrl(movie.poster_path, TMDB_POSTER_SIZE);
  const runtimeLabel = getRuntimeLabel(movie, isTv);
  const videoId = getTrailerVideoId(movie);
  const playerSrc = buildPlayerSrc({
    isTv,
    id,
    selectedSeason,
    selectedEpisode,
  });
  const facts = buildDetailFacts(movie, isTv, runtimeLabel, country);

  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  const playEpisode = (episodeNumber) => {
    setSelectedEpisode(episodeNumber);
    window.requestAnimationFrame(scrollToPlayer);
  };

  const handleSelectSeason = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(null);
  };

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
  const displayComments = mapCommentsForDisplay(filteredComments);

  return (
    <main className={`detail-page${isTv ? " detail-page--series" : ""}`}>
      {backdropUrl && (
        <img
          className="detail-ambient"
          src={backdropUrl}
          alt=""
          aria-hidden="true"
        />
      )}

      <DetailHero
        isTv={isTv}
        year={year}
        runtimeLabel={runtimeLabel}
        title={title}
        movie={movie}
        genres={genres}
        backdropUrl={backdropUrl}
        videoId={videoId}
        isInWatchlist={isInWatchlist}
        cast={cast}
        onPlay={scrollToPlayer}
        onAddToWatchlist={handleAddToWatchlist}
      />

      <div className="detail-content">
        <DetailFacts facts={facts} studio={studio} isTv={isTv} movie={movie} />

        <EpisodeList
          isTv={isTv}
          seasons={seasons}
          selectedSeason={selectedSeason}
          episodes={episodes}
          episodesLoading={episodesLoading}
          episodesError={episodesError}
          selectedEpisode={selectedEpisode}
          posterUrl={posterUrl}
          onSelectSeason={handleSelectSeason}
          onPlayEpisode={playEpisode}
        />

        {cast.length > 0 && (
          <section
            className="detail-mobile-starring glass-surface"
            aria-labelledby="detail-mobile-starring-title"
          >
            <h2 id="detail-mobile-starring-title">Starring</h2>
            <div className="detail-mobile-starring-list">
              {cast.slice(0, 3).map((actor) => (
                <div
                  className="detail-mobile-starring-person"
                  key={actor.id || actor.cast_id || actor.name}
                >
                  {actor.profile_path ? (
                    <img
                      src={tmdbImageUrl(actor.profile_path)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span aria-hidden="true">
                      {actor.name?.slice(0, 1) || "?"}
                    </span>
                  )}
                  <strong>{actor.name}</strong>
                  {actor.character && <small>{actor.character}</small>}
                </div>
              ))}
            </div>
          </section>
        )}

        <DetailPlayer
          playerRef={playerRef}
          isTv={isTv}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
          playerSrc={playerSrc}
          title={title}
        />

        <CastGrid cast={cast} />

        <TrailerSection videoId={videoId} title={title} />

        <CommentsSection
          isLoggedIn={isLoggedIn}
          comments={comments}
          filterRating={filterRating}
          isCommentFormVisible={isCommentFormVisible}
          rating={rating}
          commentText={commentText}
          displayComments={displayComments}
          onFilterRatingChange={setFilterRating}
          onToggleCommentForm={() =>
            setIsCommentFormVisible((visible) => !visible)
          }
          onRatingChange={setRating}
          onCommentTextChange={setCommentText}
          onSubmit={handleCommentSubmit}
        />
      </div>
    </main>
  );
};

export default MovieDetail;
