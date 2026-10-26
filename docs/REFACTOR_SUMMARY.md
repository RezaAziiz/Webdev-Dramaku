# Refactor Handoff — Webdev-Dramaku (Frontend)

## Konteks Proyek
- Stack: React 18 + Vite-less (`react-scripts`), Express + Sequelize-less (raw pg), PostgreSQL via `db.js`, TMDB API, JWT auth, Cloudinary.
- Pemisah: `server/` (Express API) dan `client/` (React SPA).
- Backend **sudah** di-refactor ke layered pattern tahap 1–3 (routes → controllers → services → repositories).
- Frontend refactor Tahap 1–6 **selesai**; TS migration sisanya dinyatakan incremental.

## Status Git Saat Ini
- Revisi refactor belum di-commit; status git akan berubah per tahap — cek `git status` sebelum bekerja.

## Temuan Refactor — Frontend

1. **`client/src/views/home.jsx` (~1.146 baris / ~40KB) — P0 — God Component**
   - Satu komponen mengurus: Trending carousel, Just Added, Continue Watching, Anime, Browse-by-Genre, Genre Results + state save-to-watchlist.
   - **Rencana:** Pecah ke section components + custom hooks (`useTrending`, `useJustAdded`, `useContinueWatching`, `useGenreCatalog`).
   - **Best practice:** Komponen kecil, single responsibility, hook per domain.

2. **`client/src/components/slider.jsx` (~493 baris) — P0**
   - Palette/color utils (hex→rgb, luminance, contrast, canvas sampling) inline di komponen.
   - **Rencana:** Ekstrak ke `client/src/lib/color.ts` + hook `useHeroPalette`.

3. **`client/src/index.css` (~64KB) + `detail.css` + `styles/style.css` + `App.css` — P1**
   - 4 file CSS global, token + section style campur aduk.
   - **Rencana:** Konsolidasi/split per feature atau adopt CSS Modules / Tailwind (config Tailwind sudah ada, belum dipakai).

4. **Migrasi JS ↔ TS & ekstensi tidak konsisten — P1**
   - Partial TS migration sudah ada (`tsconfig` + `allowJs`), tapi komponen utama masih `.js/.jsx`.

5. **`AuthContext` — JWT parsing manual inline — P1**
   - Base64/atob/decodeURIComponent hack di context.
   - **Rencana:** Ekstrak ke util/jwt atau pakai `jwt-decode`, tambah refresh handling.

6. **Views besar lainnya — P2:** `searchResult.jsx` (~42KB), `detail.jsx` (~27KB), `cmsUsers.jsx`.

7. **Services layer** — Sudah relatif bersih (`httpClient` + per-domain service); tingkatkan dengan typed API layer.

## Rencana Refactor (Roadmap)
- Tahap 1 (P0): Pecah `home.jsx` → hooks + section components.
- Tahap 2 (P0): Ekstrak palette/color utils dari `slider.jsx`.
- Tahap 3 (P1): Konsolidasi & split CSS.
- Tahap 4 (P1): Auth util + token handling + TS incremental.
- Tahap 5 (P2): Split views besar, samakan naming/ekstensi.
- Tahap 6 (P2): Test restructure + final lint/typecheck.

## Status Progres
- ✅ **Tahap 1 selesai** — `home.jsx` 1.146 → 68 baris.
  - Hooks baru: `hooks/useTrendingFeed.js`, `useJustAddedFeed.js`, `useContinueWatchingFeed.js`, `useGenreCatalog.js`, `useGenreFeed.js`, `useAnimeFeed.js`.
  - Section baru di `components/sections/`: `TrendingSection.jsx`, `JustAddedSection.jsx`, `ContinueWatchingSection.jsx`, `AnimeSection.jsx`, `BrowseByGenreSection.jsx`.
  - Helper baru: `lib/format.ts` (`getMetaLine`, `getTimeLeft`).
- ✅ **Tahap 2 selesai** — `slider.jsx` 493 → 228 baris.
  - `lib/color.ts` — pure color/palette utils (`clamp`, `hexToRgb`, `rgbToHex`, `mixHex`, `relativeLuminance`, `contrastRatio`, `darkenToLuminanceCap`, `ensureAccentContrast`, `toRgba`, `asHex`, `toHeroImageUrl`, `getImageUrl`, `computePaletteFromImage`, `computeMoviePalette`) + `readDefaultPalette`.
  - `hooks/useHeroPalette.js` — side-effect penerapan palette ke `.app-shell`.
  - `lib/format.ts` ditambah `formatGenre`, `formatRuntime`, `formatMetaLine`.
  - `slider.jsx` memakai `mediaDetailType` dari `lib/media`.
- ✅ **Tahap 3 selesai** — `index.css` (3.299 baris) dipecah per-blok ke `src/styles/`, urutan cascade dipertahankan.
  - `styles/tailwind.css` — satu-satunya sumber direktif `@tailwind` (dipindah dari `index.css`; duplikat di `App.css` dihapus).
  - `index.css` kini hanya barrel `@import` (9 partials): `tokens`, `base`, `layout`, `hero`, `home`, `footer`, `responsive`, `utilities`, `discover`.
  - `App.css` dihapus + import-nya dilepas dari `App.js`; `styles/style.css` (artefak build Tailwind tak terpakai) dihapus.
  - Verifikasi: `eslint` 0 error (6 warning pre-existing), `tsc --noEmit` bersih, `react-scripts build` sukses — Tailwind terkompilasi, preflight hanya 1x (sebelumnya 2x), tidak ada `@import`/`@tailwind` literal di bundle.
- ✅ **Tahap 4 selesai** — auth util + token handling + TS incremental.
  - `lib/jwt.ts` — `decodeJwtPayload`, `isTokenExpired`, `getTokenExpiryMs`, `getUserFromToken` (+ tipe `JwtClaims`, `AuthUser`).
  - `lib/tokenStorage.ts` — `TOKEN_STORAGE_KEY`, `readStoredToken`, `writeStoredToken`, `clearStoredAuth` (ikut membersihkan key legacy `username`/`id_user`/`role`).
  - `contexts/AuthContext.js` → `contexts/AuthContext.tsx` (typed `AuthContextValue`), memakai util baru + auto-logout saat token kedaluwarsa.
  - `constants/auth.js` → `constants/auth.ts` (+ tipe `UserRole`); `navbar.tsx` memakai `useAuth()` bertipe tanpa cast.
  - Infra test TS: `babel.config.js` + `@babel/preset-typescript`, `jest.transform` mencakup `ts|tsx`; test baru `lib/jwt.test.ts` (5 test).
  - Verifikasi: `eslint` 0 error (6 warning pre-existing), `tsc --noEmit` bersih, `react-scripts build` sukses, test `AuthContext` + `jwt` lulus. Sisa 1 kegagalan `App.test.js` bawaan CRA (stale, dijadwalkan Tahap 6).
- ✅ **Tahap 5 selesai** — split views besar + konsistensi naming modul baru.
  - `views/searchResult.jsx` 1.285 → 747 baris; helper `lib/discover.js`, konstanta `constants/discover.js`, komponen `components/discover/` (`FilterFields`, `MediaCard`, `DiscoverSearchBar`, `DiscoverControls`, `DiscoverResults`, `FilterSheet`).
  - `views/detail.jsx` 691 → 440 baris; helper `lib/detail.js`, komponen `components/detail/` (`DetailHero`, `DetailFacts`, `EpisodeList`, `DetailPlayer`, `CastGrid`, `TrailerSection`, `CommentsSection`).
  - `views/cmsUsers.jsx` 278 → 73 baris; hook `hooks/useCmsUsers.js`, helper `lib/cms.js`, komponen `components/cms/` (`UsersTable`, `UsersPagination`).
  - Naming modul baru konsisten: komponen `PascalCase.jsx`, hook `useXxx.js`, util/konstanta lowercase. Konversi penuh `.js/.jsx` → `.ts/.tsx` untuk seluruh sisa file tetap bertahap (belum dipaksa sekaligus karena `strict: true`).
  - Verifikasi: `eslint` 0 error (6 warning pre-existing), `tsc --noEmit` bersih, `react-scripts build` sukses, test `AuthContext` + `jwt` lulus (sisa `App.test.js` stale).
- ✅ **Tahap 6 selesai** — test restructure + final lint/typecheck.
  - Hapus test stale: `App.test.js` (bawaan CRA, gagal), `testing/` (test.CMSactors.js = komentar kosong; test.Review.js tidak dijalankan jest + asumsi UI lama).
  - Test baru colocated: `protectedRoutes/ProtectedRoute.test.js` (redirect `/login`, role diperbolehkan render, role terlarang → `/notfound`).
  - Bersihkan semua warning lint: binding `response` tak terpakai (`forgotComponent`, `resetComponent`) + memoize `selectedGenres`/`appliedFilters` di `searchResult.jsx` agar deps hook eksplisit.
  - Verifikasi final: test **11/11 lulus (3 suite)**, `eslint` **0 error / 0 warning**, `tsc --noEmit` bersih, `react-scripts build` sukses.

## Sisa Pekerjaan (opsional, pasca-Tahap berikutnya)
- Konversi sisa `.js/.jsx` → `.ts/.tsx` dan pasang tipe pada util/hook/komponen besar (dilakukan bertahap; infra jest sudah siap transform `ts|tsx`).

## Best Practices yang Disepakati
- Komponen kecil & single responsibility.
- Custom hook per data-fetching domain.
- Pure functions di `lib/`, side-effect di hook/component.
- Pattern presentational vs container.
- Design tokens via CSS variables.
- TypeScript incremental.
- Test colocation per feature.

## Context Tambahan Penting
- `docs/DECISIONS.md` — fase desain frontend (Phase 1–6).
- `docs/BACKEND_TODO.md` — field API yang belum tersedia.
- Karakter desain: Dramaku wordmark, CSS scroll-native layout, glass surfaces, TMDB attribution, empty state honest untuk data belum ada.
