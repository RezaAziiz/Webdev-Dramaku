import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./detail.css";
import CommentList from "../components/comment";
import { useAuth } from "../contexts/AuthContext";
import { getMovieDetails, getSeasonDetails } from "../services/movieService";
import * as commentService from "../services/commentService";
import * as watchlistService from "../services/watchlistService";
import * as watchHistoryService from "../services/watchHistoryService";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const PLAYER_THEME = "14b8a6"; // teal-500, matches the site's accent, no leading '#'
const TIMEUPDATE_SAVE_INTERVAL_MS = 15000;

const toImageUrl = (path, base = IMAGE_BASE) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) {
    return base === BACKDROP_BASE
      ? path.replace(
          /(image\.tmdb\.org\/t\/p\/)(?:w\d+|h\d+|original)(\/)/,
          "$1original$2",
        )
      : path;
  }
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

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
            : seasonEpisodes[0]?.episode_number ?? null,
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
        <button type="button" className="detail-button detail-button--secondary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </main>
    );
  }

  const title = movie.title || movie.name || "Title Not Available";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const genres = Array.isArray(movie.genres) ? movie.genres : [];
  const cast = Array.isArray(movie.credits?.cast) ? movie.credits.cast : [];
  const country = movie.production_countries?.[0]?.name;
  const studio = isTv
    ? movie.networks?.[0] || movie.production_companies?.[0]
    : movie.production_companies?.[0];
  const seasons = Array.isArray(movie.seasons)
    ? movie.seasons.filter((season) => Number(season.season_number) > 0)
    : [];
  const backdropPath = movie.backdrop_path || movie.poster_path;
  const backdropUrl = toImageUrl(backdropPath, BACKDROP_BASE);
  const posterUrl = toImageUrl(movie.poster_path);
  const runtimeLabel =
    !isTv && Number(movie.runtime) > 0 ? `${movie.runtime} min` : null;

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
    ? selectedEpisode !== null
      ? `https://vidrock.net/tv/${id}/${selectedSeason}/${selectedEpisode}?${playerQuery}`
      : null
    : `https://vidrock.net/movie/${id}?${playerQuery}`;

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
    <main className={`detail-page${isTv ? " detail-page--series" : ""}`}>
      {backdropUrl && (
        <img className="detail-ambient" src={backdropUrl} alt="" aria-hidden="true" />
      )}

      <section className="detail-hero" aria-labelledby="detail-title">
        {backdropUrl && (
          <img className="detail-hero-art" src={backdropUrl} alt="" fetchPriority="high" />
        )}
        <div className="detail-hero-shade" aria-hidden="true" />

        <div className="detail-hero-content">
          <div className="detail-kicker">
            <span className="detail-brand-mark">Dramaku</span>
            <span aria-hidden="true">•</span>
            <span>{isTv ? "Series" : "Movie"}{year ? ` · ${year}` : ""}</span>
            {runtimeLabel && <><span aria-hidden="true">·</span><span>{runtimeLabel}</span></>}
          </div>

          <h1 id="detail-title" className="detail-title">{title}</h1>

          <div className="detail-rating-row">
            {Number(movie.vote_average) > 0 && (
              <span className="detail-rating">
                <span aria-hidden="true">★</span>
                {Number(movie.vote_average).toFixed(1)}
                {Number(movie.vote_count) > 0 && (
                  <span className="detail-vote-count">({Number(movie.vote_count).toLocaleString()})</span>
                )}
              </span>
            )}
            {genres.map((genre) => (
              <span className="detail-genre-chip" key={genre.id}>{genre.name}</span>
            ))}
          </div>

          {movie.overview && <p className="detail-overview">{movie.overview}</p>}

          <div className="detail-actions">
            <button type="button" className="detail-button detail-button--primary" onClick={scrollToPlayer}>
              Play
            </button>
            {videoId && (
              <a className="detail-button detail-button--secondary" href="#detail-trailer">
                Trailer
              </a>
            )}
            <button type="button" className="detail-button detail-button--secondary" onClick={handleAddToWatchlist}>
              {isInWatchlist ? "In your watchlist" : "Add to watchlist"}
            </button>
          </div>
        </div>

        {cast.length > 0 && (
          <aside className="detail-cast-glass" aria-label="Cast">
            <h2>Starring</h2>
            <div className="detail-cast-preview">
              {cast.slice(0, 3).map((actor) => (
                <div className="detail-cast-person" key={actor.id || actor.cast_id || actor.name}>
                  {actor.profile_path ? (
                    <img src={toImageUrl(actor.profile_path)} alt="" loading="lazy" />
                  ) : (
                    <span className="detail-cast-initial" aria-hidden="true">
                      {actor.name?.slice(0, 1) || "?"}
                    </span>
                  )}
                  <span>
                    <strong>{actor.name}</strong>
                    {actor.character && <small>{actor.character}</small>}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </section>

      <div className="detail-content">
        <section className="detail-facts glass-surface" aria-label="Title information">
          {[
            ["Status", movie.status],
            ["Runtime", runtimeLabel],
            ["Language", movie.original_language?.toUpperCase()],
            ["Country", country],
            ["First aired", movie.first_air_date],
            ["Released", movie.release_date],
            ["Seasons", isTv && Number(movie.number_of_seasons) > 0 ? movie.number_of_seasons : null],
            ["Episodes", isTv && Number(movie.number_of_episodes) > 0 ? movie.number_of_episodes : null],
          ]
            .filter(([, value]) => value !== null && value !== undefined && value !== "")
            .map(([label, value]) => (
              <div className="detail-fact" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          {studio?.name && (
            <div className="detail-fact detail-fact--studio">
              <span>{isTv && studio === movie.networks?.[0] ? "Network" : "Studio"}</span>
              <div className={`detail-studio-brand${studio.logo_path ? " has-logo" : ""}`}>
                {studio.logo_path && (
                  <img
                    className="detail-studio-logo"
                    src={toImageUrl(studio.logo_path)}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.parentElement?.classList.add(
                        "is-logo-unavailable",
                      );
                    }}
                  />
                )}
                <strong className="detail-studio-name">{studio.name}</strong>
              </div>
            </div>
          )}
        </section>

        {isTv && (
          <section className="detail-section" aria-labelledby="episodes-title">
            <div className="detail-section-heading">
              <div>
                <span className="detail-eyebrow">
                  {seasons.find((season) => Number(season.season_number) === selectedSeason)?.episode_count
                    ? `Season ${selectedSeason} · ${seasons.find((season) => Number(season.season_number) === selectedSeason).episode_count} episodes`
                    : `Season ${selectedSeason}`}
                </span>
                <h2 id="episodes-title">Episodes</h2>
              </div>
              {seasons.length > 0 && (
                <label className="detail-season-select">
                  <span className="visually-hidden">Choose season</span>
                  <select
                    value={selectedSeason}
                    onChange={(event) => {
                      setSelectedSeason(Number(event.target.value));
                      setSelectedEpisode(null);
                    }}
                  >
                    {seasons.map((season) => (
                      <option key={season.id || season.season_number} value={season.season_number}>
                        {season.name || `Season ${season.season_number}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {episodesLoading && <p className="detail-empty" role="status">Loading episodes…</p>}
            {episodesError && <p className="detail-empty" role="alert">{episodesError}</p>}
            {!episodesLoading && !episodesError && episodes.length > 0 && (
              <div className="detail-episode-list">
                {episodes.map((episode) => {
                  const isSelected = Number(episode.episode_number) === selectedEpisode;
                  const stillUrl = episode.still_path
                    ? toImageUrl(episode.still_path, IMAGE_BASE)
                    : posterUrl;

                  return (
                    <article className={`detail-episode${isSelected ? " is-selected" : ""}`} key={episode.id || episode.episode_number}>
                      <button
                        type="button"
                        className="detail-episode-select"
                        onClick={() => playEpisode(Number(episode.episode_number))}
                        aria-label={`Play episode ${episode.episode_number}: ${episode.name || "Untitled episode"}`}
                        aria-current={isSelected ? "true" : undefined}
                      >
                        <span className="detail-episode-art">
                          {stillUrl && <img src={stillUrl} alt="" loading="lazy" />}
                          <span className="detail-episode-number">E{episode.episode_number}</span>
                        </span>
                        <span className="detail-episode-copy">
                          <span className="detail-eyebrow">Episode {episode.episode_number}</span>
                          <strong>{episode.name || `Episode ${episode.episode_number}`}</strong>
                          <span className="detail-episode-meta">
                            {[episode.air_date, Number(episode.runtime) > 0 ? `${episode.runtime} min` : null, Number(episode.vote_average) > 0 ? `★ ${Number(episode.vote_average).toFixed(1)}` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          {episode.overview && <span className="detail-episode-overview">{episode.overview}</span>}
                        </span>
                        <span className="detail-episode-play" aria-hidden="true">▶</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
            {!episodesLoading && !episodesError && episodes.length === 0 && (
              <p className="detail-empty">Episode information is not available for this season.</p>
            )}
          </section>
        )}

        <section className="detail-section detail-player-section" ref={playerRef} aria-labelledby="watch-title">
          <div className="detail-section-heading">
            <div>
              <span className="detail-eyebrow">{isTv && selectedEpisode !== null ? `Season ${selectedSeason} · Episode ${selectedEpisode}` : "Watch"}</span>
              <h2 id="watch-title">{isTv ? "Watch episode" : "Watch movie"}</h2>
            </div>
          </div>
          {playerSrc ? (
            <div className="detail-player-frame">
              <iframe
                key={playerSrc}
                src={playerSrc}
                title={isTv ? `${title}, season ${selectedSeason}, episode ${selectedEpisode}` : `${title} video player`}
                allowFullScreen
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
          ) : (
            <p className="detail-empty">
              {isTv
                ? "Choose an available episode above to start watching."
                : "The player is unavailable."}
            </p>
          )}
        </section>

        {cast.length > 0 && (
          <section className="detail-section" aria-labelledby="cast-title">
            <div className="detail-section-heading">
              <div>
                <span className="detail-eyebrow">Featuring</span>
                <h2 id="cast-title">Cast</h2>
              </div>
            </div>
            <div className="detail-cast-grid">
              {cast.slice(0, 12).map((actor) => (
                <article className="detail-cast-card" key={actor.id || actor.cast_id || actor.name}>
                  {actor.profile_path && <img src={toImageUrl(actor.profile_path)} alt="" loading="lazy" />}
                  <span>
                    <strong>{actor.name}</strong>
                    {actor.character && <small>{actor.character}</small>}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}

        {videoId && (
          <section className="detail-section" id="detail-trailer" aria-labelledby="trailer-title">
            <div className="detail-section-heading">
              <div>
                <span className="detail-eyebrow">Preview</span>
                <h2 id="trailer-title">Trailer</h2>
              </div>
            </div>
            <div className="detail-player-frame">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`${title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        <section className="detail-section detail-comments glass-surface" aria-labelledby="comments-title">
          <div className="detail-section-heading detail-comments-heading">
            <div>
              <span className="detail-eyebrow">Community</span>
              <h2 id="comments-title">Comments</h2>
            </div>
            {isLoggedIn ? (
              <button
                type="button"
                className="detail-button detail-button--secondary"
                onClick={() => setIsCommentFormVisible((visible) => !visible)}
              >
                {isCommentFormVisible ? "Cancel" : "Add comment"}
              </button>
            ) : (
              <p>Please log in to add a comment.</p>
            )}
          </div>

          <div className="detail-comment-tools">
            <span>{comments.length} comments</span>
            <label>
              <span>Filter rating</span>
              <select
                value={filterRating}
                onChange={(event) => setFilterRating(Number(event.target.value))}
              >
                <option value="0">All ratings</option>
                {[5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>{score} star{score > 1 ? "s" : ""}</option>
                ))}
              </select>
            </label>
          </div>

          {isCommentFormVisible && (
            <form
              className="detail-comment-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleCommentSubmit();
              }}
            >
              <label>
                <span>Your rating</span>
                <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                  <option value="0">Choose a rating</option>
                  {[5, 4, 3, 2, 1].map((score) => (
                    <option key={score} value={score}>{score} star{score > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Your comment</span>
                <textarea
                  rows="3"
                  placeholder="Write your comment…"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />
              </label>
              <button type="submit" className="detail-button detail-button--primary">Submit comment</button>
            </form>
          )}

          <CommentList comments={displayComments} />
        </section>
      </div>
    </main>
  );
};

export default MovieDetail;
