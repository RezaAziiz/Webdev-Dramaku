import React from "react";
import MediaCard from "./MediaCard";

const DiscoverResults = ({
  term,
  filteredItems,
  visibleItems,
  hasMore,
  loadingMore,
  catalogLoading,
  searchLoading,
  canRenderResults,
  catalogError,
  searchError,
  genresError,
  paginationError,
  activeFilterCount,
  selectedType,
  selectedSort,
  loadMoreRef,
  onRetry,
  onLoadMore,
  onEmptyAction,
}) => {
  const isFiltered =
    activeFilterCount > 0 ||
    selectedType !== "movie" ||
    selectedSort !== "relevance";
  const emptyActionLabel = term
    ? "Clear search"
    : isFiltered
      ? "Reset filters"
      : "Retry catalog";

  return (
    <section className="discover-results" aria-labelledby="results-title">
      <div className="discover-results-heading">
        <h2 id="results-title">Titles</h2>
        {!catalogLoading && !searchLoading && canRenderResults && (
          <p aria-live="polite">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "title" : "titles"}
          </p>
        )}
      </div>

      {(catalogError || searchError || genresError) && (
        <div className="discover-error" role="alert">
          <p>
            {[catalogError, searchError, genresError].filter(Boolean).join(" ")}
          </p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {(catalogLoading || searchLoading) && (
        <div className="discover-grid" aria-label="Loading titles">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="discover-card discover-card-skeleton skeleton-card"
              aria-hidden="true"
            >
              <span />
              <div>
                <i />
                <i />
              </div>
            </div>
          ))}
        </div>
      )}

      {paginationError && (
        <div className="discover-error" role="alert">
          <p>{paginationError}</p>
          <button type="button" onClick={onLoadMore}>
            Retry
          </button>
        </div>
      )}

      {!catalogLoading && !searchLoading && canRenderResults ? (
        filteredItems.length > 0 ? (
          <>
            <div className="discover-grid">
              {visibleItems.map((movie, index) => (
                <MediaCard
                  key={`${movie.type || "media"}-${movie.id ?? `${movie.title}-${index}`}`}
                  movie={movie}
                />
              ))}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="discover-load-sentinel"
                  aria-hidden="true"
                />
              )}
            </div>
            {hasMore && (
              <button
                type="button"
                className="discover-load-more"
                onClick={onLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        ) : (
          <div className="discover-empty">
            <h3>{term ? "No matching titles" : "No titles to show"}</h3>
            <p>
              {term
                ? "Try a different search or remove some filters."
                : "The catalog has no titles matching these filters."}
            </p>
            <button type="button" onClick={onEmptyAction}>
              {emptyActionLabel}
            </button>
          </div>
        )
      ) : null}
    </section>
  );
};

export default DiscoverResults;
