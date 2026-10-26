import React from "react";
import { createPortal } from "react-dom";
import FilterFields from "./FilterFields";

const FilterSheet = ({
  draftFilters,
  filterOptions,
  sheetRef,
  onClose,
  onChange,
  onReset,
  onApply,
}) =>
  createPortal(
    <div className="discover-filter-overlay">
      <button
        className="discover-filter-backdrop"
        type="button"
        aria-label="Close filters"
        onClick={onClose}
      />
      <section
        id="discover-filter-sheet"
        ref={sheetRef}
        className="discover-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
      >
        <div className="discover-filter-sheet-heading">
          <h2 id="filter-sheet-title">Filters</h2>
          <button type="button" aria-label="Close filters" onClick={onClose}>
            ×
          </button>
        </div>
        <FilterFields
          values={draftFilters}
          options={filterOptions}
          onChange={onChange}
        />
        <div className="discover-filter-sheet-actions">
          <button type="button" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="is-primary" onClick={onApply}>
            Apply filters
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );

export default FilterSheet;
