# LUMO — Frontend Redesign Spec (Mobile-First)

> Replace "LUMO" with the final app name. Reference images live in `/design/`:
> `Hero.png` (full-page desktop mock) and, if available, `/design/mobile/*.png` (390px frames).
> The images are the source of truth for layout, spacing and visual hierarchy.
> Where this document and an image disagree, **THIS DOCUMENT WINS** (deviations are listed explicitly).
> Sample exact colors, sizes and spacing from the images instead of guessing.

---

## 1. Principles

1. **Mobile first.** Write base styles for 390px, then enhance upward with `min-width` breakpoints
   (sm 640, md 768, lg 1024, xl 1280, 2xl 1440). Never write desktop styles and patch them down.
   The desktop image is only the large-screen target; mobile layouts are defined in this document.
2. **Dark, cinematic glassmorphism** with ONE adaptive accent color.
3. **The whole page palette adapts** to the title currently shown in the hero (section 4).
4. **Real data only.** Never display claims the data source cannot back up (section 7).
5. **No ranking numbers anywhere** (no "#1", no big outlined digits, no "Top 10" wording).
6. **Swipe is the primary gesture** for every carousel; no feature may depend on hover.

---

## 2. Scope and rules for the rewrite

- The existing frontend is legacy. Components, styles, layouts and route structure may be rewritten,
  replaced, renamed, moved or deleted. Keep only what works and is worth keeping (auth flow behavior,
  API client, sensible routing).
- Do NOT change backend code or API contracts. If the design needs data the API does not return,
  create a typed adapter/mapper layer, use mock data in `/mocks`, and record the needed backend
  changes in `docs/BACKEND_TODO.md`.
- Ambiguities: choose the most reasonable option, record it in `docs/DECISIONS.md`, and continue.
  Ask only when a decision would be expensive to undo.

---

## 3. Design tokens

Define as CSS variables on the app root wrapper and wire them into the Tailwind theme.
No hardcoded colors outside tokens.

| Token | Value |
|---|---|
| `--bg-base` | very dark navy (sample from image, approx `#0A1428`) |
| `--tint` | adaptive: dominant color of the current hero backdrop, darkened |
| `--accent` | adaptive: brightened/saturated variant of tint (default Deep Teal `#0D9488`) |
| `--accent-soft` | accent at ~15% alpha (chips, hover fills) |
| `--glass-bg` | `rgba(255,255,255,0.04)` to `0.08` |
| `--glass-border` | `rgba(255,255,255,0.08)` |
| `--text-primary` / `--text-secondary` / `--text-muted` | white / ~70% / ~45% alpha |

- **Radius:** cards 16px, panels 20–24px, buttons and chips fully rounded (pill).
- **Typography:** match the image. If the font cannot be identified, use Plus Jakarta Sans or Manrope
  for UI and a bold wide geometric weight for hero titles. Uppercase tracked micro-labels
  (10–11px, letter-spacing ~0.12em) for eyebrows and badges.
- **Fluid type:** use `clamp()`. Hero title scales from about 32px (mobile) to 64px (desktop).
- **Spacing:** page side padding 16px mobile, 24px tablet, 72px desktop (match the image).

---

## 4. Adaptive palette system (core feature)

- **Source:** dominant color of the CURRENT hero slide's backdrop image.
- **Computation:** server-side (e.g. node-vibrant or colorthief). The API returns
  `palette: { dominant, tint, accent }` with the title data, cached with the title in Redis
  (long TTL). Frontend fallbacks, in order: compute in the browser via canvas (if CORS allows),
  then the default teal.
- **Normalization before use:** keep the background dark (lightness capped around 18%). Adjust the
  accent so text on dark surfaces has contrast >= 4.5:1 and UI elements >= 3:1.
- **Application:** set the variables on the ROOT wrapper (not only inside the hero) with a 400–800ms
  ease transition. Page background = soft gradient from `--tint` at the top fading into `--bg-base`,
  plus a blurred ambient glow behind the hero.
- Everything accent-colored uses `--accent`: active nav item, primary button, progress bars, badges,
  links/arrows, genre "SHOWING" border, focus rings.
- The palette follows ONLY the active hero slide (not hovered cards, not the trending carousel).
- **Mobile:** lower glow intensity, no large blur radii (cheaper to render). Reduced motion: change instantly.
- The "Adaptive Palette" chip in the mock is a design annotation. Render it only behind a dev flag.

---

## 5. Glass rules

- Surface = `--glass-bg` + 1px `--glass-border` + subtle inner highlight on the top edge.
- `backdrop-filter` ONLY on: navbar/bottom bar, sheets/overlays, and the hero info panel.
  Do NOT blur every card (performance). Use plain semi-transparent fills elsewhere.
- Provide a solid fallback background where `backdrop-filter` is unsupported.
- Hover effects (lift 4px, soft accent glow) only inside `@media (hover: hover)`.
  Touch devices get pressed/active states instead.

---

## 6. Global mobile and performance rules

- Test at 360, 390, 430, then 768, then 1440. No horizontal page scroll at any width
  (only inside carousels).
- Use `dvh` (not `vh`) for full-height sections; respect `env(safe-area-inset-*)`;
  set `viewport-fit=cover`.
- Touch targets >= 44x44px, spacing between tappable items >= 8px.
- Carousels: CSS scroll-snap or Embla with touch drag; `touch-action: pan-y` to avoid hijacking
  vertical scroll; arrow buttons hidden below `md`, shown from `md` on hover-capable devices.
- Images: responsive `srcset` using TMDB sizes (w300 / w500 / w780 / w1280), fixed `aspect-ratio`
  on every image (no layout shift), lazy-load below the fold, priority-load only the hero image.
- No autoplay video or sound on mobile, with reduced-motion, or on data saver.
- Targets: Lighthouse mobile Performance >= 85, CLS < 0.1, LCP < 2.5s on throttled 4G.

---

## 7. Data mapping (do not fabricate)

| Mock element | Source | Rule |
|---|---|---|
| "98% Match" | TMDB `vote_average` | Show as "TMDB 9.1" or "91%"; never call it a match score |
| 4K / IMAX / Dolby / FLAC / 10-bit / 5.1 badges | none | Remove |
| Age rating, runtime | TMDB details (+ `release_dates` / `content_ratings`) | Show if present |
| "Added Yesterday" | none | Use release / air date |
| Sub/Dub, studio | AniList or TMDB production companies | Show only if available |
| "N titles" per genre | none (TMDB totals are huge) | Remove |
| Continue Watching progress | `watch_history` + progress fields | Needs backend change (position, duration); fallback without bar |
| Status badges (PREMIERE / NEW SEASON / SIMULCAST) | release date, season number | Only when derivable; otherwise omit |
| Trending cards | TMDB trending endpoints | Show type badge, year, rating (NOT progress bars or "left" badges) |

If the API doesn't return something the design needs, don't invent it. Use the adapter layer and
log the gap in `docs/BACKEND_TODO.md`.

---

## 8. Sections

Each section lists the **mobile base (390px)** first, then enhancements for larger screens.

### 8.1 Navigation

**Mobile (base)**
- Top bar: logo left; search and avatar right. Transparent over the hero, turns glass on scroll.
- Fixed bottom tab bar (glass, safe-area padded): Home, Movies, TV, Anime, Library/Profile.
  Active tab uses `--accent`. "Trending" and "Browse" live inside Home and the Discover page.
- Search: full-screen overlay, autofocus input, recent searches, live suggestions with poster thumbnails.
- All pages need bottom padding equal to the tab bar height plus the safe area.

**lg and up**
- Replace the bottom bar with the floating glass pill navbar (centered, ~16px from top, stays visible
  on scroll with stronger blur): logo, Home (active = filled accent pill), Movies, Trending, TV Shows,
  Anime, Browse (dropdown), then search, filters, notifications (dot indicator), avatar.

### 8.2 Hero

**Mobile (base)**
- Full-width backdrop about 70dvh, text overlaid at the bottom over a strong gradient.
- Order: chips (max 2), title (last words highlighted in `--accent`), meta row (rating, year, age
  rating, runtime), synopsis clamped to 2 lines, then one row of buttons:
  "Play Now" (flex-1, filled accent) + bookmark icon button + info icon button.
- Swipe to change slides; segmented progress under the buttons.
- A compact horizontal strip of small "up next" thumbnails below the hero (tap to jump).
- No background trailer, no sound button.

**md and up**
- Left: chips, large title, meta row, 3-line synopsis, buttons: "Play Now" (filled accent),
  "Details" (glass outline), circular mute button ONLY if a trailer plays (otherwise omit).
- Right: "UP NEXT" panel with countdown chip, prev/next arrows, a vertical list of the next 3 slides
  (thumbnail, "SPOTLIGHT 0X" label, title, meta line) and segmented progress bars underneath.
- Auto-advance about 15s; pause on hover/focus; honor `prefers-reduced-motion`.
- Clicking an item in Up Next jumps to that slide. Changing slides changes the page palette (section 4).

### 8.3 Continue Watching (logged-in users only; hide the section otherwise)

**Mobile (base):** horizontal swipe row; cards ~78% of viewport width so the next one peeks;
"Xm left" badge, thin accent progress bar at the bottom, title, "S2 · E5: name" line;
kebab menu opens a bottom sheet (remove from list). Header shows "N in progress" and "View All Library".

**lg and up:** 4 landscape cards in a row as in the image; kebab opens a small popover.
If progress data is unavailable, show "Continue S2 E5" without the bar.

### 8.4 Trending Today (carousel with a larger center card)

**Behavior (all sizes)**
- Landscape (16:9) cards in a **looping** carousel. The **ACTIVE CARD IS CENTERED AND LARGER**.
- Scale and opacity by distance from center: center 1.0 / 1.0; direct neighbors ~0.85–0.88 / ~0.6–0.7;
  outer cards ~0.72 / ~0.45. All vertically centered, smooth scale/opacity tween while dragging
  (Embla Carousel with a scale-tween approach, or equivalent).
- The center card shows extra info: title, genres, rating, Play + bookmark. Side cards show image + title only.
- Tap/click a side card to center it; tap/click the center card to open details.
- Autoplay off by default.
- Header: flame icon, title "Trending Today", subtitle "Most-watched right now"
  (DEVIATION from mock: no "Top 10"), optional "Today | This week" toggle.
- Cards show type badge (MOVIE/SERIES), year and rating. NOT progress bars or "left" badges
  (the mock reuses Continue Watching cards here as a placeholder).

**Mobile (base)**
- Active card ~78% of viewport width (16:9); neighbors peek ~11% each side at scale 0.88 / opacity 0.6.
- Swipe, snap to center. Hide arrow buttons; show pagination dots (max 5 visible) below.

**md:** 3 cards visible. **lg and up:** desktop layout from the image with arrow buttons in the header.

### 8.5 Just Added

- Header + filter chips (All / Movies / Series), horizontally scrollable on mobile.
- Large glass cards: image with top-left status badge, category eyebrow, rating, title,
  2-line description, footer meta, circular play button.
- Status badges only when derivable from data; no technical badges (4K, Atmos, etc.).

**Mobile (base):** single-column stack, full-width cards (or a horizontal snap row if the page
gets too long). **md:** 2 columns. **lg and up:** 3 columns as in the image.

### 8.6 Popular Anime

- Header with the Japanese label and an "Explore Anime Hub" link.
- Portrait cards: top badges (episode/season/type), bottom gradient overlay with genre eyebrow,
  title, studio and rating.

**Mobile (base):** horizontal snap row, ~2.3 cards visible (cards ~42% of viewport width).
**md:** 4 visible. **lg and up:** 5 as in the image.

### 8.7 Browse by genre (two linked carousels)

- Header: eyebrow "FIND YOUR MOOD", title, "Movies | TV Shows" toggle, "Browse <Genre> ↗" pill.
- **Row 1 (genres):** single horizontally scrollable row. The active card has an accent border,
  glow and "SHOWING" badge. Show a partial card at the right edge. Drag / snap / fade masks.
  Per-genre eyebrow taglines (ADRENALINE, QUESTS, FUTURE COSMOS, MASTERPIECE...) are a static copy map.
  Do NOT show title counts.
- **Row 2 (results):** exactly ONE scrollable row of landscape cards for the selected genre. Header line
  with a colored dot, "<Genre> · Movies" and "View all" (also an end-of-row card). Shimmer skeleton while
  loading; cancel stale requests when the genre changes; keep previous results dimmed during loading.

**Mobile (base):** toggle and "Browse <Genre>" pill move under the title, full width. Genre cards
~140x88px, ~2.5 visible; tapping a genre scrolls it into view and loads its results. Result cards ~80%
width (~1.2 visible). Arrow buttons hidden.
**md and up:** larger cards (~310x195 for genres, ~490x275 for results), arrow buttons on hover devices.

### 8.8 Discover / Search page

- Header: huge two-line title that reflects the active sort and type, Movies/TV toggle, Reset,
  wide search input with live suggestions (poster, title, year, type badge).
- Sticky sort chips, scrollable genre chips, four filters (year, language, rating, country),
  active-filter chips ("FILTERING BY"), result counter, a large featured card for the first result,
  then the results grid. Filters live in the URL query string.

**Mobile (base):** search pinned at top; chips as horizontal scroll rows; the four filters collapse
into one "Filters" button (with an active-count badge) opening a bottom sheet with Apply and Reset;
results as a 2-column grid; infinite scroll with a skeleton row; compact featured card.
**md and up:** 3–4 columns; **lg and up:** 6 columns and the inline filter panel.

### 8.9 Footer

Logo, links, social icons, TMDB attribution (required):
"This product uses the TMDB API but is not endorsed or certified by TMDB."
Replace placeholder company text with the app's own name.
**Mobile:** links in two columns, icons centered, bottom padding so the tab bar never covers it.

---

## 9. States and accessibility

- Loading skeletons for every section; empty and error states with a retry action.
- Visible focus rings in `--accent`; carousels have `aria-roledescription="carousel"` and labeled slides;
  alt text on images; keyboard arrows for carousels.
- `prefers-reduced-motion`: no autoplay, no large transitions, instant palette change.
- WCAG AA contrast for text on adaptive backgrounds (re-check after every palette computation).
- Light theme is out of scope unless requested.

---

## 10. Acceptance checklist

- [ ] Works at 360, 390, 430, 768 and 1440 with no horizontal page scroll
- [ ] All tap targets >= 44px; nothing depends on hover
- [ ] Bottom tab bar respects safe areas and never hides content; pill navbar appears from lg
- [ ] Page palette changes smoothly with the hero slide and stays readable
- [ ] Trending carousel: center card clearly larger, loops, swipe + tap-to-center work
- [ ] Genre row and results row scroll horizontally; switching genre updates results without flicker
- [ ] No fabricated badges, numbers or percentages; no ranking numbers anywhere
- [ ] Logged-out users never see Continue Watching
- [ ] Lighthouse mobile Performance >= 85, CLS < 0.1, LCP < 2.5s on throttled 4G
- [ ] Lint, typecheck and build pass; no leftover dead components or styles
