import React from "react";
import FilterFields from "./FilterFields";
import { SORT_OPTIONS, TYPE_OPTIONS } from "../../constants/discover";

const DiscoverControls = ({
  selectedType,
  selectedSort,
  selectedGenres,
  genres,
  appliedFilters,
  filterOptions,
  activeFilterCount,
  activeFilters,
  filterSheetOpen,
  sheetTriggerRef,
  onSelectType,
  onSelectSort,
  onToggleGenre,
  onClearGenres,
  onOpenFilters,
  onFilterChange,
  onRemoveFilter,
  onClearFilters,
}) => (
  <>
    <section className="discover-sticky-controls" aria-label="Browse titles">
      <div
        className="discover-control-row"
        role="group"
        aria-label="Choose media type"
      >
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`discover-type-chip${selectedType === option.value ? " is-active" : ""}`}
            aria-pressed={selectedType === option.value}
            onClick={() => onSelectType(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div
        className="discover-sort-row"
        role="group"
        aria-label="Sort results"
      >
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`discover-sort-chip${selectedSort === option.value ? " is-active" : ""}`}
            aria-pressed={selectedSort === option.value}
            onClick={() => onSelectSort(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>

    <section className="discover-type-controls" aria-label="Filter by genre">
      <div
        className="discover-genre-row"
        role="group"
        aria-label="Filter by genre"
      >
        <button
          type="button"
          className={`discover-genre-chip${!selectedGenres.length ? " is-active" : ""}`}
          aria-pressed={!selectedGenres.length}
          onClick={onClearGenres}
        >
          All genres
        </button>
        {genres.map((genre) => (
          <button
            type="button"
            key={genre.id}
            className={`discover-genre-chip${selectedGenres.includes(genre.name) ? " is-active" : ""}`}
            aria-pressed={selectedGenres.includes(genre.name)}
            onClick={() => onToggleGenre(genre.name)}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </section>

    <section className="discover-filter-controls" aria-label="Additional filters">
      <div className="discover-filter-desktop">
        <FilterFields
          values={appliedFilters}
          options={filterOptions}
          onChange={onFilterChange}
        />
      </div>
      <button
        ref={sheetTriggerRef}
        className="discover-filter-trigger"
        type="button"
        aria-expanded={filterSheetOpen}
        aria-controls="discover-filter-sheet"
        onClick={onOpenFilters}
      >
        Filters
        {activeFilterCount > 0 && (
          <span
            className="discover-filter-count"
            aria-label={`${activeFilterCount} active filters`}
          >
            {activeFilterCount}
          </span>
        )}
      </button>
    </section>

    {activeFilters.length > 0 && (
      <section className="discover-active-filters" aria-label="Active filters">
        <span>Filtering by</span>
        {activeFilters.map(([name, value]) => (
          <button
            type="button"
            key={`${name}-${value}`}
            className="discover-active-chip"
            onClick={() => onRemoveFilter(name, value)}
            aria-label={`Remove ${name} filter: ${value}`}
          >
            {value}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        <button
          type="button"
          className="discover-clear-filters"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </section>
    )}
  </>
);

export default DiscoverControls;
