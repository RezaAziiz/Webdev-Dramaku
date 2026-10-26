import React from "react";
import { TMDB_BACKDROP_SIZE, tmdbImageUrl } from "../../lib/media";
import SelectMenu from "../ui/SelectMenu";

const EpisodeList = ({
  isTv,
  seasons,
  selectedSeason,
  episodes,
  episodesLoading,
  episodesError,
  selectedEpisode,
  posterUrl,
  onSelectSeason,
  onPlayEpisode,
}) => {
  if (!isTv) return null;

  const selectedSeasonInfo = seasons.find(
    (season) => Number(season.season_number) === selectedSeason,
  );

  return (
    <section className="detail-section" aria-labelledby="episodes-title">
      <div className="detail-section-heading">
        <div>
          <span className="detail-eyebrow">
            {selectedSeasonInfo?.episode_count
              ? `Season ${selectedSeason} · ${selectedSeasonInfo.episode_count} episodes`
              : `Season ${selectedSeason}`}
          </span>
          <h2 id="episodes-title">Episodes</h2>
        </div>
        {seasons.length > 0 && (
          <SelectMenu
            className="detail-season-select"
            ariaLabel="Choose season"
            value={selectedSeason}
            options={seasons.map((season) => ({
              key: String(season.id || season.season_number),
              value: Number(season.season_number),
              label: season.name || `Season ${season.season_number}`,
            }))}
            onChange={(seasonNumber) => onSelectSeason(Number(seasonNumber))}
          />
        )}
      </div>

      {episodesLoading && (
        <p className="detail-empty" role="status">
          Loading episodes…
        </p>
      )}
      {episodesError && (
        <p className="detail-empty" role="alert">
          {episodesError}
        </p>
      )}
      {!episodesLoading && !episodesError && episodes.length > 0 && (
        <div className="detail-episode-list">
          {episodes.map((episode) => {
            const isSelected =
              Number(episode.episode_number) === selectedEpisode;
            const stillUrl = episode.still_path
              ? tmdbImageUrl(episode.still_path, TMDB_BACKDROP_SIZE)
              : posterUrl;

            return (
              <article
                className={`detail-episode${isSelected ? " is-selected" : ""}`}
                key={episode.id || episode.episode_number}
              >
                <button
                  type="button"
                  className="detail-episode-select"
                  onClick={() => onPlayEpisode(Number(episode.episode_number))}
                  aria-label={`Play episode ${episode.episode_number}: ${episode.name || "Untitled episode"}`}
                  aria-current={isSelected ? "true" : undefined}
                >
                  <span className="detail-episode-art">
                    {stillUrl && <img src={stillUrl} alt="" loading="lazy" />}
                    <span className="detail-episode-number">
                      E{episode.episode_number}
                    </span>
                  </span>
                  <span className="detail-episode-copy">
                    <span className="detail-eyebrow">
                      Episode {episode.episode_number}
                    </span>
                    <strong>
                      {episode.name || `Episode ${episode.episode_number}`}
                    </strong>
                    <span className="detail-episode-meta">
                      {[
                        episode.air_date,
                        Number(episode.runtime) > 0
                          ? `${episode.runtime} min`
                          : null,
                        Number(episode.vote_average) > 0
                          ? `★ ${Number(episode.vote_average).toFixed(1)}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {episode.overview && (
                      <span className="detail-episode-overview">
                        {episode.overview}
                      </span>
                    )}
                  </span>
                  <span className="detail-episode-play" aria-hidden="true">
                    ▶
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      )}
      {!episodesLoading && !episodesError && episodes.length === 0 && (
        <p className="detail-empty">
          Episode information is not available for this season.
        </p>
      )}
    </section>
  );
};

export default EpisodeList;
