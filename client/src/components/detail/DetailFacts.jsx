import React from "react";
import { tmdbImageUrl } from "../../lib/media";

const DetailFacts = ({ facts, studio, isTv, movie }) => (
  <section className="detail-facts glass-surface" aria-label="Title information">
    {facts.map(([label, value]) => (
      <div className="detail-fact" key={label}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    ))}
    {studio?.name && (
      <div className="detail-fact detail-fact--studio">
        <span>
          {isTv && studio === movie.networks?.[0] ? "Network" : "Studio"}
        </span>
        <div
          className={`detail-studio-brand${studio.logo_path ? " has-logo" : ""}`}
        >
          {studio.logo_path && (
            <img
              className="detail-studio-logo"
              src={tmdbImageUrl(studio.logo_path)}
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
);

export default DetailFacts;
