import React from "react";
import { tmdbImageUrl } from "../../lib/media";

const CastGrid = ({ cast }) => {
  if (cast.length === 0) return null;

  return (
    <section className="detail-section" aria-labelledby="cast-title">
      <div className="detail-section-heading">
        <div>
          <span className="detail-eyebrow">Featuring</span>
          <h2 id="cast-title">Cast</h2>
        </div>
      </div>
      <div className="detail-cast-grid">
        {cast.slice(0, 12).map((actor) => (
          <article
            className="detail-cast-card"
            key={actor.id || actor.cast_id || actor.name}
          >
            {actor.profile_path && (
              <img src={tmdbImageUrl(actor.profile_path)} alt="" loading="lazy" />
            )}
            <span>
              <strong>{actor.name}</strong>
              {actor.character && <small>{actor.character}</small>}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CastGrid;
