import React from "react";
import { LuBookmark, LuBookmarkPlus, LuClapperboard, LuPlay } from "react-icons/lu";
import { tmdbImageUrl } from "../../lib/media";
import logo from "../../assets/Logo.png";

const DetailHero = ({
  isTv,
  year,
  runtimeLabel,
  title,
  movie,
  genres,
  backdropUrl,
  videoId,
  isInWatchlist,
  cast,
  onPlay,
  onAddToWatchlist,
}) => (
  <section className="detail-hero" aria-labelledby="detail-title">
    {backdropUrl && (
      <img
        className="detail-hero-art"
        src={backdropUrl}
        alt=""
        fetchPriority="high"
      />
    )}
    <div className="detail-hero-shade" aria-hidden="true" />

    <div className="detail-hero-content">
      <div className="detail-kicker">
        <span className="detail-brand-mark">
          <img src={logo} alt="Lumo" />
        </span>
        <span aria-hidden="true">•</span>
        <span>
          {isTv ? "Series" : "Movie"}
          {year ? ` · ${year}` : ""}
        </span>
        {runtimeLabel && (
          <>
            <span aria-hidden="true">·</span>
            <span>{runtimeLabel}</span>
          </>
        )}
      </div>

      <h1 id="detail-title" className="detail-title">
        {title}
      </h1>

      <div className="detail-rating-row">
        {Number(movie.vote_average) > 0 && (
          <span className="detail-rating">
            <span aria-hidden="true">★</span>
            {Number(movie.vote_average).toFixed(1)}
            {Number(movie.vote_count) > 0 && (
              <span className="detail-vote-count">
                ({Number(movie.vote_count).toLocaleString()})
              </span>
            )}
          </span>
        )}
        {genres.map((genre) => (
          <span className="detail-genre-chip" key={genre.id}>
            {genre.name}
          </span>
        ))}
      </div>

      {movie.overview && <p className="detail-overview">{movie.overview}</p>}

      <div className="detail-actions">
        <button
          type="button"
          className="detail-button detail-button--primary"
          onClick={onPlay}
        >
          <LuPlay aria-hidden="true" />
          Play
        </button>
        {videoId && (
          <a className="detail-button detail-button--secondary" href="#detail-trailer">
            <LuClapperboard aria-hidden="true" />
            Trailer
          </a>
        )}
        <button
          type="button"
          className="detail-button detail-button--secondary"
          onClick={onAddToWatchlist}
        >
          {isInWatchlist ? (
            <LuBookmark aria-hidden="true" />
          ) : (
            <LuBookmarkPlus aria-hidden="true" />
          )}
          {isInWatchlist ? "In your watchlist" : "Add to watchlist"}
        </button>
      </div>
    </div>

    {cast.length > 0 && (
      <aside className="detail-cast-glass" aria-label="Cast">
        <h2>Starring</h2>
        <div className="detail-cast-preview">
          {cast.slice(0, 3).map((actor) => (
            <div
              className="detail-cast-person"
              key={actor.id || actor.cast_id || actor.name}
            >
              {actor.profile_path ? (
                <img
                  src={tmdbImageUrl(actor.profile_path)}
                  alt=""
                  loading="lazy"
                />
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
);

export default DetailHero;
