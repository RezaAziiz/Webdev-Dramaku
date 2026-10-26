import React from "react";

const DetailPlayer = ({
  playerRef,
  isTv,
  selectedSeason,
  selectedEpisode,
  playerSrc,
  title,
}) => (
  <section
    className="detail-section detail-player-section"
    ref={playerRef}
    aria-labelledby="watch-title"
  >
    <div className="detail-section-heading">
      <div>
        <span className="detail-eyebrow">
          {isTv && selectedEpisode !== null
            ? `Season ${selectedSeason} · Episode ${selectedEpisode}`
            : "Watch"}
        </span>
        <h2 id="watch-title">{isTv ? "Watch episode" : "Watch movie"}</h2>
      </div>
    </div>
    {playerSrc ? (
      <div className="detail-player-frame">
        <iframe
          key={playerSrc}
          src={playerSrc}
          title={
            isTv
              ? `${title}, season ${selectedSeason}, episode ${selectedEpisode}`
              : `${title} video player`
          }
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
);

export default DetailPlayer;
