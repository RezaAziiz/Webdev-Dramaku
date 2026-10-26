export const PLAYER_THEME = "14b8a6";
export const TIMEUPDATE_SAVE_INTERVAL_MS = 15000;

export const getTitle = (movie) =>
  movie.title || movie.name || "Title Not Available";

export const getYear = (movie) =>
  (movie.release_date || movie.first_air_date || "").slice(0, 4);

export const getRuntimeLabel = (movie, isTv) =>
  !isTv && Number(movie.runtime) > 0 ? `${movie.runtime} min` : null;

export const getStudio = (movie, isTv) =>
  isTv
    ? movie.networks?.[0] || movie.production_companies?.[0]
    : movie.production_companies?.[0];

export const getTrailerVideoId = (movie) => {
  const trailer =
    movie.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    ) ||
    movie.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Teaser",
    );
  return trailer?.key;
};

export const buildPlayerSrc = ({
  isTv,
  id,
  selectedSeason,
  selectedEpisode,
}) => {
  const playerQuery = `autoplay=false&theme=${PLAYER_THEME}&download=true&nextbutton=true&episodeselector=true`;

  if (!isTv) {
    return `https://vidrock.net/movie/${id}?${playerQuery}`;
  }
  if (selectedEpisode === null) {
    return null;
  }
  return `https://vidrock.net/tv/${id}/${selectedSeason}/${selectedEpisode}?${playerQuery}`;
};

export const buildDetailFacts = (movie, isTv, runtimeLabel, country) =>
  [
    ["Status", movie.status],
    ["Runtime", runtimeLabel],
    ["Language", movie.original_language?.toUpperCase()],
    ["Country", country],
    ["First aired", movie.first_air_date],
    ["Released", movie.release_date],
    [
      "Seasons",
      isTv && Number(movie.number_of_seasons) > 0
        ? movie.number_of_seasons
        : null,
    ],
    [
      "Episodes",
      isTv && Number(movie.number_of_episodes) > 0
        ? movie.number_of_episodes
        : null,
    ],
  ].filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

export const mapCommentsForDisplay = (comments) =>
  comments.map((comment) => ({
    user: comment.username,
    date: comment.created_at,
    rating: comment.rate,
    text: comment.comment,
  }));
