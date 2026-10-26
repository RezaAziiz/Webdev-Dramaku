import React from "react";
import SelectMenu from "../ui/SelectMenu";

const FilterFields = ({ values, options, onChange }) => (
  <div className="discover-filter-fields">
    <div className="discover-filter-field">
      <span>Year</span>
      <SelectMenu
        ariaLabel="Year"
        value={values.year}
        disabled={!options.years.length}
        onChange={(year) => onChange("year", year)}
        options={[
          { value: "", label: "Any year" },
          ...options.years.map((year) => ({
            value: String(year),
            label: String(year),
          })),
        ]}
      />
    </div>
    <div className="discover-filter-field">
      <span>Language</span>
      <SelectMenu
        ariaLabel="Language"
        value={values.language}
        onChange={(language) => onChange("language", language)}
        options={[
          { value: "", label: "Any language" },
          ...options.languages.map((language) => ({
            value: language,
            label: language,
          })),
        ]}
      />
    </div>
    <div className="discover-filter-field">
      <span>Minimum rating</span>
      <SelectMenu
        ariaLabel="Minimum rating"
        value={values.rating}
        onChange={(rating) => onChange("rating", rating)}
        options={[
          { value: "", label: "Any rating" },
          ...[5, 7, 8, 9].map((rating) => ({
            value: String(rating),
            label: `TMDB ${rating}+`,
          })),
        ]}
      />
    </div>
    <div className="discover-filter-field">
      <span>Country</span>
      <SelectMenu
        ariaLabel="Country"
        value={values.country}
        onChange={(country) => onChange("country", country)}
        options={[
          { value: "", label: "Any country" },
          ...options.countries.map((country) => ({
            value: country,
            label: country,
          })),
        ]}
      />
    </div>
  </div>
);

export default FilterFields;
