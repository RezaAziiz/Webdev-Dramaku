# Frontend redesign decisions

## Phase 1

- Use **Dramaku** as the product wordmark: the repository and current product routes identify the app as Dramaku, while "LUMO" is explicitly a placeholder in the design spec.
- Preserve the existing React Router routes and auth context. Navigation entries for sections that will be implemented in later phases point to their eventual home anchors or existing search route in the meantime.
- Add a strict TypeScript compiler configuration with JavaScript interop enabled so the frontend can migrate incrementally without rewriting the CMS and auth flows prematurely.
- Use CSS scroll-native layout and CSS variables for this phase; introduce Embla only when the carousels are implemented.
