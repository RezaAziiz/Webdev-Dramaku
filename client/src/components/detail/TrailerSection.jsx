import React from "react";

const TrailerSection = ({ videoId, title }) => {
  if (!videoId) return null;

  return (
    <section
      className="detail-section"
      id="detail-trailer"
      aria-labelledby="trailer-title"
    >
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
  );
};

export default TrailerSection;
