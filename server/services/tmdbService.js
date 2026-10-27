// Thin proxy over the TMDB API. This is the only place that talks to TMDB
// directly, so the read access token never reaches the client and response
// shaping/caching can be added here later without touching controllers.
const env = require('../config/env');
const AppError = require('../utils/AppError');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const VALID_MEDIA_TYPES = ['movie', 'tv'];

const assertValidMediaType = (mediaType) => {
  if (!VALID_MEDIA_TYPES.includes(mediaType)) {
    throw new AppError("mediaType must be 'movie' or 'tv'", 400);
  }
};

const buildUrl = (path, params = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url;
};

const tmdbRequest = async (path, params = {}) => {
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.TMDB_READ_ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new AppError('Title not found on TMDB', 404);
    }
    const body = await response.text();
    throw new AppError(`TMDB request failed (${response.status}): ${body}`, 502);
  }

  return response.json();
};

exports.getTrending = async (mediaType = 'all', timeWindow = 'day', page = 1) => {
  if (mediaType !== 'all') assertValidMediaType(mediaType);
  if (!['day', 'week'].includes(timeWindow)) {
    throw new AppError("timeWindow must be 'day' or 'week'", 400);
  }
  return await tmdbRequest(`/trending/${mediaType}/${timeWindow}`, { page });
};

exports.getPopular = async (mediaType, page = 1) => {
  assertValidMediaType(mediaType);
  return await tmdbRequest(`/${mediaType}/popular`, { page });
};

// "Just added": most recently released/aired titles TMDB currently tracks.
exports.getJustAdded = async (mediaType, page = 1) => {
  assertValidMediaType(mediaType);
  const path = mediaType === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
  return await tmdbRequest(path, { page });
};

exports.getGenres = async (mediaType) => {
  assertValidMediaType(mediaType);
  return await tmdbRequest(`/genre/${mediaType}/list`);
};

exports.discover = async (mediaType, { genre, year, sortBy, page, language, minRating } = {}) => {
  assertValidMediaType(mediaType);
  const params = {
    with_genres: genre,
    sort_by: sortBy || 'popularity.desc',
    page,
    with_original_language: language,
    'vote_average.gte': minRating,
  };
  if (mediaType === 'movie' && year) params.primary_release_year = year;
  if (mediaType === 'tv' && year) params.first_air_date_year = year;
  return await tmdbRequest(`/discover/${mediaType}`, params);
};

exports.search = async (term, page = 1) => {
  if (!term || !term.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return await tmdbRequest('/search/multi', { query: term.trim(), page, include_adult: false });
};

exports.getDetails = async (mediaType, tmdbId) => {
  assertValidMediaType(mediaType);
  return await tmdbRequest(`/${mediaType}/${tmdbId}`, {
    append_to_response: 'credits,videos,recommendations',
  });
};

exports.getSeasonDetails = async (tmdbId, seasonNumber) => {
  return await tmdbRequest(`/tv/${tmdbId}/season/${seasonNumber}`);
};

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const toImageUrl = (path) => (path ? `${TMDB_IMAGE_BASE}${path}` : null);
exports.toImageUrl = toImageUrl;

// TMDB genre lists change rarely, so caching them in memory avoids an extra
// network round-trip on every single list/search request. Swap this for
// Redis later if the server runs as multiple instances.
const genreMapCache = {};

const getGenreMap = async (mediaType) => {
  assertValidMediaType(mediaType);
  if (genreMapCache[mediaType]) return genreMapCache[mediaType];

  const { genres } = await tmdbRequest(`/genre/${mediaType}/list`);
  const map = new Map(genres.map((genre) => [genre.id, genre.name]));
  genreMapCache[mediaType] = map;
  return map;
};

const resolveGenreNames = async (genreIds = []) => {
  if (!genreIds.length) return [];
  const [movieMap, tvMap] = await Promise.all([getGenreMap('movie'), getGenreMap('tv')]);
  return genreIds.map((id) => movieMap.get(id) || tvMap.get(id)).filter(Boolean);
};

const LANGUAGE_LABELS = {
  ar: 'Arabic',
  cn: 'Cantonese',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  jv: 'Javanese',
  km: 'Khmer',
  ko: 'Korean',
  ms: 'Malay',
  ph: 'Filipino',
  pt: 'Portuguese',
  ru: 'Russian',
  su: 'Sundanese',
  th: 'Thai',
  tr: 'Turkish',
  zh: 'Mandarin',
};

const COUNTRY_LABELS = {
  AU: 'Australia',
  CA: 'Canada',
  CN: 'China',
  DE: 'Germany',
  FR: 'France',
  GB: 'United Kingdom',
  HK: 'Hong Kong',
  ID: 'Indonesia',
  IN: 'India',
  IT: 'Italy',
  JP: 'Japan',
  KR: 'South Korea',
  MY: 'Malaysia',
  PH: 'Philippines',
  RU: 'Russia',
  SG: 'Singapore',
  TH: 'Thailand',
  TW: 'Taiwan',
  US: 'United States of America',
};

const resolveLanguageName = (code) =>
  LANGUAGE_LABELS[code] || code;

const resolveCountryName = (value) =>
  COUNTRY_LABELS[value] || value;

const resolveCountries = (item) => {
  const raw = item.production_countries || item.origin_country || [];
  return (Array.isArray(raw) ? raw : [raw])
    .map((country) => {
      if (typeof country === 'string') return resolveCountryName(country);
      return resolveCountryName(country.name);
    })
    .filter(Boolean);
};

// Normalizes a raw TMDB list item (movie or tv) into the flat contract shape
// docs/BACKEND_TODO.md expects: id, title, images, description, year,
// rating, type, genre. Mirrors client/src/adapters/mediaAdapter.ts field
// names (poster -> images, overview -> description, vote_average -> rating).
const normalizeTitle = async (item, fallbackMediaType) => {
  const mediaType = item.media_type || fallbackMediaType;
  const releaseDate = item.release_date || item.first_air_date || '';
  const genre = item.genres
    ? item.genres.map((g) => g.name)
    : await resolveGenreNames(item.genre_ids || []);

  return {
    id: item.id,
    title: item.title || item.name || '',
    description: item.overview || '',
    images: toImageUrl(item.poster_path),
    backdrop: toImageUrl(item.backdrop_path),
    year: releaseDate ? releaseDate.slice(0, 4) : null,
    rating: item.vote_average ?? null,
    type: mediaType,
    genre,
    language: item.original_language
      ? resolveLanguageName(item.original_language)
      : null,
    countries: resolveCountries(item),
  };
};
exports.normalizeTitle = normalizeTitle;

exports.getTrendingNormalized = async (mediaType = 'all', timeWindow = 'day', page = 1) => {
  const data = await exports.getTrending(mediaType, timeWindow, page);
  const results = await Promise.all(
    data.results.map((item) => normalizeTitle(item, mediaType))
  );
  return { page: data.page, total_pages: data.total_pages, total_results: data.total_results, results };
};

exports.getJustAddedNormalized = async (mediaType = 'movie', page = 1) => {
  const data = await exports.getJustAdded(mediaType, page);
  const results = await Promise.all(data.results.map((item) => normalizeTitle(item, mediaType)));
  return { page: data.page, total_pages: data.total_pages, total_results: data.total_results, results };
};

exports.discoverNormalized = async (mediaType, options = {}) => {
  const data = await exports.discover(mediaType, options);
  const results = await Promise.all(data.results.map((item) => normalizeTitle(item, mediaType)));
  return { page: data.page, total_pages: data.total_pages, total_results: data.total_results, results };
};

// search/multi mixes movie, tv, and person results; people don't fit the
// title contract shape, so they're dropped here rather than passed through
// with mismatched fields.
exports.searchNormalized = async (term, page = 1) => {
  const data = await exports.search(term, page);
  const titleResults = data.results.filter((item) => item.media_type === 'movie' || item.media_type === 'tv');
  const results = await Promise.all(titleResults.map((item) => normalizeTitle(item, item.media_type)));
  return { page: data.page, total_pages: data.total_pages, total_results: data.total_results, results };
};

// Merges genre labels while keeping media-specific IDs for discover queries.
exports.getMergedGenres = async () => {
  const [movieGenres, tvGenres] = await Promise.all([
    tmdbRequest('/genre/movie/list'),
    tmdbRequest('/genre/tv/list'),
  ]);

  const byName = new Map();
  movieGenres.genres.forEach((genre) => {
    const key = genre.name.toLowerCase();
    byName.set(key, {
      id: genre.id,
      name: genre.name,
      movieId: genre.id,
      tvId: null,
    });
  });
  tvGenres.genres.forEach((genre) => {
    const key = genre.name.toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      existing.tvId = genre.id;
    } else {
      byName.set(key, {
        id: genre.id,
        name: genre.name,
        movieId: null,
        tvId: genre.id,
      });
    }
  });

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
};
