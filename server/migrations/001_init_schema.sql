-- Dramaku schema (fresh database)
-- TMDB-backed: no local movie/genre/actor/country catalog is stored.
-- Metadata (titles, posters, synopsis, cast, etc.) always comes live from
-- the TMDB API. Only user-generated data lives here: accounts, comments,
-- watchlist, and watch progress keyed by TMDB's own tmdb_id + media_type.
--
-- How to run:
-- 1. Create an empty database (e.g. `createdb dramaku` or via your hosting
--    provider's dashboard).
-- 2. Run this file against it, e.g.:
--      psql "$DATABASE_URL" -f migrations/001_init_schema.sql
--    or open it in DBeaver's SQL editor connected to the new database and
--    execute the whole script.
-- 3. Point server/.env (PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT or
--    DATABASE_URL) at this database.

CREATE TYPE public.role AS ENUM ('Admin', 'Writer');

CREATE TABLE public.users (
    id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      varchar(50)  NOT NULL UNIQUE,
    email         varchar(255) NOT NULL UNIQUE,
    password      varchar(255),              -- hash (bcrypt), null kalau login Google
    google_id     varchar(255) UNIQUE,
    role          public.role NOT NULL DEFAULT 'Writer',
    avatar_url    varchar(500),
    banned        boolean NOT NULL DEFAULT false,
    reset_password_token   varchar(64),
    reset_password_expires timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.comments (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tmdb_id     integer NOT NULL,
    media_type  varchar(5) NOT NULL CHECK (media_type IN ('movie','tv')),
    comment     text NOT NULL,
    rate        smallint CHECK (rate BETWEEN 1 AND 10),
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.comments (tmdb_id, media_type);
CREATE INDEX ON public.comments (user_id);

CREATE TABLE public.user_watchlist (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tmdb_id     integer NOT NULL,
    media_type  varchar(5) NOT NULL CHECK (media_type IN ('movie','tv')),
    added_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, tmdb_id, media_type)
);
CREATE INDEX ON public.user_watchlist (user_id);

-- Continue Watching: accurate, cross-device resume position.
-- watched_seconds/duration_seconds mirror the progress.watched /
-- progress.duration values vidrock reports via its PLAYER_EVENT
-- (timeupdate/pause/ended) postMessage payloads.
-- season/episode default to 0 (not NULL) for movies so the UNIQUE
-- constraint below reliably de-duplicates on upsert (Postgres treats NULL
-- as distinct from NULL, which would otherwise break ON CONFLICT).
CREATE TABLE public.watch_history (
    id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tmdb_id          integer NOT NULL,
    media_type       varchar(5) NOT NULL CHECK (media_type IN ('movie','tv')),
    season           smallint NOT NULL DEFAULT 0,
    episode          smallint NOT NULL DEFAULT 0,
    watched_seconds  numeric(10,2) NOT NULL DEFAULT 0,
    duration_seconds numeric(10,2) NOT NULL DEFAULT 0,
    watched_at       timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, tmdb_id, media_type, season, episode)
);
CREATE INDEX ON public.watch_history (user_id);
