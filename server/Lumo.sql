--
-- PostgreSQL database dump
--

\restrict y75vPETzZn6eUzh3TsrbSmMI1l8WNyoAm2Hgui4uoS1qwRqXfOJY1C74pb1RwRS

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-10-28 11:20:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 859 (class 1247 OID 28091)
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'Admin',
    'Writer'
);


ALTER TYPE public.role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 28119)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    media_type character varying(5) NOT NULL,
    comment text NOT NULL,
    rate smallint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT comments_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['movie'::character varying, 'tv'::character varying])::text[]))),
    CONSTRAINT comments_rate_check CHECK (((rate >= 1) AND (rate <= 10)))
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 28118)
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.comments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 28143)
-- Name: user_watchlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_watchlist (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    media_type character varying(5) NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_watchlist_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['movie'::character varying, 'tv'::character varying])::text[])))
);


ALTER TABLE public.user_watchlist OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 28142)
-- Name: user_watchlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_watchlist ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_watchlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 28096)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    google_id character varying(255),
    role public.role DEFAULT 'Writer'::public.role NOT NULL,
    avatar_url character varying(500),
    banned boolean DEFAULT false NOT NULL,
    reset_password_token character varying(64),
    reset_password_expires timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 28095)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 28164)
-- Name: watch_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watch_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    media_type character varying(5) NOT NULL,
    season smallint DEFAULT 0 NOT NULL,
    episode smallint DEFAULT 0 NOT NULL,
    watched_seconds numeric(10,2) DEFAULT 0 NOT NULL,
    duration_seconds numeric(10,2) DEFAULT 0 NOT NULL,
    watched_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT watch_history_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['movie'::character varying, 'tv'::character varying])::text[])))
);


ALTER TABLE public.watch_history OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 28163)
-- Name: watch_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.watch_history ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.watch_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5016 (class 0 OID 28119)
-- Dependencies: 222
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, user_id, tmdb_id, media_type, comment, rate, created_at) FROM stdin;
1	1	969681	movie	lumayan	4	2026-10-26 11:21:41.198514+07
\.


--
-- TOC entry 5018 (class 0 OID 28143)
-- Dependencies: 224
-- Data for Name: user_watchlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_watchlist (id, user_id, tmdb_id, media_type, added_at) FROM stdin;
5	1	120911	tv	2026-10-28 05:38:24.989621+07
10	1	76331	tv	2026-10-28 06:07:38.401197+07
\.


--
-- TOC entry 5014 (class 0 OID 28096)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, google_id, role, avatar_url, banned, reset_password_token, reset_password_expires, created_at) FROM stdin;
1	Reza Maulana Aziiz	rezamaulanaaziz600@gmail.com	\N	101465428093223209300	Writer	\N	f	\N	\N	2026-10-26 11:20:41.804436+07
2	Reza Maulana aziiz	rezamaulanaaziz700@gmail.com	\N	107421433267214799212	Writer	\N	f	\N	\N	2026-10-26 14:56:45.778532+07
\.


--
-- TOC entry 5020 (class 0 OID 28164)
-- Dependencies: 226
-- Data for Name: watch_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watch_history (id, user_id, tmdb_id, media_type, season, episode, watched_seconds, duration_seconds, watched_at) FROM stdin;
\.


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 221
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, true);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_watchlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_watchlist_id_seq', 11, true);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 225
-- Name: watch_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.watch_history_id_seq', 1, false);


--
-- TOC entry 4850 (class 2606 OID 28134)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 28154)
-- Name: user_watchlist user_watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_watchlist
    ADD CONSTRAINT user_watchlist_pkey PRIMARY KEY (id);


--
-- TOC entry 4857 (class 2606 OID 28156)
-- Name: user_watchlist user_watchlist_user_id_tmdb_id_media_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_watchlist
    ADD CONSTRAINT user_watchlist_user_id_tmdb_id_media_type_key UNIQUE (user_id, tmdb_id, media_type);


--
-- TOC entry 4842 (class 2606 OID 28115)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4844 (class 2606 OID 28117)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 4846 (class 2606 OID 28111)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 28113)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4859 (class 2606 OID 28183)
-- Name: watch_history watch_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT watch_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 28185)
-- Name: watch_history watch_history_user_id_tmdb_id_media_type_season_episode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT watch_history_user_id_tmdb_id_media_type_season_episode_key UNIQUE (user_id, tmdb_id, media_type, season, episode);


--
-- TOC entry 4851 (class 1259 OID 28140)
-- Name: comments_tmdb_id_media_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comments_tmdb_id_media_type_idx ON public.comments USING btree (tmdb_id, media_type);


--
-- TOC entry 4852 (class 1259 OID 28141)
-- Name: comments_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comments_user_id_idx ON public.comments USING btree (user_id);


--
-- TOC entry 4855 (class 1259 OID 28162)
-- Name: user_watchlist_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_watchlist_user_id_idx ON public.user_watchlist USING btree (user_id);


--
-- TOC entry 4860 (class 1259 OID 28191)
-- Name: watch_history_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX watch_history_user_id_idx ON public.watch_history USING btree (user_id);


--
-- TOC entry 4863 (class 2606 OID 28135)
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4864 (class 2606 OID 28157)
-- Name: user_watchlist user_watchlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_watchlist
    ADD CONSTRAINT user_watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4865 (class 2606 OID 28186)
-- Name: watch_history watch_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT watch_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-10-28 11:20:17

--
-- PostgreSQL database dump complete
--

\unrestrict y75vPETzZn6eUzh3TsrbSmMI1l8WNyoAm2Hgui4uoS1qwRqXfOJY1C74pb1RwRS

