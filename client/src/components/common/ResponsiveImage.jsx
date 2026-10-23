import React, { useState } from "react";

const DEFAULT_FALLBACK_SRC =
  "https://via.placeholder.com/400x600?text=No+Image+Available";

/**
 * Image component that always renders responsively (no fixed pixel width/height)
 * and falls back to a placeholder when `src` is missing or fails to load.
 * This keeps actual image URLs data-driven (from the API/DB) instead of hardcoded.
 */
const ResponsiveImage = ({
  src,
  alt,
  className = "",
  aspectRatioClassName = "aspect-[2/3]",
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  ...imgProps
}) => {
  const [hasErrored, setHasErrored] = useState(false);
  const resolvedSrc = !hasErrored && src ? src : fallbackSrc;

  return (
    <div className={`w-full overflow-hidden ${aspectRatioClassName}`}>
      <img
        src={resolvedSrc}
        alt={alt || "Movie poster"}
        loading="lazy"
        onError={() => setHasErrored(true)}
        className={`w-full h-full object-cover ${className}`}
        {...imgProps}
      />
    </div>
  );
};

export default ResponsiveImage;
