import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getMovieDetails, getSeasonDetails } from "../services/movieService";
import { buildPlayerSrc, getTitle } from "../lib/detail";
import { tmdbImageUrl } from "../lib/media";
import DetailPlayer from "../components/detail/DetailPlayer";
import SelectMenu from "../components/ui/SelectMenu";

const Watch = () => {
  const { id, mediaType } = useParams();
  const [searchParams] = useSearchParams();
  const isTv = mediaType === "tv";
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [selectedSeason, setSelectedSeason] = useState(
    Number(searchParams.get("season")) || 1,
  );
  const [selectedEpisode, setSelectedEpisode] = useState(
    Number(searchParams.get("episode")) || null,
  );
  const [episodes, setEpisodes] = useState([]);
  const [episodesError, setEpisodesError] = useState("");
  const [episodesLoading, setEpisodesLoading] = useState(false);

  useEffect(() => {
    let current = true;
    setMovie(null);
    setError("");

    if (!id || !["movie", "tv"].includes(mediaType)) {
      setError("This player link is invalid.");
      return () => {
        current = false;
      };
    }

    getMovieDetails(mediaType, id)
      .then((details) => {
        if (!current) return;
        setMovie(details);
        const seasons = Array.isArray(details?.seasons)
          ? details.seasons.filter((season) => Number(season.season_number) > 0)
          : [];
        const requestedSeason = Number(searchParams.get("season"));
        const season =
          seasons.find(
            (entry) => Number(entry.season_number) === requestedSeason,
          ) || seasons[0];
        if (season) setSelectedSeason(Number(season.season_number));
      })
      .catch(() => {
        if (current) setError("Could not load this title for playback.");
      });

    return () => {
      current = false;
    };
  }, [id, mediaType, searchParams]);

  const seasons = useMemo(
    () =>
      Array.isArray(movie?.seasons)
        ? movie.seasons.filter((season) => Number(season.season_number) > 0)
        : [],
    [movie],
  );

  useEffect(() => {
    if (!isTv || !id || !movie) {
      setEpisodes([]);
      setEpisodesLoading(false);
      setEpisodesError("");
      return undefined;
    }

    let current = true;
    setEpisodesLoading(true);
    setEpisodesError("");
    getSeasonDetails(id, selectedSeason)
      .then((data) => {
        if (!current) return;
        const seasonEpisodes = Array.isArray(data?.episodes) ? data.episodes : [];
        setEpisodes(seasonEpisodes);
        setSelectedEpisode((selected) =>
          seasonEpisodes.some(
            (episode) => Number(episode.episode_number) === selected,
          )
            ? selected
            : Number(seasonEpisodes[0]?.episode_number) || null,
        );
      })
      .catch(() => {
        if (!current) return;
        setEpisodes([]);
        setEpisodesError("Episode information is currently unavailable.");
      })
      .finally(() => {
        if (current) setEpisodesLoading(false);
      });

    return () => {
      current = false;
    };
  }, [id, isTv, movie, selectedSeason]);

  const playerSrc = movie
    ? buildPlayerSrc({
        isTv,
        id,
        selectedSeason,
        selectedEpisode,
      })
    : null;
  const ambientPoster = movie?.poster_path
    ? tmdbImageUrl(movie.poster_path, "w780")
    : "";

  return (
    <main className="watch-page">
      {ambientPoster && (
        <img
          className="watch-page-ambient"
          src={ambientPoster}
          alt=""
          aria-hidden="true"
        />
      )}
      <Link
        className="watch-back-link"
        to={`/movies/${mediaType}/${encodeURIComponent(id || "")}`}
      >
        ← Back to title
      </Link>
      <header className="watch-page-heading">
        <span className="detail-eyebrow">{isTv ? "Series" : "Movie"}</span>
        <h1>
          {movie ? getTitle(movie) : error ? "Player unavailable" : "Loading…"}
        </h1>
      </header>

      {error ? (
        <p className="detail-empty" role="alert">
          {error}
        </p>
      ) : (
        <>
          {isTv && seasons.length > 0 && (
            <div className="watch-page-controls">
              <SelectMenu
                className="detail-season-select"
                ariaLabel="Choose season"
                value={selectedSeason}
                options={seasons.map((season) => ({
                  key: String(season.id || season.season_number),
                  value: Number(season.season_number),
                  label: season.name || `Season ${season.season_number}`,
                }))}
                onChange={(seasonNumber) => {
                  setSelectedSeason(Number(seasonNumber));
                  setSelectedEpisode(null);
                }}
              />
            </div>
          )}

          {isTv && episodesLoading && (
            <p className="detail-empty" role="status">
              Loading episodes…
            </p>
          )}
          {isTv && episodesError && (
            <p className="detail-empty" role="alert">
              {episodesError}
            </p>
          )}
          {isTv && !episodesLoading && episodes.length > 0 && (
            <div
              className="watch-episode-picker"
              role="group"
              aria-label="Choose episode"
            >
              {episodes.map((episode) => {
                const episodeNumber = Number(episode.episode_number);
                return (
                  <button
                    type="button"
                    key={episode.id || episodeNumber}
                    className={episodeNumber === selectedEpisode ? "is-active" : ""}
                    aria-pressed={episodeNumber === selectedEpisode}
                    onClick={() => setSelectedEpisode(episodeNumber)}
                  >
                    {episodeNumber}. {episode.name || `Episode ${episodeNumber}`}
                  </button>
                );
              })}
            </div>
          )}

          {movie && (
            <DetailPlayer
              isTv={isTv}
              selectedSeason={selectedSeason}
              selectedEpisode={selectedEpisode}
              playerSrc={playerSrc}
              title={getTitle(movie)}
            />
          )}
        </>
      )}
    </main>
  );
};

export default Watch;
