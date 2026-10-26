# Frontend redesign decisions

## Phase 1

- Use **Dramaku** as the product wordmark: the repository and current product routes identify the app as Dramaku, while "LUMO" is explicitly a placeholder in the design spec.
- Preserve the existing React Router routes and auth context. Navigation entries for sections that will be implemented in later phases point to their eventual home anchors or existing search route in the meantime.
- Add a strict TypeScript compiler configuration with JavaScript interop enabled so the frontend can migrate incrementally without rewriting the CMS and auth flows prematurely.
- Use CSS scroll-native layout and CSS variables for this phase; introduce Embla only when the carousels are implemented.

## Phase 4

- Until dedicated trending, watch-history, and latest-release feeds are available, use explicitly labeled preview fixtures from `client/src/mocks/` in development only. Production shows honest empty states rather than presenting catalog order or invented watch progress as real data.
- Implement the Trending Today loop with native horizontal scrolling, scroll snap, and three repeated item sets. This keeps swipe as the primary gesture and avoids adding a carousel dependency for one carousel.
- Keep Continue Watching hidden unless the user is authenticated and watch-history items exist; the current preview fixtures demonstrate the logged-in presentation only.

## Phase 5

- Build Anime and genre results only from the existing `/movies` catalog and `/api/genres` responses. Filter locally so selecting genres does not create unnecessary requests; do not imply popularity or rank without API-provided ranking data.
- Treat anime and TV classification as present only when the catalog provides a matching type or genre. Do not infer studios, episode counts, or other unsupported metadata.
- Keep genre browsing as native horizontal scroll/snap with swipe on touch devices and accessible arrow controls on desktop; no carousel dependency is needed for these simple rows.
- Omit social links until official account URLs are supplied. Keep the required TMDB attribution in the shared footer.

## Phase 6

- Build Discover from the existing catalog and genre APIs, and keep sort/filter state in the URL so selections can be shared and restored.
- Use the existing search and suggestion endpoints for submitted terms and live suggestions. Apply client-side genre/type/metadata filters only to values actually returned by the API; unavailable language or country metadata disables those controls instead of inventing choices.
- Derive filter options from the loaded catalog. Progressive result rendering is client-side until the backend provides pagination; do not simulate loading delays or fabricate result counts.
- Support the existing Anime navigation query as a distinct type filter when the API identifies Anime by media type or genre.
- Use a mobile filter sheet with keyboard dismissal, focus return/trapping, and explicit Apply/Reset; desktop uses inline filters.
- Render the homepage hero from `/movies/featured` when available and fall back to actual trending-feed items when that endpoint is empty or unavailable; do not let a failed optional feed remove the whole hero.
- Use neutral translucent white glass surfaces rather than opaque blue fills. Prefer API-provided poster palette metadata and retain image sampling as a CORS-permitted fallback.
