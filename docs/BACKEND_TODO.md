# Backend TODO

The frontend redesign needs a few product fields that the current API contract does not reliably provide.

## Required additions

1. `GET /api/trending`
   - Returns a curated list of featured titles for the hero and trending row.
   - Required fields: `id`, `title`, `images`, `description`, `year`, `rating`, `type`, `genre`.
   - For sharp full-bleed hero artwork, include a landscape `backdrop_path` or high-resolution `backdrop` URL when available; retain `images` as the poster/fallback image.

2. `GET /api/watch-history`
   - Returns the user's continue-watching list.
   - Required fields: `id`, `title`, `images`, `episode`, `progress`, `duration`, `year`, `rating`.

3. `GET /api/just-added`
   - Returns newest releases sorted by `released_at` or `created_at`.
   - Required fields: `id`, `title`, `images`, `description`, `year`, `rating`, `type`, `genre`.

4. Enrich the existing `/movies` and `/api/genres` responses
   - The frontend currently filters the available `/movies` catalog locally by its `genre` values and the existing `id`/`name` genre fields.
   - Provide a reliable media `type` (movie, TV/series, or anime) and stable genre identifiers/names so Anime and Movie/TV filters can be accurate.
   - If the catalog grows beyond what should be fetched for local filtering, add a genre-filtered catalog endpoint rather than making the client download every title.
   - If the section should be labeled "Popular Anime", provide an explicit popularity/curation signal or ordered feed; catalog order alone is not enough to substantiate popularity.
   - Studio, season/episode counts, and other descriptive fields should be added only if the product intends to display them; the frontend does not infer them.

5. Palette metadata for hero backgrounds
   - Optional but recommended: `palette: { dominant, tint, accent }`, computed once per title and cached.
   - This lets the frontend update the page background without browser-side image sampling.
   - The frontend uses valid hex values from this metadata when present. Cross-origin poster images may block canvas sampling, so metadata is required for consistently adaptive page colors.

6. Discover/search scalability and metadata
   - The current frontend uses `/movies`, `/api/genres`, `/api/search?term=...`, and `/suggestions?term=...`; the existing API contracts are unchanged.
   - Add a paginated Discover endpoint when client-side progressive rendering is no longer suitable. It should accept term, type, genre, year, language, minimum rating, country, sort, and page/cursor parameters, returning total or `hasMore` metadata.
   - Return stable media type, genre names/IDs, release year/date, rating, language, country, poster, and synopsis fields where available so the filters and suggestion rows can be complete.
   - Define the suggestion response shape and include `id`, `title`, `images`, `year`, and `type` only when those values exist.

7. Account-bound genre preferences
   - Extend the registration contract to optionally accept genre IDs from `GET /api/genres`.
   - Persist those preferences on the account and expose them to the authenticated client for recommendations.
   - Until this is available, registration preferences are stored locally per email address and are not synced between devices or used as an account setting.

## Notes

- Do not fabricate `Match`, `left`, `top`, or ranking-style values in the frontend.
- Keep the existing movie and auth routes unchanged while the new fields are added.
- The existing `/movies` feed is not a reliable source for trending order, watch progress, or release recency, so the frontend does not present it as those feeds.
- `/movies` currently does not guarantee popularity ordering; the frontend labels its matching section "Anime" rather than asserting the titles are popular.
- Discover filter controls derive year, language, and country options from fields present in `/movies`; language/country selectors remain unavailable if the API omits those fields.
- Synthetic preview content is isolated under `client/src/mocks/` and visibly labeled as preview content in development; production displays an explanatory empty state until these feeds exist.
