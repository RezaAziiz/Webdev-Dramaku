import React from "react";
import { Link } from "react-router-dom";
import { buildMediaDetailPath, tmdbImageUrl } from "../../lib/media";

const MediaCard = ({ movie }) => {
  const href = buildMediaDetailPath(movie);
  const artwork = movie.backdrop || movie.poster;
  const content = (
    <>
      <div
        className={`discover-card-art${movie.backdrop ? "" : " is-poster-fallback"}`}
      >
        {artwork ? (
          <img
            src={tmdbImageUrl(artwork, "original")}
            alt={`${movie.title} artwork`}
            loading="lazy"
          />
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
      <div className="discover-card-copy">
        <div className="discover-card-meta">
          {movie.type && <span>{movie.type}</span>}
          {movie.year && <span>{movie.year}</span>}
          {movie.rating !== null && (
            <span>TMDB {Number(movie.rating).toFixed(1)}</span>
          )}
        </div>
        <h3>{movie.title}</h3>
        {movie.genre.length > 0 && (
          <span className="discover-card-genres">{movie.genre.join(" · ")}</span>
        )}
      </div>
    </>
  );

  if (!href) {
    return <article className="discover-card">{content}</article>;
  }

  return (
    <Link
      className="discover-card"
      to={href}
      aria-label={`View ${movie.title} details`}
    >
      {content}
    </Link>
  );
};

export default MediaCard;
