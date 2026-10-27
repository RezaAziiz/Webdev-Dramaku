import React from "react";

const DetailPlayer = ({
  isTv,
  selectedSeason,
  selectedEpisode,
  playerSrc,
  title,
}) => (
  <section
    className="detail-section detail-player-section"
    aria-labelledby="watch-title"
  >
    <div className="detail-section-heading">
      <div>
        {isTv && selectedEpisode !== null && (
          <span className="detail-eyebrow">
            Season {selectedSeason} · Episode {selectedEpisode}
          </span>
        )}
        <h2 id="watch-title">Watch</h2>
      </div>
    </div>
    {playerSrc ? (
      <>
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
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          />
        </div>
        <a className="detail-player-fallback" href={playerSrc}>
          If playback is unavailable, open the player directly
        </a>
      </>
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
