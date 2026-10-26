import React from "react";
import { mediaTypeLabel, tmdbImageUrl } from "../../lib/media";
import { rawYear } from "../../lib/discover";

const DiscoverSearchBar = ({
  term,
  inputValue,
  suggestions,
  suggestionsLoading,
  suggestionsError,
  suggestionIndex,
  searchFormRef,
  searchFieldRef,
  onInputChange,
  onInputKeyDown,
  onSubmit,
  onChooseSuggestion,
  onRetrySuggestions,
}) => {
  const trimmedInput = inputValue.trim();
  const showSuggestions =
    trimmedInput.length >= 2 &&
    trimmedInput !== term &&
    (suggestionsLoading || Boolean(suggestionsError) || suggestions.length > 0);

  return (
    <div className="discover-search-sticky">
      <form
        ref={searchFormRef}
        className="discover-search"
        role="search"
        onSubmit={onSubmit}
      >
        <label className="visually-hidden" htmlFor="discover-search-input">
          Search movies, shows, and anime
        </label>
        <input
          id="discover-search-input"
          ref={searchFieldRef}
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Search titles"
          autoComplete="off"
          role="combobox"
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="discover-suggestions"
          aria-activedescendant={
            suggestionIndex >= 0
              ? `discover-suggestion-${suggestionIndex}`
              : undefined
          }
        />
        <button type="submit">Search</button>
        {showSuggestions && (
          <div className="discover-suggestions">
            {suggestionsLoading && (
              <p className="discover-suggestion-status" role="status">
                Searching suggestions…
              </p>
            )}
            {suggestionsError && (
              <div className="discover-suggestion-error">
                <p role="alert">{suggestionsError}</p>
                <button type="button" onClick={onRetrySuggestions}>
                  Retry
                </button>
              </div>
            )}
            <div
              id="discover-suggestions"
              role="listbox"
              aria-label="Search suggestions"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id ?? `${suggestion.title}-${index}`}
                  id={`discover-suggestion-${index}`}
                  type="button"
                  role="option"
                  aria-selected={suggestionIndex === index}
                  className="discover-suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onChooseSuggestion(suggestion)}
                >
                  {suggestion.poster ? (
                    <img
                      className="discover-suggestion-poster"
                      src={tmdbImageUrl(suggestion.poster, "original")}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span
                      className="discover-suggestion-poster is-empty"
                      aria-hidden="true"
                    />
                  )}
                  <span className="discover-suggestion-copy">
                    <strong>{suggestion.title}</strong>
                    <span className="discover-suggestion-meta">
                      {suggestion.year && <span>{rawYear(suggestion)}</span>}
                      {suggestion.rating !== null && (
                        <span className="discover-suggestion-rating">
                          <span aria-hidden="true">★</span>
                          {Number(suggestion.rating).toFixed(1)}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="discover-suggestion-trailing">
                    <span className="discover-suggestion-type">
                      {mediaTypeLabel(suggestion)}
                    </span>
                    <span className="discover-suggestion-arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default DiscoverSearchBar;
