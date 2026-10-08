--
-- PostgreSQL database dump
--

-- Dumped from database version 17rc1
-- Dumped by pg_dump version 17rc1

-- Started on 2024-12-02 12:57:15

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
-- TOC entry 863 (class 1247 OID 16390)
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'Admin',
    'Writer'
);


ALTER TYPE public.role OWNER TO postgres;

--
-- TOC entry 866 (class 1247 OID 16396)
-- Name: status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status AS ENUM (
    'Approved',
    'Unapproved'
);


ALTER TYPE public.status OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16582)
-- Name: actors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actors_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 16458)
-- Name: actors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actors (
    id integer DEFAULT nextval('public.actors_id_seq'::regclass) NOT NULL,
    name character varying,
    birthdate date,
    url_photos character varying,
    country_id integer
);


ALTER TABLE public.actors OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16579)
-- Name: awards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.awards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.awards_id_seq OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16452)
-- Name: awards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.awards (
    id integer DEFAULT nextval('public.awards_id_seq'::regclass) NOT NULL,
    name character varying(255),
    year integer,
    country_id integer,
    CONSTRAINT awards_year_check CHECK (((year >= 1900) AND (year <= 2099)))
);


ALTER TABLE public.awards OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16444)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    comment text,
    status boolean,
    created_at timestamp without time zone DEFAULT '2024-09-13 16:00:19.031331'::timestamp without time zone,
    movie_id integer,
    username character varying,
    rate numeric,
    id integer NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24761)
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
-- TOC entry 220 (class 1259 OID 16430)
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    id integer NOT NULL,
    name character varying(25)
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 24804)
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.countries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.countries_id_seq OWNER TO postgres;

--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 231
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.id;


--
-- TOC entry 219 (class 1259 OID 16425)
-- Name: genres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genres (
    id integer NOT NULL,
    name character varying(25)
);


ALTER TABLE public.genres OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 24807)
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.genres_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genres_id_seq OWNER TO postgres;

--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 232
-- Name: genres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.genres_id_seq OWNED BY public.genres.id;


--
-- TOC entry 227 (class 1259 OID 16471)
-- Name: movie_actor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movie_actor (
    movie_id integer,
    actor_id integer
);


ALTER TABLE public.movie_actor OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16468)
-- Name: movie_award; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movie_award (
    movie_id integer,
    award_id integer
);


ALTER TABLE public.movie_award OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16465)
-- Name: movie_genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movie_genre (
    movie_id integer,
    genre_id integer
);


ALTER TABLE public.movie_genre OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16402)
-- Name: movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movies (
    id integer NOT NULL,
    title character varying(255),
    alt_title character varying(255),
    synopsis text,
    year integer,
    availability character varying(100),
    trailer character varying(255),
    images text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rates double precision,
    country_id integer,
    status character varying,
    CONSTRAINT movies_year_check CHECK (((year >= 1900) AND (year <= 2099)))
);


ALTER TABLE public.movies OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16401)
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_id_seq OWNER TO postgres;

--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 217
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- TOC entry 234 (class 1259 OID 24817)
-- Name: user_watchlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_watchlist (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    movie_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_watchlist OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24816)
-- Name: user_watchlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_watchlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_watchlist_id_seq OWNER TO postgres;

--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 233
-- Name: user_watchlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_watchlist_id_seq OWNED BY public.user_watchlist.id;


--
-- TOC entry 221 (class 1259 OID 16435)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    username character varying NOT NULL,
    email character varying,
    password character varying(255),
    role_id public.role DEFAULT 'Writer'::public.role,
    created_at timestamp without time zone DEFAULT '2024-09-13 15:59:18.638801'::timestamp without time zone,
    google_id character varying(255),
    banned boolean,
    reset_password_token character varying(64),
    reset_password_expires timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4750 (class 2604 OID 24805)
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- TOC entry 4749 (class 2604 OID 24808)
-- Name: genres id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres ALTER COLUMN id SET DEFAULT nextval('public.genres_id_seq'::regclass);


--
-- TOC entry 4747 (class 2604 OID 16578)
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- TOC entry 4756 (class 2604 OID 24820)
-- Name: user_watchlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_watchlist ALTER COLUMN id SET DEFAULT nextval('public.user_watchlist_id_seq'::regclass);


--
-- TOC entry 4937 (class 0 OID 16458)
-- Dependencies: 224
-- Data for Name: actors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actors (id, name, birthdate, url_photos, country_id) FROM stdin;
12	Akira Kamiya	1986-04-10	\N	5
14	Alan Howard	1993-04-22	\N	6
15	Alan Tudyk	1994-05-02	\N	4
16	Albert Brooks	2000-04-24	\N	5
17	Alex D. Linz	1985-02-23	\N	10
18	Alexa Davalos	1986-06-12	\N	9
19	Alexa PenaVega	1997-01-16	\N	8
20	Alexander Gould	1985-08-01	\N	5
22	Alfre Woodard	1999-12-28	\N	2
23	Alfred Molina	1997-08-15	\N	8
24	Alia Bhatt	1996-11-09	\N	10
26	Allison Janney	1988-01-10	\N	2
27	Amanda Abbington	1994-12-07	\N	2
29	Amber Midthunder	1995-05-08	\N	10
30	America Ferrera	1995-10-28	\N	4
33	Amitabh Bachchan	1995-04-16	\N	2
35	Amy Hargreaves	1998-05-03	\N	5
36	Amy Smart	1994-01-16	\N	6
37	Ana Ularu	1993-09-04	\N	10
38	Ana Wagener	1989-01-24	\N	6
40	Andre Braugher	1986-10-03	\N	7
41	Andrea Dian	1989-11-04	\N	3
42	Andrew Scott	1996-01-18	\N	10
44	Angela Goethals	1993-01-09	\N	2
45	Angelina Jolie	1995-03-06	\N	6
46	Angga Yunanda	2000-12-13	\N	7
47	Angourie Rice	1997-12-11	\N	3
48	Ann Akinjirin	1996-03-17	\N	7
49	Anna Kendrick	1987-05-28	\N	4
50	Annabelle Wallis	2000-12-26	\N	9
51	Anne Hathaway	1998-09-09	\N	5
52	Annette Bening	1994-06-25	\N	5
53	Annie Potts	1986-05-18	\N	5
54	Annie Potts.	1993-02-17	\N	3
55	Ansel Elgort	1994-03-28	\N	6
56	Anthony Hopkins	1995-11-07	\N	6
57	Anthony Mackie	1992-02-24	\N	2
58	Anthony Mackie. Kevin Durand	1995-03-19	\N	5
59	Anthony Ramos	1991-01-03	\N	5
60	Antonia Thomas	1996-03-10	\N	9
61	Antonio Banderas	1992-02-09	\N	9
62	Antony Starr	1986-11-19	\N	6
63	Anushka Sharma	1999-08-16	\N	10
64	Archie Renaux	1985-09-03	\N	3
65	Ari Irham	1995-01-25	\N	7
66	Ario Bayu	1988-03-14	\N	4
67	Arsene Mosca	1995-10-23	\N	7
68	Arya Saloka	1996-04-09	\N	9
69	Asami Seto	1996-09-18	\N	6
70	Asha Kenyeri Bermudez	1988-08-08	\N	9
71	Ashley Greene	1996-02-23	\N	4
72	Ashley Judd	1987-07-16	\N	4
73	Ashton Kutcher	2000-01-25	\N	8
74	Astrid Bergès-Frisbey	2000-07-03	\N	5
75	Atsuko Yuya	1986-09-23	\N	2
77	Auliʻi Cravalho	1988-02-22	\N	4
78	Austin Pendleton	1985-08-28	\N	2
80	Awkwafina	1992-10-11	\N	2
81	Aya Asahina	2000-11-25	\N	10
82	Ayako Kawasumi	1989-02-05	\N	4
83	Ayana Taketatsu	1998-02-24	\N	8
84	Ayushita	1994-05-07	\N	9
85	Azira Shafinaz	1997-07-19	\N	4
86	Bae Suzy	1988-06-23	\N	10
87	Belle Solorzano	1999-05-18	\N	4
88	Ben Foster	1989-10-07	\N	5
89	Ben Hardy	1997-04-27	\N	5
90	Ben Kingsley	1985-08-05	\N	6
91	Ben Mendelsohn	1990-08-17	\N	9
92	Benedict Cumberbatch	1997-05-14	\N	4
94	Billy Boyd	2000-04-26	\N	10
95	Billy Magnussen	1993-04-13	\N	8
96	Blake Cooper	1995-10-29	\N	4
97	Bob Custas	1994-09-22	\N	2
98	Bob Peterson	1992-12-31	\N	8
99	Bobby Cannavale	1987-06-24	\N	2
100	Bona	1996-07-20	\N	3
101	Bonnie Hunt	1989-08-06	\N	8
102	Boyd Holbrook	1997-08-22	\N	3
103	Brad Garret	1992-02-16	\N	4
104	Brad Pitt	1992-12-17	\N	9
105	Brandon Flynn	1993-12-18	\N	7
106	Brenda Fricker	1999-01-26	\N	3
107	Brent Musburger	1985-09-26	\N	7
108	Brenton Thwaites	1986-07-09	\N	9
109	Brian Tyree Henry	1996-08-30	\N	4
110	Brianna Hildebrand	1999-06-11	\N	3
111	Brie Larson	1990-06-05	\N	10
112	Bruce Leung	1990-06-26	\N	10
113	Bryan Cranston	1989-04-10	\N	7
114	Bucek Depp	1989-11-18	\N	5
115	Burn Gorman	1997-10-13	\N	10
116	Byeon Woo-seok	1987-01-10	\N	6
117	Bárbara Lennie	1987-01-07	\N	10
118	Cai Puri-Evans	1999-11-14	\N	5
119	Cailee Spaeny	1994-04-12	\N	7
120	Calah Lane	1989-03-31	\N	5
121	Caleb McLaughlin	1987-01-23	\N	5
122	Carey Mulligan	1989-03-22	\N	7
123	Carla Gugino	1987-07-07	\N	7
124	Carolyn Lawrence	1990-03-16	\N	6
125	Catherine O'Hara	1990-10-23	\N	5
126	Cha Seung-won	1985-10-26	\N	3
127	Chace Crawford	1987-09-11	\N	3
128	Chadwick Boseman	1999-07-10	\N	3
129	Chafurin	1995-06-22	\N	10
130	Chafurin.	2000-10-20	\N	8
132	Charlie Day	1997-12-11	\N	7
133	Charlie Heaton	1986-03-17	\N	8
134	Charlie Hunnam	1991-08-05	\N	6
135	Cheech Marin	1986-05-07	\N	4
136	Chieko Baishô	1997-08-09	\N	2
137	Chika Sakamoto	1986-12-06	\N	4
138	Chloë Grace Moretz	1989-07-16	\N	9
139	Cho Dong-hyuk	1995-04-25	\N	4
140	Cho Yeo-jeong	1991-04-02	\N	10
141	Cho Yi-hyun	1996-07-11	\N	10
2	\N	\N	\N	\N
3	\N	\N	\N	\N
4	\N	\N	\N	\N
5	\N	\N	\N	\N
6	\N	\N	\N	\N
7	\N	\N	\N	\N
8	\N	\N	\N	\N
9	\N	\N	\N	\N
11	\N	\N	\N	\N
21	Alfie Allen	1999-10-22	\N	\N
25	Alisha Boe	1988-03-18	\N	\N
28	Amanda Plummer	1995-09-25	\N	\N
31	Amiee Conn	1990-04-19	\N	\N
32	Amir Nafis	1994-11-03	\N	\N
34	Aml Ameen	1996-03-28	\N	\N
142	Choi Byung Mo	1988-05-07	\N	3
143	Choi Hyun-Wook	1986-08-31	\N	3
144	Choi Jung Woo	1998-08-10	\N	8
145	Choi Min-sik	1993-09-12	\N	7
146	Choi Woo-sik	1988-02-08	\N	3
148	Chris Hemswort	1989-10-13	\N	2
149	Chris Hemsworth	1998-06-09	\N	8
150	Christian Bale	1999-10-09	\N	2
151	Christian Navarro	1996-03-16	\N	2
152	Christina Hendricks	1994-09-27	\N	4
154	Christopher Eccleston	1991-10-29	\N	10
155	Christopher Hagen	1988-07-26	\N	7
156	Christopher Lloyd	1986-02-28	\N	6
157	Christopher Plummer	1996-04-09	\N	7
158	Cillian Murphy	1988-02-16	\N	2
159	Clancy Brown	1992-06-08	\N	9
160	Clark Gregg	1996-05-04	\N	8
161	Claudia Wells	1998-05-02	\N	2
162	Colin Firth	1988-09-07	\N	10
163	Collette Wolfe	1989-01-24	\N	8
164	Connor Esterson	1992-04-14	\N	3
165	Connor Jessup	1986-01-30	\N	7
166	Corey Stoll	1995-06-08	\N	3
167	Crispin Glover	1991-11-03	\N	9
168	Cristela Alonzo	1999-10-09	\N	10
169	D.J. Cotrona	1998-07-07	\N	3
170	Dakota Beavers	1997-06-19	\N	2
171	Dakota Goyo	1987-10-10	\N	5
172	Dan Stevens	1985-03-18	\N	6
173	Dana Gaier	1987-06-04	\N	5
174	Dane DiLiegro	1992-05-05	\N	2
175	Dania Gurira	1990-04-20	\N	7
176	Daniel Brochu	1998-01-15	\N	6
177	Daniel Craig	2000-06-24	\N	7
178	Daniel Kaluuya	1992-10-16	\N	5
180	Daniel Rindress-Kay	2000-11-07	\N	10
181	Daniel Stern	1988-11-09	\N	2
182	Danny Chan Kwok Kwan	1986-06-08	\N	7
183	Danny Trejo	1989-11-06	\N	8
184	Darby Stanchfield	1996-05-12	\N	6
185	Darrell Waltrip	1990-06-04	\N	6
186	Daryl Sabara	1996-09-15	\N	2
187	Dave Bautista	1989-05-29	\N	3
188	David Andrews	1987-05-04	\N	9
189	David Cross	1996-02-13	\N	4
190	David Ganly.	1987-10-27	\N	6
191	David Harbour	1990-06-30	\N	3
192	David Hobbs	1993-02-23	\N	10
193	David Jonsson	1987-09-23	\N	6
194	David Kaye	1997-04-16	\N	3
195	David Oyelowo	1995-06-19	\N	2
196	David Selvas	1994-01-04	\N	7
197	David Thornton	1987-03-16	\N	6
198	Davika Hoorne	2000-02-11	\N	3
200	Dean Scott Vazquez	1993-07-16	\N	4
201	Dee Bradley Baker	1995-10-18	\N	7
202	Delroy Lindo	1996-05-06	\N	7
203	Derek Chouinard	1998-12-17	\N	4
204	Devin Druid	1991-07-04	\N	8
206	Dian Sastrowardoyo	1999-03-17	\N	5
207	Diane Keaton	1996-03-20	\N	4
208	Diego Klattenhof	1993-06-04	\N	3
209	Dileep Rao	1995-05-10	\N	7
211	Doh Kyung Soo	2000-01-17	\N	9
212	Dominique Fishback	1999-07-10	\N	8
213	Don Rickles	1991-10-28	\N	3
214	Donna Murphy	1989-08-15	\N	7
215	Dustin Hoffman	1990-06-11	\N	2
216	Dwayne Johnson	1987-03-18	\N	6
217	Dylan Minnette	1987-10-02	\N	10
219	Ed O'Neill	1990-05-28	\N	9
221	Eddie Deezen	1994-02-19	\N	10
222	Eddie Izzard	1989-08-23	\N	10
224	Edward Norton	1993-09-08	\N	7
225	Elden Henson	1988-12-04	\N	3
226	Eleanor Noble	1987-02-08	\N	10
227	Elie Docter.	1991-01-17	\N	3
228	Elijah wood	1991-04-12	\N	6
229	Elizabeth Lail	1989-10-29	\N	3
230	Elizabeth Tan	1991-06-22	\N	9
231	Ellen Burstyn	1996-08-11	\N	6
232	Ellen DeGeneres	1998-03-03	\N	7
233	Elliot Page	1985-11-07	\N	8
234	Elsie Fisher	1997-04-22	\N	4
235	Emilia Jones	1990-10-14	\N	2
236	Emily Mortimer	1985-12-08	\N	4
237	Emma Stone	2000-04-27	\N	6
238	Emma Watson	1990-10-09	\N	4
239	Emma de Caunes	2000-06-07	\N	8
240	Eric Bauza	1990-08-03	\N	4
241	Erik von Detten.	1997-01-19	\N	2
242	Erin Moriarty	1993-07-01	\N	8
243	Esma Daniel.	1993-12-28	\N	9
244	Ethan Hawke	1987-11-28	\N	2
245	Eugene Cordero	1999-08-27	\N	9
246	Eugene Levy	1986-01-03	\N	9
247	Evangeline Lilly	1997-01-01	\N	2
248	Eve Hewson	1986-02-06	\N	7
249	Everly Carganilla	1991-04-18	\N	4
250	F. Murray Abraham	1992-02-15	\N	3
251	Fawad Khan	1998-09-17	\N	5
252	Felicity Jones	1990-10-23	\N	7
253	Finn Wolfhard	1986-04-08	\N	4
254	Fiona Gubelmann	1993-04-30	\N	6
255	Fiona Shar	1985-08-21	\N	2
256	Frances Sternhagen	1997-07-11	\N	3
257	Francesc Orella	1987-09-09	\N	2
258	Francis X. McCarthy	1999-02-11	\N	10
259	Franco Nero	1986-10-22	\N	10
260	Francois Touch	1995-09-03	\N	10
261	Fred Tatasciore	2000-08-11	\N	5
262	Freddie Highmore	1985-07-18	\N	10
264	Ganindra Bimo	1989-12-08	\N	4
265	Gary Oldman	1995-05-16	\N	6
266	Gaten Matarazzo	1991-07-21	\N	5
267	Gemma Chan	1988-08-25	\N	2
268	Gena Rowlands	1997-06-03	\N	6
272	George Maguire	1999-01-15	\N	3
273	Gerry Bamman	1986-11-26	\N	6
274	Giancarlo Esposito	1992-10-25	\N	9
275	Gina Rodriguez	1995-11-11	\N	7
276	Go Kyung-pyo	1990-03-17	\N	8
278	Graham McTavish	1987-08-06	\N	7
279	Gregory	1998-09-12	\N	6
280	Gregory Tyree Boyce	1988-04-24	\N	10
147	Chris Evans	1985-09-14	\N	\N
281	Griffin Gluck	1995-02-24	\N	9
282	Guanlin Ji	1999-08-04	\N	3
283	Gugu Mbatha-Raw	1991-09-26	\N	10
284	Guido Quaroni	1989-02-01	\N	4
285	Guy PearceCarrie-Anne MossJoe Pantoliano	1990-08-13	\N	2
286	Gwilym Lee	1985-02-21	\N	5
287	Gwyneth Paltrow	1986-12-31	\N	4
288	Ha Seung Ri	1991-01-29	\N	6
289	Ha Yul-ri	2000-10-02	\N	2
290	Hahm Eun-jung	1994-02-28	\N	5
291	Halle Berry	1999-08-27	\N	7
292	Hallea Jones	1992-09-10	\N	7
293	Han Hyo-joo	1998-05-21	\N	4
294	Han Ji-min	1985-12-02	\N	5
296	Harry Melling	1990-06-17	\N	6
297	Harshaali Malhotra	1999-08-29	\N	6
298	Haruka Tomatsu	1992-12-26	\N	3
299	Haviland Morris	1998-06-30	\N	4
300	Haydar Salishz	1996-09-10	\N	7
301	Hayden Rolence	1989-05-02	\N	7
302	Heath Ledger	1995-07-02	\N	2
303	Heledd Jarman	1999-02-07	\N	4
304	Helen Sadler.	1987-07-01	\N	9
305	Helena Bonham Carter	1987-11-10	\N	2
306	Hidaka Noriko	1992-08-13	\N	5
307	Hiroshi Kamiya	1990-11-17	\N	9
308	Hitomi Nabatame	1996-02-12	\N	6
309	Hitosho Takagi	1995-08-30	\N	9
310	Holland Taylor	1985-10-19	\N	6
312	Hong Shang	1987-03-08	\N	10
314	Hrithik Roshan	1999-06-19	\N	10
315	Hugh Grant	1988-02-07	\N	6
316	Hugh Jackman	1986-07-17	\N	4
318	Hyein Park	1992-02-22	\N	9
319	Hyeri	1985-06-11	\N	4
321	IU	1999-03-28	\N	7
322	Iain Armitage	1985-07-13	\N	4
324	Ian McKellen	1990-04-10	\N	7
326	Ibnu Jamil	1992-05-07	\N	10
327	Ida Darvish	1996-11-13	\N	3
328	Idina Menzel	1993-08-18	\N	7
329	Idris Elba	1985-08-13	\N	4
330	Ikue Otani	1992-10-27	\N	5
331	Indra Brotolaras	1995-07-22	\N	3
332	Iqbaal Dhiafakhri Ramadhan	1995-01-22	\N	10
333	Irina Gorovaia	1985-09-24	\N	10
334	Irrfan Khan	1987-03-23	\N	6
335	Isabela Merced	1985-12-11	\N	10
336	Issa Rae	1993-12-17	\N	4
337	Iñigo Gastesi	1990-08-18	\N	9
338	J. K. Simmons	1985-08-14	\N	5
339	J.K. Simmons	1996-08-24	\N	4
340	Jack Black	1998-10-23	\N	5
341	Jack Davenport	1989-07-27	\N	6
342	Jack Kesy	1997-03-13	\N	3
343	Jack Quaid	2000-12-25	\N	3
344	Jack Reynor	1997-04-02	\N	4
346	Jackie Earle Haley	1995-06-17	\N	8
348	Jackson Robert Scott	1999-06-08	\N	3
349	Jacob Batalon	1989-06-13	\N	9
350	Jacob Lofland	1985-12-19	\N	2
351	Jacob Tremblay	1996-07-01	\N	8
352	Jai Courtney	1987-07-14	\N	6
353	Jaimie Alexander	1994-10-10	\N	9
354	Jake Gyllenhaal	1987-07-08	\N	4
355	James Garner	1995-05-05	\N	8
357	James Nesbitt	1992-06-26	\N	8
358	James Rebhorn	1988-03-11	\N	10
359	Jamie Anne Allman	1987-04-13	\N	10
360	Jamie Foxx	1998-09-10	\N	7
361	Jamie Lee Curtis	2000-06-23	\N	4
362	Jang Da-a	1985-01-27	\N	8
363	Jang Hye-jin	1996-02-12	\N	4
364	Jang Ki-yong	2000-10-01	\N	5
365	Jang Woo-young	1989-01-16	\N	6
366	Jared Leto	1991-02-11	\N	4
368	Javier Bardem	1997-06-10	\N	10
369	Jaya Bachchan	1990-05-06	\N	2
370	Jean Reno	1998-06-03	\N	5
371	Jean-Claude Van Damme	1988-03-07	\N	5
372	Jeff Bridges	1996-07-29	\N	3
374	Jeff Wolfe	2000-03-19	\N	4
375	Jeffrey DeMunn	1985-06-20	\N	3
376	Jeffrey Tambor	1998-06-23	\N	6
377	Jeffrey Wright	1994-11-05	\N	4
378	Jefri Nichol	1991-02-20	\N	3
379	Jemaine Clement	1989-01-13	\N	8
380	Jenifer Lewis	1995-11-24	\N	2
381	Jennifer	1997-04-22	\N	8
382	Jeon Yeo-been	1988-09-07	\N	3
383	Jeremy Piven	1990-05-11	\N	7
384	Jeremy Renner	1999-12-24	\N	3
385	Jerome Kurnia	1994-03-21	\N	2
387	Jesse James	1985-01-06	\N	8
388	Jessica Alba	1998-06-20	\N	7
389	Jessica Chastain	2000-10-13	\N	3
390	Jessie T. Usher	1998-11-29	\N	8
392	Jill Talley	1998-12-01	\N	5
393	Jim Varney	1998-12-09	\N	6
394	Jin Goo	1994-04-26	\N	5
395	Jin Zhang	1987-01-14	\N	2
396	Jirayu La-ongmanee	1985-03-06	\N	9
397	Jo Han Chul	1996-01-22	\N	8
398	Jo Han-chul	1987-04-26	\N	5
399	Jo In-sung	1999-11-12	\N	6
400	Jo Jung-suk	1986-04-02	\N	3
401	Joan Allen	1993-09-01	\N	5
402	Joan Cusack	1999-01-27	\N	10
403	Jodi Benson	1990-09-15	\N	6
404	Joe Mantegna	1985-08-23	\N	3
405	Joe Pesci	1995-10-16	\N	8
406	Joe Ranft	1995-06-04	\N	9
407	Joe Schilling	1989-03-11	\N	7
408	Joel McHale	1987-10-20	\N	9
409	John Boyega	1992-04-14	\N	2
410	John Carroll Lynch	1998-02-22	\N	7
411	John Heard	2000-03-21	\N	5
412	John Lithgow	1987-05-18	\N	7
413	John Morris	1985-05-29	\N	8
414	John Patrick Amedori	1999-01-19	\N	8
415	John Ratzenberger	1999-08-21	\N	10
416	John Travolta	1999-03-06	\N	2
417	John Turturro	1996-12-24	\N	6
418	Johnny Depp	1994-08-12	\N	7
419	Jon Favreau	1994-06-20	\N	4
420	Jon Hamm	1993-09-20	\N	2
421	Jonathan Aris	1989-06-09	\N	3
422	Jonathan Groff	1991-06-08	\N	3
295	Harrison Ford	1986-04-03	\N	\N
311	Hong Seung Hee	1988-05-17	\N	\N
423	Jonathan Pryce	1991-05-25	\N	9
424	Joo Bo Young	1995-10-15	\N	10
425	Jordan Nagai	1985-04-05	\N	5
426	Jordan Peele	1990-06-10	\N	4
427	Jose Coronado	1990-01-07	\N	6
428	Joseph Gordon-Levitt	1985-12-31	\N	2
429	Joseph Mazzello	1994-03-18	\N	2
431	Josh Duhamel	2000-03-13	\N	5
432	Josh Gad	1992-09-30	\N	3
434	Josh Keaton	1986-12-23	\N	2
436	Judy Greer	1993-07-11	\N	10
437	Julia Stiles	1988-05-05	\N	8
438	Julian Dennison	1989-06-05	\N	9
439	Julianne Moore	1990-08-30	\N	2
440	Julie Andrews	1989-06-05	\N	2
441	Julie White	1985-09-20	\N	2
442	Juliette Gosselin	1988-07-14	\N	2
443	Jung Man-sik	1998-03-20	\N	6
444	Justin Prentice	1988-08-22	\N	8
445	Jôji Nakata	1985-02-26	\N	4
446	Kaden Leos	1998-04-06	\N	7
447	Kajol	1985-03-05	\N	6
448	Kal So-won	1993-07-14	\N	9
449	Kana Ueda	1988-01-07	\N	4
450	Kang Han-na	1994-04-18	\N	10
453	Kang Shin-il	1989-12-28	\N	8
454	Kang Ye-seo	1998-07-01	\N	9
455	Kappei Yamaguchi	1993-12-08	\N	4
456	Kareena Kapoor	1986-08-05	\N	4
457	Karen Fukuhara	1986-06-03	\N	3
458	Karim El Hakim	1991-12-19	\N	4
460	Karl Yune	1996-04-27	\N	2
461	Kate McKinnon	1996-12-24	\N	8
462	Kate Winslet	1999-05-30	\N	7
463	Katherine Helmond	1994-05-10	\N	3
464	Katrina Kaif	1994-12-09	\N	10
465	Katy Mixon	1999-09-29	\N	6
466	Kaya Scodelario	1995-08-15	\N	3
467	Ke Huy Quan	1991-04-05	\N	3
468	Keanu Reeves	1997-07-25	\N	4
469	Keegan-Michael Key	1995-04-20	\N	3
470	Keira Knightley	1989-03-23	\N	3
471	Kellan Lutz	1991-09-25	\N	2
472	Kelsey Grammer	1989-09-16	\N	7
473	Ken Stott	1994-05-02	\N	8
474	Ken Takeuchi	1995-02-20	\N	4
475	Ken Watanabe	1993-09-14	\N	7
476	Kenichi Ogata	1987-10-15	\N	9
477	Kenichi Ogata.	1993-05-21	\N	9
478	Kento Yamazaki	1985-09-30	\N	5
479	Kevin Connolly	1987-01-14	\N	2
480	Kevin Dunn	1999-07-01	\N	5
481	Kevin G. Schmidt	2000-11-29	\N	9
482	Kevin Kilner	1991-04-10	\N	2
483	Kevin McNally	1992-05-16	\N	6
484	Kevin Michael Richardson	1999-11-17	\N	7
485	Kevin Spacey	1985-05-17	\N	10
486	Ki Hong Lee	1995-07-16	\N	3
487	Kim Da-mi	1989-02-11	\N	8
488	Kim Do-hoon	1996-03-16	\N	10
489	Kim Dong-Hee	1985-08-24	\N	9
490	Kim Go-eun	1990-12-07	\N	2
491	Kim Hee Ae	1999-05-13	\N	5
492	Kim Hye Eun	2000-08-09	\N	3
493	Kim Hye-Eun	1992-06-29	\N	10
494	Kim Jae Won	1995-02-22	\N	10
495	Kim Ji-won	1989-10-06	\N	9
499	Kim Jung-tae	1998-09-26	\N	5
500	Kim Min-Seok	1999-04-10	\N	3
501	Kim Seon-ho	1993-04-19	\N	2
502	Kim Seul-gi	2000-08-24	\N	4
503	Kim Soo-hyun	1985-09-21	\N	10
504	Kim Sung-kyun	1997-12-13	\N	10
505	Kim Tae-Ri	1986-06-04	\N	2
506	Kim Woo-bin	1988-09-27	\N	3
507	Kim Yeo-jin	1995-01-30	\N	10
508	Kim Yoon-hye	1990-07-16	\N	5
509	Kodi Rasheed	1988-07-19	\N	7
510	Komatsu Mikako	1998-01-31	\N	5
511	Kou Shibasaki	1992-12-21	\N	7
512	Kouhei Amasaki	1999-01-26	\N	3
513	Kristen Bell	1988-04-06	\N	10
514	Kristen Stewart	1989-10-07	\N	8
515	Kristen Wiig	2000-04-11	\N	9
517	Kwak Dong-yeon	1995-08-14	\N	4
518	Kwak Si-yang	1995-05-29	\N	2
519	Kyung Soo-jin	1994-08-17	\N	3
520	Lance Barber	1995-05-08	\N	7
521	Lance Henriksen	1999-04-10	\N	4
522	Larry the Cable Guy	1986-04-02	\N	6
524	Laura Haddock	1986-09-29	\N	8
525	Laura Harrier	1988-01-23	\N	3
526	Laura Lovelace	1992-05-16	\N	3
527	Laurie Holden	1997-10-13	\N	7
528	Laz Alonso	1993-09-27	\N	6
529	Lea Thompson	1985-11-25	\N	10
530	Lee Arenberg	1985-03-06	\N	7
531	Lee Byung-hun	1990-11-01	\N	5
532	Lee Do-hyun	1990-05-25	\N	5
533	Lee Dong-hwi	1999-07-03	\N	5
534	Lee El	1991-06-26	\N	4
535	Lee Eun-saem	1995-03-26	\N	8
536	Lee Hee-joon	1986-08-04	\N	3
537	Lee Il-hwa	1997-06-02	\N	7
538	Lee Jeong-eun	1990-10-03	\N	5
539	Lee Joo-Myoung	1991-04-12	\N	4
540	Lee Joo-young	2000-04-13	\N	6
541	Lee Jung-eun	1989-07-01	\N	4
542	Lee Jung-ha	1989-06-30	\N	5
543	Lee Min-ki	1997-09-07	\N	6
544	Lee Pace	1988-07-20	\N	9
546	Lee Sin-young	1985-12-03	\N	7
547	Lee Sun-kyun	1986-04-13	\N	9
548	Lee Sung Min	1992-10-23	\N	6
549	Lee Yea Jin	1994-12-26	\N	3
551	Lenny von Dohlen	1992-07-06	\N	5
552	Leonardo DiCaprio	1993-05-22	\N	10
553	Letita Wright	1985-09-20	\N	8
554	Lily Atkinson	1997-08-18	\N	2
555	Lily James	1992-07-26	\N	2
556	Lim Ju-hwan	1991-02-01	\N	2
558	Louise Brealey	1993-04-17	\N	9
559	Lucy Boynton	1992-12-07	\N	4
560	Lucy Liu	1994-03-01	\N	9
561	Lukman Sardi	1988-12-31	\N	2
563	Lupita Nyong'o	1989-10-10	\N	10
564	Lutesha	1997-06-26	\N	9
430	Josh Brolin	1992-01-26	\N	\N
433	Josh Hutcherson	1995-01-15	\N	\N
565	Macaulay Culkin	1994-12-30	\N	4
566	Mackenzie Foy	1998-07-24	\N	6
567	Madison Wolfe	2000-06-01	\N	6
568	Maggie Smith	1998-10-30	\N	3
569	Mamoru Miyano	1986-03-10	\N	7
570	Manami Numakura	1990-12-27	\N	8
571	Mandy Moore	2000-12-29	\N	9
572	Manel Dueso	1998-12-20	\N	2
573	Manuel Garcia Rulfo	1994-12-23	\N	9
574	Marcia Gay Harden	1990-05-11	\N	7
576	Mari Natsuki	1997-12-31	\N	6
577	Marian Seldes	1994-12-01	\N	2
578	Mario Casas	1992-04-30	\N	2
579	Mario Maurer	2000-04-13	\N	7
580	Marion Cotillard	1987-07-09	\N	8
581	Marisa Tomei	1995-03-11	\N	6
582	Marissa Anita	1989-11-28	\N	2
583	Mark Arnold	1998-09-09	\N	7
584	Mark Gatiss	1996-10-06	\N	3
585	Mark Hamill	1996-04-03	\N	7
586	Mark Ruffalo	1985-04-30	\N	8
587	Mark Strong	1985-09-14	\N	5
588	Mark Wahlberg	1989-10-10	\N	6
589	Martin Freeman	1987-01-05	\N	10
590	Martino Lio	1995-04-21	\N	10
591	Mary Jo Catlett	1992-11-29	\N	9
592	Masaki Suda	1986-05-09	\N	6
593	Masayuki Katou	1988-07-30	\N	8
594	Mason Cook	1992-10-17	\N	4
595	MatPat	2000-05-09	\N	3
596	Matsumoto Sara	1998-09-22	\N	6
597	Matt O'Leary	1992-04-06	\N	4
598	Matthew Gray Gubler	1989-05-03	\N	3
599	Matthew Lillard	1994-10-18	\N	9
601	Matthew Wood	2000-05-12	\N	5
602	Max Martini	1992-10-07	\N	6
603	Max von Sydow	1985-02-15	\N	8
604	May Calamawy	1997-07-09	\N	10
605	Meat Loaf	2000-05-21	\N	6
606	Megan Fox	1986-03-19	\N	7
607	Megumi Hayashibara	1988-05-06	\N	2
608	Megumi Hayashibara.	1997-03-05	\N	5
609	Melanie Laurent	1998-01-26	\N	10
610	Melora Walters	1985-08-13	\N	4
611	Michael B. Jordan	1996-10-09	\N	5
612	Michael Benjamin Hernandez	1985-12-12	\N	5
613	Michael Caine	2000-04-02	\N	2
614	Michael Cera	1998-02-22	\N	5
615	Michael Douglas	1994-10-21	\N	3
616	Michael J. Fox	1995-03-21	\N	2
617	Michael Keaton	1998-04-25	\N	5
618	Michael Pena	1988-12-02	\N	9
619	Michael Wallis	1985-09-18	\N	9
620	Michel Michelis	1990-10-31	\N	6
621	Michelle Thrush	1998-12-17	\N	10
623	Mick Wingert	1994-03-11	\N	8
624	Mike Judge	1995-06-10	\N	6
625	Miles Heizer	1985-08-04	\N	7
626	Millie Bobby Brown	1985-05-14	\N	3
627	Minami Takayama	1993-09-02	\N	6
629	Miranda Cosgrove	1991-10-29	\N	8
630	Miyu Irino	1997-03-20	\N	6
631	Montana Jordan	1985-05-02	\N	6
632	Morena Baccarin	1997-03-28	\N	5
633	Morikawa Toshiyuki	1995-08-26	\N	2
634	Mr. Lawrence	1995-12-20	\N	6
635	Nam Joo-Hyuk	1999-05-11	\N	2
636	Nam Joo-hyuk	2000-03-29	\N	7
637	Nana	1996-05-27	\N	10
638	Naoko Matsui	1990-02-25	\N	10
639	Nara	1991-10-19	\N	2
640	Narita Ken	1986-03-23	\N	9
641	Natalia Dyer	1993-05-15	\N	7
642	Natalie Portman	2000-10-16	\N	4
643	Nathan Gamble	1999-07-06	\N	8
644	Nattapong Chartpong	1991-02-13	\N	6
645	Nattasha Nauljam	1986-02-19	\N	9
646	Nicholas James Otriz	1999-09-13	\N	3
647	Nicola Peltz Beckham	1988-05-23	\N	4
648	Nijirô Murakami	1996-02-20	\N	7
650	Nirut Sirichanya	1986-09-10	\N	2
651	Noah Schnapp	1994-02-20	\N	2
652	Nobutoshi Canna	1997-02-14	\N	9
653	Noel Appleby	1995-09-17	\N	9
654	Noriaki Sugiyama	1986-07-29	\N	2
655	Noriko Hidaka	1999-11-11	\N	2
657	Oh Dal-su	1999-10-24	\N	9
659	Ok Taec-yeon	1985-06-10	\N	6
660	Olek Krupa	1985-02-08	\N	9
661	Olga Fonda	1985-08-27	\N	7
662	Olivia Colman	1993-01-05	\N	6
663	Olivia Munn	1993-10-01	\N	8
664	Omar Sy	1986-02-20	\N	7
665	Oogami Izumi	1992-11-20	\N	4
666	Orlando Bloom	1994-12-28	\N	9
667	Oscar Isaac	1998-02-17	\N	3
668	Owen Wilson	1992-07-21	\N	4
669	Pachara Chirathivat	1990-07-29	\N	3
670	Paco Tous	2000-12-31	\N	2
671	Paige Spara	1990-12-14	\N	6
672	Panisara Arayaskul	2000-02-11	\N	8
673	Park Bo-gum	2000-02-21	\N	2
675	Park Byung Eun	1986-02-19	\N	10
677	Park Hoon	1991-02-03	\N	8
678	Park Ji-hu	2000-01-20	\N	7
679	Park Ju-hyun	1990-07-16	\N	4
680	Park Seo-joon	1989-06-23	\N	8
681	Park Shin-hye	1994-03-20	\N	10
682	Park So-dam	1992-07-27	\N	6
683	Park Solomon	1994-08-04	\N	10
684	Park Won-sang	1986-03-21	\N	2
685	Patricia Belcher	1993-08-14	\N	3
686	Patricia Clarkson	1989-10-13	\N	9
688	Patrick Walker	1996-08-04	\N	10
689	Patrick Wilson	1986-09-25	\N	6
690	Paul Bettany	1993-05-06	\N	4
691	Paul Dooley	1991-12-14	\N	7
692	Paul Newman	1995-02-08	\N	2
693	Paul Rudd	1989-07-16	\N	10
694	Pedro Pascal	1987-05-12	\N	5
695	Penélope Cruz	2000-10-11	\N	6
696	Petchtai Wongkamlao	1998-04-23	\N	9
697	Pete Postlethwaite	1994-02-26	\N	10
698	Peter Jacobson	1995-01-10	\N	6
699	Petrice Jones	1997-12-09	\N	10
700	Pevita Pearce	1998-07-08	\N	4
701	Pierre Coffin	1991-08-12	\N	5
702	Piper Perabo	1987-02-18	\N	10
703	Piper Rubio	1989-06-22	\N	2
704	Preity Zinta	1996-12-03	\N	8
575	Margot Robbie	1997-04-28	\N	\N
705	Preston Nyman	2000-08-01	\N	5
706	Prilly Latuconsina	1996-12-09	\N	2
707	Putri Marino	1996-11-30	\N	3
708	Ra Mi-ran	1987-02-11	\N	6
709	Rachel Amanda	1999-10-13	\N	3
710	Rachel Boston	1997-08-28	\N	4
711	Rachel McAdams	1995-04-17	\N	4
712	Raegan Revord	1995-03-30	\N	6
713	Rafael Casal	1990-08-03	\N	4
714	Rami Malek	1986-12-25	\N	6
715	Ramon Rodriguez	1986-10-13	\N	9
716	Ranbir Kapoor	1995-06-07	\N	3
717	Randall Duk Kim	1987-09-18	\N	9
718	Raoul Bova	1987-09-15	\N	3
719	Ray Stevenson	1990-02-28	\N	3
720	Rebecca Hall	1985-06-30	\N	3
721	Reiko Aylesworth	1997-08-28	\N	4
722	Reza Rahadian	1995-11-11	\N	3
723	Rhea Perlman	2000-07-13	\N	10
724	Ricardo Montalban	1998-05-12	\N	6
725	Richard Armitage	1992-12-23	\N	6
726	Richard Harris	1996-11-12	\N	3
727	Richard Linklater	1993-06-06	\N	9
728	Richard Petty	1992-01-20	\N	5
729	Richard Schiff	1985-05-30	\N	2
731	Rikiya Koyama	1985-12-22	\N	6
732	Rinko Kikuchi	1986-10-24	\N	10
733	Rio Dewanto	1997-06-09	\N	4
734	Rizky Nazar	1999-01-01	\N	7
735	Rob Paulsen	1994-08-02	\N	10
736	Rob Schneider	1987-12-16	\N	5
737	Robbie Cltrane	2000-12-12	\N	3
739	Robert Patrick	1986-01-09	\N	9
740	Robert Pattinson	1990-09-12	\N	3
741	Roberts Blossom	1996-08-06	\N	5
742	Robin Atkin Downes	1997-09-08	\N	2
743	Robin Wright	1997-02-15	\N	10
744	Rodger Bumpass	2000-03-31	\N	9
745	Roh Yeon Seo	1992-06-02	\N	5
746	Ron Livingston	1989-08-31	\N	8
747	Ron Perlman	1985-09-22	\N	8
748	Rosa Salazar	1991-10-16	\N	2
749	Rosalie Chiang	1994-11-07	\N	5
750	Rosemarie Dewitt	1995-09-12	\N	4
751	Rosie Ede	1999-03-27	\N	8
752	Rosie Huntington-Whiteley	1997-12-02	\N	2
753	Ross Butler	1998-09-23	\N	8
754	Rowan Atkinson	1993-01-27	\N	3
755	Rowan Blanchard	1997-03-26	\N	3
756	Rumi Hiiragi	1996-10-14	\N	6
757	Rupert Graves	1994-11-07	\N	2
758	Rupert Grint	1993-09-27	\N	7
759	Russell Brand	1993-08-19	\N	2
761	Ryan Gosling	1999-07-19	\N	4
762	Ryan Reynolds	1991-07-17	\N	9
763	Ryu Da-bin	1995-09-12	\N	7
764	Ryu Jun-yeol	1985-02-06	\N	4
765	Ryu Kyung-soo	1996-11-25	\N	3
766	Ryu Seung-ryong	1989-07-06	\N	4
767	Ryun Seung-ryong	1990-03-30	\N	7
768	Saif Ali Khan	1986-03-21	\N	9
769	Sala Baker	1988-04-13	\N	10
771	Salman Khan	1992-01-03	\N	7
772	Sam Claflin	1992-05-07	\N	5
774	Samuel L. Jackson	1987-10-13	\N	9
775	San Yélamos	1987-12-10	\N	3
777	Sandra Bullock	1999-05-18	\N	4
778	Sandra Oh	1992-09-13	\N	2
779	Sandrinna Michelle	1994-06-22	\N	3
780	Santiago Cabrera	1994-10-29	\N	10
781	Santino Fontana	1991-01-01	\N	2
782	Saori Hayami	1986-07-20	\N	2
783	Sarah Clarke	1997-09-11	\N	9
784	Sarah Stiles	1997-04-04	\N	3
785	Sarunyu Wongkrachang	1987-09-01	\N	9
786	Satoshi Hino	1995-01-01	\N	5
787	Saya Aizawa	1991-04-10	\N	7
789	Scott eastwood	1998-07-25	\N	6
790	Sean Astin	1996-11-06	\N	6
791	Sean Bean	1993-02-10	\N	7
792	Seo In-guk	1994-05-04	\N	8
794	Seo Ji-hye	1985-05-20	\N	6
795	Seo Jung-yeon	1987-07-26	\N	4
796	Seth Rogen	1999-08-09	\N	10
797	Shah Rukh Khan	1995-05-06	\N	10
798	Shaharuddin Thamby	1991-01-13	\N	10
799	Shailene Woodley	1991-03-11	\N	10
800	Shareefa Daanish	2000-04-15	\N	5
801	Shareeka Epps	1987-06-13	\N	6
802	Sharlit Deyzac	1994-01-15	\N	10
803	Shawn Adrian Khulafa	1993-12-03	\N	2
804	Sheila Dara Aisha	2000-10-08	\N	10
805	Sherri Saum	1993-02-05	\N	8
806	Shia LaBeouf	1985-02-22	\N	5
808	Shin Hye-sun	1993-07-25	\N	6
809	Shin Min-ah	1993-12-02	\N	2
810	Shin Seul-ki	1997-04-01	\N	8
812	Simu Liu	1994-07-27	\N	2
813	Sirin Horwang	1994-02-20	\N	9
814	Sita Nursanti	1988-04-28	\N	4
816	Sloane Murray	1991-08-27	\N	10
817	Sofia Boutella	1996-06-14	\N	4
818	Solar Dena	1985-06-10	\N	8
819	Soma Santoki	1991-01-23	\N	4
820	Somboonsuk Niyomsiri	1993-04-10	\N	2
821	Son Seok-koo	1988-09-03	\N	6
822	Son Ye-jin	1999-01-26	\N	9
823	Song Hye-kyo	1999-05-05	\N	6
824	Song Joong-ki	1994-07-31	\N	6
825	Song Kang-ho	2000-07-07	\N	8
826	Sophia Di Martino	1995-10-14	\N	7
827	Sophia Latjuba	1985-10-14	\N	4
829	Sorapong Chatree	1998-10-17	\N	4
831	Stanley Tucci	1990-03-16	\N	2
833	Stephen Hunter	1993-03-08	\N	6
834	Stephen Root	1988-05-13	\N	7
835	Sterling K. Brown	1998-05-20	\N	5
837	Steve Buscemi	1998-08-15	\N	3
838	Steve Carell	1993-05-26	\N	3
839	Steve Coogan	1994-11-22	\N	5
840	Steve Pemberton	1985-01-25	\N	4
841	Steven Pasquale	2000-04-21	\N	8
842	Stormee Klip	1990-04-07	\N	5
843	Sul Kyung Gu	1989-07-23	\N	6
844	Sumire Uesaka	1991-08-22	\N	5
845	Sung Dong-il	1985-04-29	\N	9
846	Surya Saputra	1991-10-15	\N	8
847	Syafiq Kyle	1988-06-16	\N	8
848	Syifa Hadju	1987-07-07	\N	4
849	Sylvester Stallone	1998-08-08	\N	5
850	Sylvie Hoeks	1995-04-28	\N	10
852	Tadanobu	1986-10-04	\N	3
853	Tadokoro Azusa	1994-09-18	\N	7
854	Taecyeon	1994-09-24	\N	7
855	Takuya Kimura	1997-01-05	\N	7
856	Tang Joon-sang	1991-09-14	\N	3
857	Tao Tsuchiya	2000-09-11	\N	2
858	Taron Egerton	1993-10-12	\N	8
859	Tatchakorn Boonlapoon	2000-08-26	\N	7
860	Tatsuya Gashûin	1990-04-28	\N	2
861	Taylor Lautner	1997-05-28	\N	3
862	Ted Levine	2000-02-12	\N	3
863	Teri Hatcher	1995-05-31	\N	6
864	Terri Douglas	1990-09-19	\N	10
865	Theeradej Wongpuapan	1995-03-18	\N	3
866	Theo James	1998-05-06	\N	2
867	Thomas Brodie-Sangster	1995-01-30	\N	7
868	Thomas F. Wilson	1994-02-17	\N	2
869	Thomas Jane	2000-11-25	\N	9
870	Thomas Kretschmann	1987-01-07	\N	5
871	Tian Jing	1990-02-16	\N	8
872	Tim Allen	1996-10-19	\N	9
873	Tim Conway	2000-06-10	\N	7
874	Tim Curry	1998-05-13	\N	8
875	Tim Hill	1991-06-22	\N	10
876	Tim Roth	1994-08-26	\N	5
877	Timothée Chalamet	1985-02-23	\N	4
878	Tio Pakusadewo	1999-04-16	\N	4
879	Tissa Biani Azzahra	1999-06-06	\N	8
880	Titus Wellver	1985-08-13	\N	7
881	Tobe Nwigwe	1998-05-10	\N	6
882	Toby Jones	1988-08-05	\N	8
884	Tom Berenger	2000-11-15	\N	4
886	Tom HanksRobin WrightGary Sinise	1995-10-29	\N	8
887	Tom Hardy	1996-07-31	\N	3
888	Tom Hiddleston	1994-07-16	\N	10
889	Tom Holland	1994-07-07	\N	6
890	Tom Kenny	1986-03-01	\N	6
891	Tomas	1995-04-26	\N	7
892	Tomer Capone	1998-10-17	\N	9
893	Tony Goldwyn	1988-05-31	\N	4
894	Tony Hale	1987-01-03	\N	6
895	Tony Jaa	1989-08-05	\N	3
896	Tony Revolori	1989-12-17	\N	8
897	Tony Shalhoub	1997-04-06	\N	7
898	Trevante Rhodes	1988-04-15	\N	4
899	Tsujitani Kouji	1991-06-16	\N	6
900	Ty Burrel	1987-10-09	\N	8
901	Tyrese Gibson	1994-03-27	\N	5
902	Umay Shahab	1990-05-19	\N	9
903	Una Stubbs	1999-06-21	\N	3
904	Ungsumalynn Sirapatsakmetha	2000-11-10	\N	6
906	Viola Davis	1994-09-11	\N	9
907	Vorasit Issara	1995-11-13	\N	5
908	Wakana Maruoka	1985-12-21	\N	10
909	Wakana Yamazaki	1997-10-11	\N	4
910	Walanlak Kumsuwan	1990-04-16	\N	2
911	Wallace Shawn	1991-04-07	\N	2
912	Wan Lee	1990-04-14	\N	5
913	Ward Horton	1997-07-07	\N	5
914	Watanabe Kumiko	1994-04-22	\N	7
915	Wataru Takagi	1994-03-08	\N	2
916	Will Arnett	1994-12-06	\N	10
917	Will Ferrell	1990-01-08	\N	10
918	Will Poulter	1999-04-24	\N	8
919	Willem Dafoe	1986-09-15	\N	6
920	William Kircher	1993-07-07	\N	7
921	William Lee Scott	1995-08-19	\N	5
922	William Sadler	1993-03-12	\N	6
923	Winona Ryder	1988-06-10	\N	7
924	Winston Duke	1990-10-30	\N	5
926	Wunmi Mosaku	1999-04-10	\N	10
928	Xianglong Meng	1993-05-23	\N	6
930	Yang Kyung-won	1988-07-30	\N	6
931	Yasumura Makoto	1997-07-29	\N	2
932	Ye Sun	1989-12-25	\N	3
933	Yig Huang	1998-06-27	\N	6
934	Yoo Hae-jin	1985-05-19	\N	8
935	Yoo In Soo	1988-06-23	\N	10
936	Yoo Jae-Myung	1994-11-27	\N	4
938	Yoon Byung-hee	1989-07-01	\N	7
939	Yoon Chan-young	1992-03-20	\N	3
941	Yoshino Aoyama	1995-04-17	\N	5
943	Yuen Qiu	1998-12-31	\N	6
944	Yuen Wah	1995-03-09	\N	3
945	Yui Ishikawa	1989-12-08	\N	2
946	Yuiko Tatsumi	1988-06-08	\N	9
947	Yukiko Iwai	1999-01-29	\N	9
948	Yukino Satsuki	1991-10-29	\N	2
949	Yukiyo Fujii	1987-08-29	\N	2
950	Yuko Tanaka	1999-11-25	\N	7
951	Yumi Hara	1992-03-28	\N	3
952	Yurika Ishida	1996-07-06	\N	6
953	Yuuki Kaji	1993-05-25	\N	10
954	Yuwanat Arayanimisakul	1991-04-27	\N	5
955	Yûtarô Watanabe	1988-08-14	\N	10
956	Zach Grenier	1996-06-27	\N	2
957	Zachari Levi	1994-01-16	\N	9
958	Zachary Levi	1996-08-03	\N	6
959	Zazie Beetz	1992-06-09	\N	9
960	Zendaya	1996-08-20	\N	2
961	Zitong Xia	1991-12-20	\N	4
963	Zooey Deschanel	1998-11-30	\N	7
964	Zul Ariffin	1989-09-06	\N	7
965	Wallace Shawn,John Ratzenberger	1999-10-25	\N	5
497	Kim Jung-hyun	1985-04-14	https://i.pinimg.com/736x/50/7b/33/507b331904681a0f0be341353e50da80.jpg	6
498	Kim Jung-nan	1995-12-14	https://i.pinimg.com/736x/f6/bd/6d/f6bd6df2e5ebeefed1484a928da4efb2.jpg	2
937	Yoo Su-bin	1986-08-07	https://i.pinimg.com/736x/41/65/d9/4165d90abc6259e43331bfc09b73e4fb.jpg	10
1	\N	\N	\N	\N
966	sarah	2024-11-04	https://res.cloudinary.com/dtk2yqead/image/upload/v1730664659/ft2ewk8u9x9y9txzcoid.jpg	23
967	minerale	2024-10-29	https://res.cloudinary.com/dtk2yqead/image/upload/v1730664951/ajkzuiqixkza9q6nlslg.png	21
968	burung	2024-11-04	https://res.cloudinary.com/dtk2yqead/image/upload/v1730665341/qgmxtk8wcuds56j2cfdr.jpg	\N
851	T.J. Miller	1996-11-10	\N	\N
883	Tom Bateman	1989-01-13	\N	\N
885	Tom Hanks	1990-05-13	\N	\N
905	Vera Farmiga	1994-09-22	\N	\N
971	new actor	2024-11-26	https://res.cloudinary.com/dtk2yqead/image/upload/v1731301409/omot2tbocekefxqemcda.png	10
972	Tom Ha	2024-11-06	https://res.cloudinary.com/dtk2yqead/image/upload/v1731302982/aa1ubst8dpcydybm84hs.jpg	4
970	Tes actors	2024-11-13	https://res.cloudinary.com/dtk2yqead/image/upload/v1731301365/zvioilfozgdktjnhlzvx.jpg	\N
39	Ana de Armas	1999-02-08	\N	\N
43	Andy Serkis	1985-07-17	\N	\N
76	Audrey Tautou	1987-06-25	\N	\N
79	Ava Morse	1991-08-16	\N	\N
93	Bill Fagerbakke	1986-11-04	\N	\N
131	Channing Tatum	1992-12-26	\N	\N
153	Christine Hakim	1999-11-04	\N	\N
179	Daniel Radcliffe	1988-02-27	\N	\N
199	Dawei Shen	1998-07-28	\N	\N
205	Devin Ratray	1996-02-04	\N	\N
210	Djimon Hounsou	1988-08-08	\N	\N
218	Dylan O'Brien	2000-09-26	\N	\N
220	Eddie Bracken	2000-01-26	\N	\N
223	Edward Asner	2000-04-13	\N	\N
263	Fumihiko Tachiki	1990-05-19	\N	\N
269	Geoffrey Arend	1996-10-28	\N	\N
270	Geoffrey Rush	2000-04-21	\N	\N
271	George Carlin	1990-11-27	\N	\N
277	Go Youn-jung	1988-09-18	\N	\N
313	Hope Davis	1999-09-22	\N	\N
317	Hwang Hyun-jung	2000-01-17	\N	\N
323	Ian Hart	1995-08-02	\N	\N
325	Ian McShane	1991-01-29	\N	\N
345	Jackie Chan	1999-11-10	\N	\N
347	Jackson Rathbone	1987-12-14	\N	\N
356	James Hong	1989-11-07	\N	\N
367	Jason Segel	1989-03-10	\N	\N
373	Jeff Garlin	1990-02-06	\N	\N
386	Jerome Ranft	1997-05-09	\N	\N
391	Jiao Xu	1988-03-15	\N	\N
435	Jude Law	1999-08-01	\N	\N
451	Kang Ki-young	1999-02-19	\N	\N
452	Kang Na Eon	1997-11-25	\N	\N
459	Karl Urban	1988-09-22	\N	\N
496	Kim Ji-yeon	1990-04-06	\N	\N
516	Kuwashima Houko	1990-12-06	\N	\N
523	Lashana Lynch	2000-05-15	\N	\N
545	Lee Seung-gi	1993-03-07	\N	\N
550	Lee Yoo Mi	1986-09-09	\N	\N
557	Lin-Manuel Miranda	1991-06-12	\N	\N
562	Luna Lauren Velez	1993-11-26	\N	\N
600	Matthew McConaughey	1990-07-29	\N	\N
622	Michelle Williams	1993-10-11	\N	\N
628	Minka Kelly	1990-09-21	\N	\N
649	Nikki Reed	1993-04-08	\N	\N
656	Noriko Shitaya	1990-06-29	\N	\N
658	Oh Se Eun	1992-02-22	\N	\N
674	Park Bo-young	1987-10-16	\N	\N
676	Park Eun-bin	1987-05-23	\N	\N
687	Patrick Dempsey	1991-03-16	\N	\N
730	Richmond Arquette	1987-12-16	\N	\N
738	Robert Downey Jr.	2000-02-01	\N	\N
760	Rya Kihlstedt	1991-09-21	\N	\N
770	Salma Hayek	1990-03-27	\N	\N
773	Sam Shepard	1992-07-08	\N	\N
776	Sanaa Lathan	1991-03-04	\N	\N
788	Scarlett Johansson	1989-01-27	\N	\N
793	Seo Jae Hee	1986-05-08	\N	\N
807	Shigeru Chiba	1988-09-07	\N	\N
811	Simona Brown	1997-10-19	\N	\N
815	Siân Eirian	2000-06-07	\N	\N
828	Sophie Cookson	1985-12-17	\N	\N
830	Spike Fearn	2000-08-16	\N	\N
832	Stephen Chow	1986-05-20	\N	\N
836	Sterling K. Brown.	1986-11-09	\N	\N
925	Witawat Singlampong	1998-08-23	\N	\N
927	Wyatt Bowen	1993-10-28	\N	\N
929	Yamaguchi Kappei	1986-04-19	\N	\N
940	Yoon Song-a	1990-11-03	\N	\N
942	Youji Matsuda	1995-06-14	\N	\N
962	Zoe Perry	1987-04-30	\N	\N
320	Hyun Bin	1986-12-18	https://i.pinimg.com/736x/b6/66/3c/b6663c5ddefeb451774e6bd44d7563d4.jpg	\N
\.


--
-- TOC entry 4936 (class 0 OID 16452)
-- Dependencies: 223
-- Data for Name: awards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.awards (id, name, year, country_id) FROM stdin;
196	tes award2	2024	21
200	yuk bisa	2001	23
201	oscar2	2024	3
205	new award	2024	10
2	Nominee Golden Trailer Best Fantasy / Adventure Poster	2015	5
3	Nominee Annie Outstanding Achievement in Animated Effects in a Live Action Production	2016	2
4	Nominee Teen Choice Award Choice Movie: Action	2018	5
5	Winner Teen Choice Award Choice Movie: Breakout Star	2014	10
197	teskedua	2000	20
17	Baeksang Arts Award for Best Drama	2017	9
22	MTV Movie & TV Award untuk Tokoh Antagon	2019	3
25	People's Choice Award untuk Serial TV Sci/Fi/Fantasy Favorit	2017	6
26	Golden Globes USA	2015	6
27	Bandung Film Festival for Imported Film	2016	2
28	Golden Scythe Horror Awards	2018	10
30	Baeksang Arts Award for Best Drama	2023	5
31	MTV Movie & TV Award untuk Tokoh Antagon	2012	2
32	People's Choice Award untuk Serial TV Sci/Fi/Fantasy Favorit	2023	4
33	Golden Globes USA	2010	4
34	Bandung Film Festival for Imported Film	2021	6
35	Golden Scythe Horror Awards	2023	7
37	Baeksang Arts Award for Best Drama	2017	9
40	Golden Globes USA	2011	8
41	Bandung Film Festival for Imported Film	2012	4
42	Golden Scythe Horror Awards	2011	8
43	Kids' Choice Award for Favorite Movie Actor	2010	10
44	Special Achievement Academy Award	2022	10
45	Annie Award for Outstanding Achievement for Music in a Feature Production	2023	8
46	Academy Award untuk Film Animasi Terbaik	2023	3
47	Best Animated Feature at the 25th Critics' Choice Awards	2022	8
48	Academy Award for Animated Feature	2010	4
49	Best Achievement in Music Written for Motion Pictures Original Song	2017	6
50	Best Animated Feature Film of the Year	2019	6
54	Baeksang Arts Award for Best Drama	2018	3
55	MTV Movie & TV Award untuk Tokoh Antagon	2020	9
56	People's Choice Award untuk Serial TV Sci/Fi/Fantasy Favorit	2010	3
57	Golden Globes USA	2019	9
58	Bandung Film Festival for Imported Film	2012	8
59	Golden Scythe Horror Awards	2010	5
60	Kids' Choice Award for Favorite Movie Actor	2017	9
62	Annie Award for Outstanding Achievement for Music in a Feature Production	2022	3
63	Academy Award untuk Film Animasi Terbaik	2012	10
64	Best Animated Feature at the 25th Critics' Choice Awards	2020	6
65	Academy Award for Animated Feature	2019	2
66	Best Achievement in Music Written for Motion Pictures Original Song	2019	4
67	Best Animated Feature Film of the Year	2010	7
68	Choice Movie Actor: Comedy	2012	10
69	Choice Movie: Comedy	2018	2
70	Choice Summer Movie	2022	10
73	Best Score Soundtrack for Visual Media	2020	10
74	Best Compilation Soundtrack For Visual Media	2024	2
75	Best Cinematography	2015	8
76	Best Visual Effects	2019	7
77	Best Special Visual Effects	2015	2
78	Best Art Direction and Production Design	2013	8
79	Outstanding Achievement in Cinematography in Theatrical Releases	2010	8
80	Cannes Film Festival NULL Best Director	2020	6
81	MTV Movie & TV Awards NULL Best Kiss	2015	4
82	Online Film & Television Association Awards NULL Best Sound Mixing	2010	9
83	Best Fantasy Film	2024	9
86	Best Family Film NULL Live Action	2019	9
100	Best Animated Film	2016	4
101	and Japanese Movie Fans Choice	2011	2
114	Sound Effects Editing	2021	8
115	International Indian Film Academy Awards : Best Cinematography	2020	7
116	International Indian Film Academy Awards : Best Director	2023	7
38	MTV Movie & TV Award untuk Tokoh Antagon	2022	\N
39	People's Choice Award untuk Serial TV Sci/Fi/Fantasy Favorit	2011	\N
61	Special Achievement Academy Award	2012	\N
71	Best Compilation Soundtrack for Visual	2022	\N
72	Best Song Written for Visual Media	2015	\N
84	Best Foreign Film	2015	\N
6	Winner ASCAP Award Top Box Office Films	2016	6
7	Winner Saturn Award Best Streaming Action & Adventure Series	2022	10
8	Winner ReFrame Stamp Top 100 Popular Television	2020	10
9	Winner National Board of Review Top Ten Film	2009	4
10	Winner Banff Rockie Award Best Continuing Series	2011	6
11	Nominee Saturn Award Best Science Fiction Film	2005	5
12	Indonesian Movie Actors Awards: Film Terfavorit	2022	6
13	Saturn Awards: Best Streaming Horror & Thriller Series	2022	3
14	dan 2022 Dragon Awards: Best Science Fiction or Fantasy TV Series	2017	8
15	Asian Academy Creative Awards: Best Visual or Special VFX in TV Series or Feature Film	2021	2
18	Dragon Awards: Best Science Fiction or Fantasy TV Series	2017	8
19	Dragon Awards: Best Science Fiction or Fantasy TV Series	2022	4
20	50th Anniversary Saturn Awards.	2022	6
21	People's Choice Award untuk Film Terfavorit	2019	5
24	Winner Golden Schmoes. Best Comedy of the Year	2018	6
85	BAFTA: Kids' Vote	2003	9
87	Grammy Awards	2018	5
88	Nominee Anime Award (Best Film)	2018	9
89	Nominee Annual Award (Anime Movie of The Year) 4th place	2019	4
90	Nominee Annual Award (Anime Movie of The Year) 3rd place	2020	7
92	Nominee IGN Award (Best SciNULLFi Movie)	2011	9
93	Nominee Golden Trailer (Most Original TV Spot)	2012	4
94	Nominee Huading Award (Best Animated Feature)	2015	10
96	Annie Award for Outstanding Achievement in an Animated Feature	2003	3
97	Tokyo Anime Award for Animation of The Year	2002	6
98	Manichi Film Awards for Best Film and Best Animated Film	2001	5
99	Mainichi Film Awards for Best Film	1997	10
102	Japanese Academy Awards for Best Picture dan Best Music	1998	4
104	Blue Ribbon Awards for Best Film	1989	4
105	Mainichi Film Awards for Best Animation Film	2024	10
106	Annie Awards for Outstanding Achievement in an Animated Feature	2006	3
107	Academy Awards for Best Animated Feature	2006	10
108	Mainichi Film Awards for Best Animation Film	2005	8
109	Winner Empire Award: Best British Film	2015	3
110	Winner Empire Award: Best Thriler	2018	5
111	Winner ReFrame Stamp IMDbPro Top 200 Most Popular TV Titles 2020NULL	2021	10
112	Nominee Saturn Award: Best Action/Adventure Film	2018	7
113	Winner Oscar: Best Effects	1986	2
198	input	2019	14
203	Grammy	2022	10
23	Nominee Primetime Emmy: Outstanding Animated Program.	2022	\N
91	Nominee Annual Award (Anime Movie of The Year) 5th place	2022	\N
95	Nominee Golden Rooster (Best Animated Feature)	2015	\N
103	Mainichi Film Awards for Best Film	1989	\N
120	Winner BMI Film Music Award : Film Music Steve Jablonsky	2010	3
122	Winner Hollywood Film Award: Visual Effects of the Year	2014	7
123	Winner Teen Choice Award : Choice: Fight (Bumblebee vs. Nemesis Prime)	2017	3
125	Nominee Saturn Award : Best Comic Film Motion Picture	2018	3
126	Nominee Oscar : Best Achievement in Visual Effects	2022	8
127	Winner Oscar : Best Animated Feature	2004	9
128	Winner Saturn Award : Best Animated Feature	2017	7
129	Winner Oscar Best Motion Picture of the Year	2020	2
130	Nominee Oscar Best Animated Feature Film	2023	3
131	Winner Saturn Award Best Horror Film	2014	8
132	Nominee Saturn Award Best Horror Film	2017	2
133	Nominee Oscar Best Achievement in Music Written for Motion Picture	2011	3
134	Winner Ruderman Family Foundation Seal of Authentic Representation	2020	7
135	Winner The Joey Awards Vancouver	2022	7
136	Nominee Seoul International Drama Awards	2024	2
137	Winner Academy Awards USA	2019	9
138	Winner American Cinema Editors USA	2019	9
139	Cinema Audio Society USA	2019	2
140	Golden Globes USA	2019	7
141	Motion Picture Sound Editors USA	2019	5
142	Winner Family Film Awards	2023	9
143	Kids Choice Awards USA	2024	8
144	Academy of Science Fiction	2009	9
147	Winner MTV Movie Award: Best Movie	2009	6
148	Winner MTV Movie Award: Best Female Performance (Kristen Stewart)	2009	2
149	Winner MTV Movie Award: Best Breakthrough Performance Male (Robert Pattinson)	2009	2
150	Winner People's Choice Award: Favorite Movie	2009	9
151	Winner MTV Movie Award: Best Movie	2010	8
152	Winner MTV Movie Award: Best Female Performance (Kristen Stewart)	2010	9
153	Winner MTV Movie Award: Best Male Performance (Robert Pattinson)	2010	8
154	Winner MTV Movie Award: Best Kiss (Kristen Stewart & Robert Pattinson)	2010	4
155	Winner Teen Choice Award: Choice Movie Fantasy	2010	10
156	Winner MTV Movie Award: Best Movie	2011	2
157	Winner MTV Movie Award: Best Movie	2012	3
158	Winner MTV Movie Award: Best OnNULLScreen Duo (Kristen Stewart & Robert Pattinson)	2013	5
159	Winner MTV Movie Award: Best Shirtless Performance (Taylor Lautner)	2013	10
160	Winner Teen Choice Award: Choice Movie Romance	2013	8
161	Winner Teen Choice Award: Choice Movie Actor Romance (Robert Pattinson)	2013	7
162	Winner Teen Choice Award: Choice Movie Actress Romance (Kristen Stewart)	2013	4
163	Baeksang Arts Awards for Best New Actress (Park Boyoung )	2016	3
164	Baeksang Arts Awards for Best Drama	2016	5
165	Winner Saturn Award : Best DVD Special Edition Release	2009	9
166	Winner Fright Meter Award : Best Horror Movie	2007	9
167	Winner IFCS Award : Best Horror or Science Fiction	2007	7
168	Winner Oscar : Best Achievement in Visual Effects	2015	6
169	Winner Saturn Award : Best Science Fiction Film	2015	4
170	Winner Saturn Award : Best Writing	2015	3
171	Winner ASCAP Award : Top Box Office Films	2015	2
172	Winner BAFTA Film Award  Best Special Visual Effects	2015	3
173	Winner Critics Choice Award : Best SciNULLFi/Horror Movie	2015	3
174	Winner Empire Award : Best Film	2015	2
176	Winner ACCA : Honorable Mentions	2010	6
177	Winner Georges Award : Best Foreign Drama Movie	2011	5
178	Winner Film Award : Best Picture	2010	6
179	Winner Audience Award : Best of PIFF After Dark Sidebar	2017	7
180	Winner Yoga Award	2018	6
181	Winner Hollywood Film Award	2013	5
182	Winner Sierra Award	2013	9
183	Winner ASCAP Award	2007	2
184	Winner IFMCA Award	2006	4
185	Winner Golden Schmoes	2006	4
186	Winner ASCAP Award	2008	6
187	Winner ASCAP Award	2009	7
191	Winner Teen Choice Award	2006	6
192	Nominee Blimp Award : Favorite Movie	2008	5
193	Nominee People's Choice Award	2013	8
194	Nominee Teen Choice Award	2017	6
199	malam	2020	13
117	International Indian Film Academy Awards : Best Dialogue	2015	2
118	Filmfare Awards : Best Supporting Actress	2011	8
119	International Indian Film Academy Awards : Best Film	2018	5
124	NAACP Image Award for Outstanding Original Score for TV/Film	2015	8
145	Fantasy & Horror Films	2024	7
146	USA : Best Fantasy Film	2017	10
188	CFCA Award	2014	4
189	Piala Citra	2023	2
204	tes award	2019	\N
121	Winner Hollywood Film Award: Visual Effects of the Year	2011	\N
175	Winner NBR Award : Top Ten Films	2010	\N
190	Nominee MTV Movie Award : Best Movie	2004	\N
\.


--
-- TOC entry 4935 (class 0 OID 16444)
-- Dependencies: 222
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (comment, status, created_at, movie_id, username, rate, id) FROM stdin;
Great!	t	2024-10-12 14:58:42.648764	225	john_doe	5	7
Awesome	t	2024-10-13 05:40:05.65846	225	john_doe	4	8
bagusss	t	2024-09-13 16:00:19.031331	225	sarah	5	10
I love this drama. It taught me a lot about money and finance	t	2024-10-28 14:44:30.644105	225	sarah	3	13
tes	t	2024-10-28 15:01:56.017079	226	sarah	4	14
coba approve	f	2024-09-13 16:00:19.031331	225	hayucoba	4	17
tes setelah merge final	t	2024-09-13 16:00:19.031331	225	hayucoba	5	18
coba komen pls masuk	f	2024-11-10 21:58:28.949454	225	hayucoba	5	19
bagus kata reza	t	2024-11-11 10:21:36.693533	227	3B_059_SARAH	5	20
bagus sekali	t	2024-11-11 12:28:26.844596	225	dump acc	5	21
Great movie!	f	2024-09-13 16:00:19.031331	225	john_doe	5	27
\.


--
-- TOC entry 4933 (class 0 OID 16430)
-- Dependencies: 220
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (id, name) FROM stdin;
2	United States
3	Indonesia
4	Japan
5	England
6	Malaysia
8	India
9	Spain
10	Thailand
13	tes3
14	halo
15	country
20	hll
21	harga2
23	hai
7	China
31	new country
33	yayan
41	Indonesia
42	Indonesia
43	Indonesia
44	Indonesia
45	Indonesia
46	Indonesia
47	Indonesia
48	Indonesia
49	Indonesia
\.


--
-- TOC entry 4932 (class 0 OID 16425)
-- Dependencies: 219
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.genres (id, name) FROM stdin;
1	Action
2	Adaptation
3	Adventure
4	Animation
5	Anime
6	Biography
7	Boxing
8	Comedy
9	Coming of Age
10	Crime
11	Cyberpunk
12	Dark
13	Dark Comedy
14	Dark Fantasy
15	Drama
16	Ecchi
17	Family
18	Fantasy
20	Heist
21	History
22	Horror
23	Kaiju
24	Martial Arts
25	Mistery
26	Monster Horror
27	Musical
28	Mystery
29	Psychological
30	Quest
31	Romance
32	Sci-Fi
33	Slice of Life
34	Sport
35	Superhero
36	Supernatural
37	Survival
38	Suspense
39	Suspense Mystery
40	Teen Drama
41	Teen Fantasy
42	Teen Romance
43	Thriller
44	Time Travel
52	coba genre baru
54	New Genres
55	tes genre
\.


--
-- TOC entry 4940 (class 0 OID 16471)
-- Dependencies: 227
-- Data for Name: movie_actor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movie_actor (movie_id, actor_id) FROM stdin;
226	139
226	912
226	940
227	680
227	487
227	936
227	639
227	7
227	540
227	493
227	489
227	765
228	824
228	382
228	854
228	517
228	927
228	938
228	508
228	507
228	398
229	824
229	823
229	394
229	495
229	500
229	453
229	7
229	795
229	677
230	218
230	486
230	867
230	918
230	466
230	34
230	96
231	218
231	486
231	867
231	466
231	350
231	748
231	274
232	218
232	486
232	867
232	466
232	350
232	748
232	274
232	918
233	799
233	866
233	462
233	352
233	719
233	72
234	799
234	866
234	55
234	352
234	893
235	459
235	343
235	62
235	242
235	390
235	528
235	127
235	892
235	457
236	217
236	151
236	25
236	105
236	444
236	753
236	204
236	35
236	625
237	428
237	963
237	269
237	138
237	598
237	160
237	685
237	710
237	628
238	92
238	589
238	903
238	757
238	558
238	584
238	42
238	27
238	421
239	73
239	610
239	36
239	225
239	921
239	414
239	333
239	481
239	387
240	505
240	635
240	496
240	143
240	539
240	793
240	492
240	424
240	549
241	332
241	46
241	709
241	902
241	5
241	65
241	264
241	41
241	878
242	626
242	253
242	923
242	191
242	266
242	121
242	641
242	133
242	651
243	478
243	857
243	648
243	226
243	180
243	81
243	176
243	442
243	955
244	843
244	211
244	491
244	675
244	397
244	142
244	311
244	144
244	548
245	667
245	244
245	604
245	612
245	250
245	48
245	458
245	190
246	738
246	147
246	586
246	149
246	788
246	384
247	377
247	864
247	601
247	742
247	261
247	623
247	434
247	304
248	762
248	430
248	632
248	438
248	959
248	851
248	110
248	342
249	888
249	826
249	283
249	926
249	245
249	713
250	262
250	60
250	671
250	254
250	729
251	77
251	216
251	15
251	379
251	557
252	433
252	229
252	599
252	703
252	595
253	877
253	315
253	754
253	662
253	120
254	885
254	872
254	402
254	472
254	213
254	393
254	911
254	415
254	53
255	885
255	872
255	213
255	393
255	911
255	415
255	53
255	413
255	241
256	885
256	872
256	402
256	213
256	911
256	415
256	53
256	413
256	403
257	885
257	872
257	402
257	911
257	415
257	468
257	894
257	426
257	54
258	223
258	425
258	415
258	157
258	98
258	202
258	386
258	194
258	227
259	668
259	101
259	692
259	522
259	135
259	897
259	284
259	380
259	691
259	619
259	271
259	463
259	415
259	406
259	617
259	728
259	383
259	97
260	668
260	522
260	613
260	236
260	222
260	417
260	107
260	404
260	870
260	698
260	101
260	185
260	259
260	192
260	688
260	897
260	373
260	620
261	897
261	668
261	522
261	168
261	815
261	118
261	303
262	513
262	328
262	432
262	422
262	781
263	513
263	328
263	432
263	422
264	761
264	39
264	295
264	743
264	583
264	891
264	187
264	850
264	366
265	761
265	122
265	113
265	16
265	667
265	152
265	747
265	446
265	374
266	575
266	761
266	30
266	812
266	461
266	336
266	723
266	917
266	614
267	761
267	711
267	355
267	268
267	773
267	401
267	479
267	197
267	359
268	104
268	224
268	305
268	605
268	366
268	956
268	730
268	188
268	272
269	179
269	758
269	238
269	726
269	568
269	737
269	255
269	296
269	323
270	179
270	758
270	238
270	726
270	568
270	737
270	255
270	296
270	323
271	627
271	909
271	731
271	607
271	947
271	330
271	915
271	129
271	477
272	627
272	909
272	731
272	607
272	652
272	75
272	263
272	330
272	477
273	627
273	909
273	12
273	947
273	915
273	129
273	476
273	455
273	608
274	627
274	909
274	12
274	915
274	455
274	129
274	476
274	638
274	608
275	627
275	909
275	12
275	455
275	476
275	607
275	731
275	638
275	130
276	228
276	324
276	666
276	791
276	14
276	653
276	790
276	769
276	94
277	228
277	324
277	666
277	791
277	14
277	653
277	790
277	769
277	94
278	228
278	324
278	666
278	791
278	14
278	653
278	790
278	769
278	94
279	589
279	324
279	725
279	43
279	473
279	278
279	920
279	357
279	833
280	761
280	237
280	750
280	339
280	31
281	786
281	951
281	593
281	844
281	570
281	807
281	569
282	786
282	951
282	593
282	844
282	570
282	807
282	569
283	786
283	951
283	593
283	844
283	570
283	807
283	569
284	786
284	951
284	593
284	844
284	570
284	807
284	569
285	786
285	951
285	593
285	69
285	941
285	782
285	298
285	308
286	890
286	376
286	93
286	159
286	744
286	392
286	124
286	634
286	591
287	890
287	61
287	93
287	159
287	240
287	873
287	221
287	735
287	484
288	875
288	159
288	93
288	744
288	634
288	124
288	80
288	890
288	392
289	124
289	890
289	159
289	93
289	634
289	591
289	744
289	201
289	155
290	754
290	919
290	840
290	554
290	705
290	802
290	260
290	239
290	67
291	128
291	611
291	563
291	175
291	589
291	178
291	553
291	924
291	836
292	148
292	642
292	888
292	56
292	154
292	353
292	958
292	719
292	852
293	693
293	615
293	247
293	166
293	99
293	57
293	436
293	3
293	618
294	111
294	774
294	91
294	435
294	52
294	210
294	544
294	523
294	267
295	964
295	847
295	2
295	230
295	85
295	32
295	509
295	798
295	243
296	654
296	656
296	82
296	449
296	445
297	654
297	656
297	82
297	449
297	445
298	654
298	656
298	82
298	449
298	445
299	316
299	171
299	247
299	58
299	313
299	358
299	460
299	661
300	391
300	282
300	933
300	199
300	928
300	932
300	871
300	312
300	961
301	39
301	147
301	177
301	361
302	285
303	886
304	28
304	416
304	526
304	774
304	876
305	150
305	316
305	613
305	702
306	340
306	215
306	45
306	325
306	796
306	560
306	189
306	717
306	345
307	340
307	45
307	215
307	265
307	796
307	560
307	189
307	356
307	345
308	340
308	338
308	113
308	215
308	45
308	345
308	371
308	796
308	560
309	279
309	80
309	906
309	215
309	356
309	113
309	325
309	467
310	832
310	944
310	943
310	182
310	112
311	630
311	756
311	576
312	952
312	942
312	950
313	137
313	655
313	309
314	819
314	592
314	511
315	136
315	855
315	860
316	29
316	170
316	174
316	842
316	621
317	102
317	898
317	351
317	469
317	663
317	869
317	21
317	835
318	119
318	193
318	64
318	335
318	830
318	751
319	721
319	841
319	801
320	776
320	521
320	718
321	858
321	162
321	774
321	587
321	828
321	817
321	613
321	585
322	162
322	439
322	858
322	587
322	291
322	694
322	131
322	372
323	811
323	248
323	883
324	55
324	485
324	555
324	420
324	360
325	616
325	156
325	167
325	529
325	161
325	868
326	716
326	63
326	11
326	251
326	24
327	369
327	797
327	768
327	704
328	797
328	314
328	456
328	447
328	33
329	797
329	464
329	63
330	771
330	456
330	297
331	806
331	606
331	901
331	431
331	417
331	715
331	480
331	441
332	806
332	752
332	901
332	431
332	417
332	687
333	588
333	647
333	344
333	831
333	472
333	880
334	588
334	56
334	431
334	524
334	780
334	335
335	59
335	212
335	562
335	200
335	881
335	784
336	889
336	738
336	419
336	960
336	349
336	896
336	581
336	287
336	525
337	889
337	354
337	774
337	581
337	419
337	960
337	349
337	896
337	47
338	16
338	232
338	20
338	919
338	103
338	26
338	834
338	78
338	270
339	232
339	219
339	301
339	207
339	816
339	16
339	900
339	246
339	329
340	706
340	779
340	800
340	70
340	331
341	706
341	779
341	803
341	827
341	114
342	706
342	734
342	848
342	779
342	902
343	700
343	66
343	153
343	378
343	846
343	722
344	532
344	490
344	145
344	934
344	203
345	825
345	547
345	140
345	146
345	682
345	538
345	363
346	749
346	778
346	79
346	318
347	689
347	905
347	746
348	689
348	905
348	567
349	571
349	957
349	214
350	184
350	165
350	235
350	348
350	699
350	292
350	1
350	281
350	805
351	206
351	66
351	68
351	707
351	326
351	804
351	879
352	814
352	300
352	561
352	66
352	582
353	714
353	559
353	286
353	89
353	429
353	9
354	322
354	962
354	520
354	631
354	712
354	53
355	61
355	123
355	19
355	186
355	897
355	863
355	135
355	739
355	183
355	624
355	727
356	61
356	123
356	19
356	186
356	837
356	624
356	183
356	135
356	597
357	61
357	123
357	19
357	186
357	724
357	310
357	849
357	624
357	770
358	388
358	408
358	755
358	594
358	383
358	19
358	186
358	183
358	87
359	164
359	249
359	958
359	275
359	95
359	169
359	407
359	818
359	646
360	514
360	740
360	861
360	783
360	649
360	347
360	471
360	49
360	71
360	280
361	514
361	740
361	861
361	783
361	649
361	347
361	471
361	49
361	71
361	280
362	514
362	740
362	861
362	783
362	649
362	347
362	471
362	49
362	71
362	280
363	514
363	740
363	861
363	783
363	649
363	347
363	471
363	49
363	71
363	280
364	514
364	740
364	861
364	783
364	649
364	347
364	471
364	49
364	71
364	280
365	674
365	400
365	502
365	518
365	556
365	808
365	792
365	451
366	319
366	764
366	673
366	276
366	533
366	845
366	537
366	708
366	504
367	495
367	543
367	821
367	534
368	545
368	536
368	679
368	519
368	8
369	766
369	293
369	399
369	504
369	542
369	277
369	488
370	869
370	574
370	527
370	40
370	882
370	922
370	375
370	256
370	643
370	18
371	600
371	51
371	389
371	566
371	231
371	412
371	877
371	195
371	163
371	258
372	552
372	236
372	586
372	90
372	603
372	622
372	686
372	346
372	862
372	410
373	578
373	38
373	427
373	117
373	257
373	670
373	196
373	337
373	775
373	572
374	552
374	428
374	233
374	475
374	887
374	209
374	158
374	884
374	580
374	697
375	329
375	134
375	732
375	132
375	208
375	115
375	602
376	409
376	789
376	119
376	115
376	132
376	871
376	395
376	4
377	885
377	76
377	370
377	324
377	690
377	23
378	885
378	252
378	334
378	88
378	664
378	37
378	327
379	762
379	609
379	573
379	89
379	4
380	302
380	437
380	428
381	804
381	733
381	709
381	564
381	385
381	264
381	590
381	6
381	84
382	627
382	909
382	12
382	455
382	129
382	915
382	947
382	330
382	638
383	627
383	909
383	12
383	455
383	129
383	915
383	947
383	330
383	638
384	565
384	405
384	181
384	125
384	411
384	741
384	205
384	44
384	273
385	565
385	405
385	181
385	125
385	411
385	874
385	106
385	220
385	736
386	17
386	660
386	760
386	551
386	197
386	299
386	482
386	577
386	788
387	838
387	367
387	759
387	440
387	916
387	515
387	629
387	173
387	234
388	838
388	367
388	759
388	440
388	916
388	515
388	629
388	173
388	234
389	838
389	367
389	759
389	440
389	916
389	515
389	629
389	173
389	234
390	838
390	367
390	759
390	440
390	916
390	515
390	629
390	173
390	234
391	777
391	420
391	617
391	701
391	26
391	839
391	381
391	270
391	838
391	465
392	418
392	666
392	470
392	270
392	341
392	423
392	530
393	418
393	666
393	470
393	270
393	341
393	423
393	530
394	418
394	666
394	470
394	270
394	341
394	423
394	530
395	418
395	695
395	270
395	325
395	483
395	772
395	74
396	418
396	368
396	270
396	108
396	466
396	483
397	844
397	512
397	908
397	949
397	787
398	720
398	109
398	172
399	946
399	83
399	474
400	307
400	953
400	945
401	913
401	50
401	22
402	929
402	948
402	516
402	899
402	306
402	914
402	665
402	633
402	640
403	929
403	948
403	516
403	899
403	306
403	914
403	665
403	633
403	640
404	929
404	948
404	516
404	899
404	306
404	914
404	665
404	633
404	640
405	929
405	948
405	516
405	899
405	306
405	914
405	665
405	633
406	853
406	596
406	510
406	929
406	640
406	948
406	516
406	306
406	931
407	673
407	682
407	116
408	86
408	636
408	501
408	450
409	364
409	637
410	895
410	696
410	907
411	895
411	829
411	859
412	895
412	650
412	785
413	767
413	448
413	681
413	454
413	499
413	443
413	684
413	657
414	531
414	809
414	126
414	541
414	294
414	506
414	745
414	494
415	86
415	503
415	321
415	659
415	365
415	290
415	680
415	676
416	362
416	100
416	763
416	810
416	452
416	289
416	317
416	658
417	683
417	678
417	939
417	141
417	288
417	550
417	935
417	535
418	579
418	198
418	644
419	669
419	910
419	820
420	396
420	669
420	645
421	954
421	672
421	925
422	813
422	865
422	904
437	968
437	320
437	934
437	943
437	611
437	80
437	669
437	613
437	64
448	320
449	968
449	320
449	487
449	488
449	489
449	530
449	504
449	491
449	530
438	320
438	669
439	968
450	320
453	970
453	115
454	320
455	487
456	970
456	320
456	971
457	320
472	1
472	2
475	1
475	2
476	1
476	2
478	1
478	2
479	1
479	2
480	1
480	2
477	6
477	7
\.


--
-- TOC entry 4939 (class 0 OID 16468)
-- Dependencies: 226
-- Data for Name: movie_award; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movie_award (movie_id, award_id) FROM stdin;
229	54
230	2
231	3
232	4
233	5
234	6
235	7
236	8
237	9
238	10
239	11
241	12
242	13
242	18
242	19
243	15
245	20
246	21
246	55
247	23
248	24
249	56
250	57
251	58
252	59
253	60
254	61
255	62
256	63
257	64
258	65
259	66
260	67
261	68
261	69
261	70
262	71
262	72
262	73
263	74
264	75
264	76
264	77
264	78
264	79
265	80
267	81
268	82
269	83
269	84
270	85
270	86
280	87
296	88
296	89
297	90
298	91
299	92
299	93
300	94
300	95
311	96
311	97
311	98
312	99
312	100
312	101
312	102
313	103
313	104
314	105
315	106
315	107
315	108
321	109
322	110
323	111
324	112
325	113
325	114
326	115
327	116
328	117
329	118
330	119
331	120
332	121
333	122
334	123
335	124
336	125
337	126
338	127
339	128
345	129
346	130
347	131
348	132
349	133
350	134
350	135
351	136
353	137
353	138
353	139
353	140
353	141
354	142
354	143
360	144
360	145
360	146
360	147
360	148
360	149
360	150
361	151
361	152
361	153
361	154
361	155
362	156
362	152
362	153
362	154
362	155
363	157
363	152
363	153
363	154
363	155
364	158
364	159
364	160
364	161
364	162
365	163
366	164
370	165
370	166
370	167
371	168
371	169
371	170
371	171
371	172
371	173
371	174
372	175
372	176
372	177
372	178
373	179
373	180
374	168
374	169
374	170
374	171
374	172
374	173
374	174
375	181
375	182
377	183
377	184
377	185
378	186
378	184
378	185
379	187
379	184
379	185
380	188
381	189
392	190
393	191
394	192
395	193
396	194
437	20
437	65
437	48
448	20
449	65
449	20
450	20
453	204
454	44
455	189
456	133
472	2
475	2
476	2
478	2
479	2
480	2
477	5
\.


--
-- TOC entry 4938 (class 0 OID 16465)
-- Dependencies: 225
-- Data for Name: movie_genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movie_genre (movie_id, genre_id) FROM stdin;
226	1
227	15
227	31
228	1
228	8
228	15
228	10
229	1
229	8
229	15
229	31
230	1
230	28
230	32
230	43
231	1
231	3
231	32
231	43
232	1
232	3
232	32
232	43
233	1
233	3
233	28
233	32
234	1
234	3
234	32
234	43
235	1
235	13
235	35
235	32
236	15
236	28
236	43
237	8
237	15
237	31
238	10
238	15
238	28
238	43
239	15
239	32
239	43
240	31
240	15
240	9
240	8
241	1
241	15
241	20
241	10
241	8
242	32
242	14
242	22
242	28
242	15
243	37
243	1
243	32
243	28
243	43
244	32
244	15
244	3
244	1
245	35
245	1
245	3
245	18
246	35
246	1
246	44
246	32
247	35
247	1
247	4
248	13
248	35
248	1
249	35
249	44
249	3
249	18
250	15
251	4
251	3
251	27
251	1
251	18
252	22
252	28
252	2
252	43
252	15
253	27
253	8
253	3
253	18
254	4
254	3
254	8
254	17
254	18
255	4
255	3
255	8
255	17
255	18
256	4
256	3
256	8
256	17
256	18
257	4
257	3
257	8
257	17
257	18
258	4
258	3
258	8
258	17
258	18
259	4
259	3
259	8
259	17
259	34
260	4
260	3
260	8
260	17
260	34
261	4
261	3
261	8
261	17
261	34
262	4
262	3
262	8
262	17
262	18
262	27
263	4
263	3
263	8
263	17
263	18
263	27
264	11
264	1
264	15
264	25
265	10
265	15
265	1
265	43
266	8
266	18
266	3
266	17
266	15
267	31
267	15
268	15
268	43
268	29
268	10
268	1
269	3
269	17
269	18
270	3
270	17
270	18
270	28
271	1
271	3
271	10
271	28
271	43
272	4
272	1
272	10
272	28
272	43
273	4
273	1
273	10
273	28
273	43
274	4
274	1
274	10
274	28
274	43
275	4
275	1
275	10
275	28
275	43
276	15
276	18
276	3
276	1
276	30
277	15
277	18
277	3
277	1
277	30
278	15
278	18
278	3
278	1
278	30
279	30
279	3
279	18
280	8
280	15
280	27
280	31
281	4
281	1
281	3
281	18
282	4
282	1
282	3
282	18
283	4
283	1
283	3
283	18
284	4
284	1
284	3
284	18
285	4
285	1
285	3
285	18
286	4
286	3
286	8
286	17
286	18
287	4
287	3
287	8
287	17
287	18
288	4
288	3
288	8
288	17
288	18
289	4
289	3
289	8
289	17
289	18
290	8
290	17
291	1
291	3
292	1
292	3
292	18
293	1
293	8
294	1
294	3
295	1
295	3
295	10
295	15
295	28
295	43
296	5
296	1
296	3
296	15
296	18
297	5
297	1
297	3
297	15
297	18
298	5
298	1
298	3
298	15
298	18
299	7
299	1
299	15
299	32
299	34
300	1
300	3
300	4
300	18
300	17
301	8
301	10
301	15
301	28
301	43
302	28
302	43
303	15
303	31
304	10
304	15
305	15
305	28
305	32
306	4
306	1
306	3
306	8
306	17
306	18
307	4
307	1
307	3
307	8
307	15
307	17
307	18
308	4
308	1
308	3
308	8
308	17
308	18
309	4
309	1
309	3
309	8
309	17
309	18
310	1
310	8
310	18
311	5
311	18
311	3
311	36
311	15
312	5
312	18
312	3
312	1
312	15
312	31
313	5
313	18
313	3
313	17
313	36
314	5
314	18
314	3
314	36
315	5
315	18
315	3
315	36
315	15
315	31
316	26
316	32
316	22
316	32
316	43
317	26
317	32
317	22
317	32
317	43
318	26
318	32
318	22
318	32
318	43
319	26
319	32
319	22
319	32
319	43
320	26
320	32
320	22
320	32
320	43
321	3
321	1
321	8
322	3
322	1
322	8
322	43
323	15
323	28
323	43
324	10
324	1
325	8
325	32
325	3
326	31
326	27
327	31
327	27
327	8
328	15
328	27
328	17
329	31
329	15
330	3
330	15
330	17
331	1
331	3
331	32
332	1
332	3
332	32
333	1
333	3
333	32
334	1
334	3
334	32
335	1
335	3
335	32
336	35
336	1
336	3
336	32
336	8
336	18
337	35
337	1
337	3
337	32
337	8
337	18
338	3
338	4
338	8
338	17
339	3
339	4
339	8
339	17
340	22
340	28
340	43
341	22
342	22
343	1
343	3
343	15
343	18
343	32
344	22
344	28
344	43
345	15
345	43
346	3
346	4
346	8
346	15
346	18
347	22
347	28
347	43
348	22
348	28
348	43
349	3
349	4
350	15
350	18
350	22
350	28
350	43
351	15
351	21
351	31
352	15
352	22
352	28
352	32
352	43
353	6
353	15
353	27
354	8
355	1
355	3
355	8
355	17
355	32
356	1
356	3
356	8
356	17
356	32
357	1
357	3
357	8
357	17
357	32
358	1
358	3
358	8
358	17
358	32
359	1
359	3
359	8
359	17
359	32
360	12
360	18
360	40
360	41
360	42
360	15
360	18
360	31
361	12
361	18
361	40
361	41
361	42
361	15
361	18
361	31
362	12
362	18
362	40
362	41
362	42
362	15
362	18
362	31
363	12
363	18
363	40
363	41
363	42
363	15
363	18
363	31
364	12
364	18
364	40
364	41
364	42
364	15
364	18
364	31
365	31
365	18
365	15
365	8
365	22
366	33
366	17
366	31
366	15
366	8
367	15
367	33
367	31
368	43
368	28
368	10
368	15
369	36
369	1
369	15
369	43
369	18
370	22
370	32
370	43
371	3
371	15
371	32
372	15
372	28
372	43
373	10
373	15
373	28
373	43
374	1
374	3
374	32
374	43
375	23
375	1
375	3
375	32
376	23
376	1
376	3
376	32
377	39
377	28
377	43
378	1
378	3
378	10
378	15
378	28
379	1
379	43
380	31
380	15
380	8
381	15
381	17
381	3
382	4
382	28
382	3
382	43
382	10
383	4
383	28
383	3
383	43
383	10
384	8
384	17
385	8
385	17
386	8
386	17
387	4
387	3
387	8
387	10
387	32
388	4
388	3
388	8
388	10
388	32
389	4
389	3
389	8
389	10
389	32
390	4
390	3
390	8
390	10
390	32
391	4
391	3
391	8
391	10
391	32
392	1
392	3
392	18
393	1
393	3
393	18
394	1
394	3
394	18
395	1
395	3
395	18
396	1
396	3
396	18
397	5
397	8
397	31
398	4
398	1
398	32
399	8
399	31
399	16
400	1
400	15
400	38
401	22
401	28
401	43
402	1
402	3
402	18
402	31
403	1
403	3
403	18
403	31
404	1
404	3
404	18
404	31
405	1
405	3
405	18
405	31
406	1
406	3
406	18
407	15
407	31
407	33
408	15
408	31
408	8
409	1
409	10
409	43
409	28
409	15
410	1
410	3
410	24
411	1
411	3
411	24
412	1
412	3
412	24
413	15
413	8
414	15
414	31
415	8
415	31
415	15
416	28
416	43
417	28
417	1
417	15
418	8
418	22
419	15
419	31
419	8
420	8
420	27
420	31
421	8
421	15
421	27
421	31
422	8
422	31
422	15
437	1
437	2
448	1
449	1
449	2
449	7
438	1
438	2
438	3
439	1
439	29
439	3
439	2
439	7
450	1
453	1
454	33
454	37
455	55
456	40
456	32
456	54
458	1
458	2
458	3
457	1
457	54
457	32
457	2
457	5
459	1
459	2
460	1
460	2
461	1
461	2
462	1
462	2
463	1
463	2
464	1
464	2
465	1
466	1
466	2
467	1
467	2
468	1
468	2
469	1
469	2
470	1
470	2
471	1
471	2
472	1
472	2
475	1
475	2
476	1
476	2
478	1
478	2
479	1
479	2
480	1
480	2
477	3
477	4
\.


--
-- TOC entry 4931 (class 0 OID 16402)
-- Dependencies: 218
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movies (id, title, alt_title, synopsis, year, availability, trailer, images, created_at, rates, country_id, status) FROM stdin;
230	The Maze Runner	NaN	Awakening in an elevator, remembering nothing of his past, Thomas emerges into a world of about thirty teenage boys, all without past memories, who have learned to survive under their own set of rules in a completely enclosed environment, subsisting on their own agriculture and supplies. With a new boy arriving every thirty days, the group has been in "The Glade" for three years, trying to find a way to escape through the Maze that surrounds their living space (patrolled by cyborg monsters named 'Grievers'). They have begun to give up hope when a comatose girl arrives with a strange note, and their world begins to change with the boys dividing into two fActions: those willing to risk their lives to escape and those wanting to hang onto what they've got and survive.—KelseyJ	2014	Netflix 	https://youtu.be/AwwbhhjQ9Xk?si=PJjZKZH7amEgeBhA	https://posters.movieposterdb.com/14_08/2014/1790864/s_1790864_fe41cf34.jpg	2024-09-30 01:19:27.57227	\N	2	Approved
231	The Maze Runner: Scorch Trials	NaN	The second chapter of the epic "Maze Runner" saga. Thomas (Dylan O'Brien) and his fellow Gladers face their greatest challenge yet: searching for clues about the mysterious and powerful organization known as WCKD. Their journey takes them to the Scorch, a desolate landscape filled with unimaginable obstacles. Teaming up with resistance fighters, the Gladers take on WCKD's vastly superior forces and uncover its shocking plans for them all.—20th Century Fox	2015	Netflix 	https://youtu.be/-44_igsZtgU?si=7ufXYEqfDzdeZRy2	https://posters.movieposterdb.com/15_05/2015/4046784/s_4046784_cbb64415.jpg	2024-09-30 01:19:27.57662	\N	2	Approved
232	Maze Runner: The Death Cure	NaN	In the epic finale to The Maze Runner Saga, Thomas leads his group of escaped Gladers on their final and most dangerous mission yet. To save their friends, they must break into the legendary last city, a WCKD controlled labyrinth that may turn out to be the deadliest maze of all. Anyone who makes it out alive will get the answers to the questions the Gladers have been asking since they first arrived in the maze. Will Thomas and the crew make it out alive? Or will Ava Paige get her way?	2018	Netflix 	https://youtu.be/4-BTxXm8KSg?si=RHS5aQagm2ylIRLq	https://posters.movieposterdb.com/20_06/2018/4500922/s_4500922_2663b144.jpg	2024-09-30 01:19:27.580452	\N	2	Approved
233	Divergent	NaN	In a world divided by fActions based on virtues, Tris learns she's Divergent and won't fit in. When she discovers a plot to destroy Divergents, Tris and the mysterious Four must find out what makes Divergents dangerous before it's too late.	2014	Netflix 	https://youtu.be/Aw7Eln_xuWc?si=k4I06AV1XEC1TYzb	https://posters.movieposterdb.com/14_03/2014/1840309/s_1840309_2f948395.jpg	2024-09-30 01:19:27.584232	\N	2	Approved
234	Insurgent	The Divergent Series: Insurgent	Beatrice Prior must confront her inner demons and continue her fight against a powerful alliance which threatens to tear her society apart with the help from others on her side.	2015	Netflix 	https://youtu.be/OBn_LRp-D7U?si=PozBNB6ftInKVdDe	https://posters.movieposterdb.com/15_01/2015/2908446/s_2908446_b96edb43.jpg	2024-09-30 01:19:27.586584	\N	2	Approved
235	The Boys	NaN	A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.	2019	Amazon Prime	https://www.youtube.com/watch?v=5SKP1_F7ReE	https://posters.movieposterdb.com/20_01/2019/1190634/l_1190634_22fcc492.jpg	2024-09-30 01:19:27.588726	\N	2	Approved
236	13 Reasons Why	NaN	Follows teenager Clay Jensen, in his quest to uncover the story behind his classmate and crush, Hannah, and her decision to end her life.	2017	Netflix	https://www.youtube.com/watch?v=QkT-HIMSrRk	https://posters.movieposterdb.com/21_02/2017/1837492/s_1837492_8fa1eebf.jpg	2024-09-30 01:19:27.592443	\N	2	Approved
237	500 days of summer	NaN	After being dumped by the girl he believes to be his soulmate, hopeless romantic Tom Hansen reflects on their relationship to try and figure out where things went wrong and how he can win her back.	2009	Netflix	https://www.youtube.com/watch?v=PsD0NpFSADM	https://posters.movieposterdb.com/09_10/2009/1022603/l_1022603_997c5a61.jpg	2024-09-30 01:19:27.595777	\N	2	Approved
238	Sherlock	NaN	The quirky spin on Conan Doyle's iconic sleuth pitches him as a "high-functioning sociopath" in modern-day London. Assisting him in his investigations: Afghanistan War vet John Watson, who's introduced to Holmes by a mutual acquaintance.	2010	Amazon Prime	https://www.youtube.com/watch?v=gGqWqGOSTGQ	https://posters.movieposterdb.com/10_08/2010/1475582/l_1475582_6c4d4dac.jpg	2024-09-30 01:19:27.599849	\N	2	Approved
239	The Butterfly Effect	NaN	Evan Treborn suffers blackouts during significant events of his life. As he grows up, he finds a way to remember these lost memories and a supernatural way to alter his life by reading his journal.	2004	Netiflix	https://www.youtube.com/watch?v=LOS5YgJkjZ0	https://posters.movieposterdb.com/12_11/2004/289879/s_289879_365cbc14.jpg	2024-09-30 01:19:27.602818	\N	2	Approved
241	Mencuri Raden Saleh	Stealing Raden Saleh	To save his father, a master forger sets out to steal an invaluable painting with the help of a motley crew of specialists.	2022	Netflix	https://youtu.be/DN3sRz_veBU?feature=shared	https://www.imdb.com/title/tt13484872/mediaviewer/rm1518605569/	2024-09-30 01:19:27.609793	\N	3	Approved
242	Stranger Things	NaN	In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.	2016	Netflix	https://youtu.be/mnd7sFt5c3A?feature=shared	https://www.imdb.com/title/tt4574334/mediaviewer/rm3336115457/	2024-09-30 01:19:27.613942	\N	2	Approved
243	Alice in BorderLand	Imawa no Kuni no Arisu	Obsessed gamer Arisu suddenly finds himself in a strange, emptied-out version of Tokyo in which he and his friends must compete in dangerous games in order to survive.	2020	Netflix	https://youtu.be/49_44FFKZ1M?feature=shared	https://www.imdb.com/title/tt10795658/mediaviewer/rm1695491329/	2024-09-30 01:19:27.618388	\N	4	Approved
245	Moon Knight	NaN	Steven Grant discovers he's been granted the powers of an Egyptian moon god. But he soon finds out that these newfound powers can be both a blessing and a curse to his troubled life.	2022	Disney+	https://www.youtube.com/watch?v=x7Krla_UxRg	https://prod-ripcut-delivery.disney-plus.net/v1/variant/disney/D57E6C2B5AC51D335FF7DF86DCA0E76A1AACBC5638033ADF97B28E8E480B011B/scale?width=506&amp;aspectRatio=2.00&amp;format=webp	2024-09-30 01:19:27.625306	\N	2	Approved
448	tes coba lagi	exam	ddd	1987	Amazon Prime Video, Google Play Movies	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	https://res.cloudinary.com/dtk2yqead/image/upload/v1731275319/kf5eyvdjhu5dyuijq9ar.jpg	2024-11-11 04:48:39.91545	\N	21	Unapproved
459	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 02:48:21.745379	\N	1	Unapproved
246	Avenger : Endgame	NaN	After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' Actions and restore balance to the universe.	2019	Disney+	https://www.youtube.com/watch?v=iKaruCq6ZY8	https://prod-ripcut-delivery.disney-plus.net/v1/variant/disney/DB176BD1488D7E4822256EF1778C124FC17388FC1E7F0F6D89B38AFF5FB001F6/scale?width=1200&aspectRatio=1.78&format=webp	2024-09-30 01:19:27.628096	\N	2	Approved
247	What If...?	NaN	Exploring pivotal moments from the Marvel Cinematic Universe and turning them on their head, leading the audience into uncharted territory.	2021	Disney+	https://www.youtube.com/watch?v=x9D0uUKJ5KI	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLXdZZt0GwN7zCAJcnsbbvYM2mvKYlcYwC3Q&s	2024-09-30 01:19:27.632568	\N	2	Approved
248	Deadpool 2	NaN	Foul-mouthed mutant mercenary Wade Wilson (a.k.a. Deadpool) assembles a team of fellow mutant rogues to protect a young boy with abilities from the brutal, time-traveling cyborg Cable.	2018	Disney+	https://youtu.be/20bpjtCbCz0	https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.marvel.com%2Fmovies%2Fdeadpool-2&psig=AOvVaw2dKlUvctklnBFvnhyfFDAw&ust=1724739856343000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOC12PCCkogDFQAAAAAdAAAAABAR	2024-09-30 01:19:27.635632	\N	2	Approved
250	The Good Doctor	NaN	Shaun Murphy, a young surgeon with autism and savant syndrome, relocates from a quiet country life to join a prestigious hospital surgical unit. Alone in the world and unable to personally connect with those around him, Shaun uses his extraordinary medical gifts to save lives and challenge the skepticism of his colleagues.	2017	Netflix	https://youtu.be/lnY9FWUTY84	https://m.media-amazon.com/images/M/MV5BNjMwNDNkMzEtNzRmNy00YmExLTg3ZWYtM2NjMjFjNWY3MmM0XkEyXkFqcGdeQXVyMTY0Njc2MTUx._V1_FMjpg_UX1000_.jpg	2024-09-30 01:19:27.64141	\N	2	Approved
251	Moana	NaN	Moana, daughter of chief Tui, embarks on a journey to return the heart of goddess Te Fitti from Maui, a demigod, after the plants and the fish on her island start dying due to a blight.	2016	Disney+	https://youtu.be/LKFuXETZUsI	https://upload.wikimedia.org/wikipedia/id/thumb/2/26/Moana_Teaser_Poster.jpg/220px-Moana_Teaser_Poster.jpg	2024-09-30 01:19:27.643107	\N	2	Approved
252	Five Night At Freddy	NaN	A troubled security guard begins working at Freddy Fazbear's Pizzeria. While spending his first night on the job, he realizes the late shift at Freddy's won't be so easy to make it through.	2023	Netflix	https://youtu.be/0VH9WCFV6XQ	https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Five_Nights_At_Freddy%27s_poster.jpeg/220px-Five_Nights_At_Freddy%27s_poster.jpeg	2024-09-30 01:19:27.648959	\N	2	Approved
253	Wonka	NaN	Armed with nothing but a hatful of dreams, young chocolatier Willy Wonka manages to change the world, one delectable bite at a time.	2023	Netflix	https://youtu.be/otNh9bTjXWg	https://awsimages.detik.net.id/community/media/visual/2023/12/08/film-wonka-2.jpeg?w=600&q=90	2024-09-30 01:19:27.652768	\N	2	Approved
254	Toy Story 1	NaN	A little boy named Andy loves to be in his room, playing with his toys, especially his doll named "Woody". But, what do the toys do when Andy is not with them, they come to life. Woody believes that his life (as a toy) is good. However, he must worry about Andy's family moving, and what Woody does not know is about Andy's birthday party. Woody does not realize that Andy's mother gave him an Action figure known as Buzz Lightyear, who does not believe that he is a toy, and quickly becomes Andy's new favorite toy. Woody, who is now consumed with jealousy, tries to get rid of Buzz. Then, both Woody and Buzz are now lost. They must find a way to get back to Andy before he moves without them, but they will have to pass through a ruthless toy killer, Sid Phillips.	1995	Disney+, Prime Video	https://www.youtube.com/watch?v=v-PjgYDrg70	https://www.imdb.com/title/tt0114709/mediaviewer/rm3813007616/?ref_=tt_ov_i	2024-09-30 01:19:27.655121	\N	2	Approved
255	Toy Story 2	NaN	While Andy is away at summer camp Woody has been toynapped by Al McWiggin, a greedy collector and proprietor of "Al's Toy Barn". In this all-out rescue mission, Buzz and his friends Mr. Potato Head, Slinky Dog, Rex and Hamm spring into Action to rescue Woody from winding up as a museum piece. They must find a way to save him before he gets sold in Japan forever and they'll never see him again.	1999	Disney+, Prime Video	https://www.youtube.com/watch?v=xNWSGRD5CzU	https://www.imdb.com/title/tt0120363/mediaviewer/rm1969689600/?ref_=tt_ov_i	2024-09-30 01:19:27.658844	\N	2	Approved
256	Toy Story 3	NaN	Woody, Buzz and the whole gang are back. As their owner Andy prepares to depart for college, his loyal toys find themselves in daycare where untamed tots with their sticky little fingers do not play nice. So, it's all for one and one for all as they join Barbie's counterpart Ken, a thespian hedgehog named Mr. Pricklepants and a pink, strawberry-scented teddy bear called Lots-o'-Huggin' Bear to plan their great escape.	2010	Disney+, Prime Video	https://www.youtube.com/watch?v=JcpWXaA2qeg	https://www.imdb.com/title/tt0435761/mediaviewer/rm3038678784/?ref_=tt_ov_i	2024-09-30 01:19:27.6629	\N	2	Approved
257	Toy Story 4	NaN	Woody, Buzz Lightyear and the rest of the gang embark on a road trip with Bonnie and a new toy named Forky. The adventurous journey turns into an unexpected reunion as Woody's slight detour leads him to his long-lost friend Bo Peep. As Woody and Bo discuss the old days, they soon start to realize that they're two worlds apart when it comes to what they want from life as a toy.	2019	Disney+, Prime Video	https://www.youtube.com/watch?v=wmiIUN-7qhE	https://www.imdb.com/title/tt1979376/mediaviewer/rm3789906688/?ref_=tt_ov_i	2024-09-30 01:19:27.670134	\N	2	Approved
258	UP	NaN	As a boy, Carl Fredricksen wanted to explore South America and find the forbidden Paradise Falls. About 64 years later he gets to begin his journey along with Boy Scout Russell by lifting his house with thousands of balloons. On their journey, they make many new friends including a talking dog, and figure out that someone has evil plans. Carl soon realizes that this evildoer is his childhood idol.	2009	Disney+, Prime Video	https://www.youtube.com/watch?v=ORFWdXl_zJ4	https://www.imdb.com/title/tt1049413/mediaviewer/rm3826338560/?ref_=tt_ov_i	2024-09-30 01:19:27.674845	\N	2	Approved
259	Cars 1	NaN	While traveling to California for the dispute of the final race of the Piston Cup against The King and Chick Hicks, the famous Lightning McQueen accidentally damages the road of the small town Radiator Springs and is sentenced to repair it. Lightning McQueen has to work hard and finds friendship and love in the simple locals, changing its values during his stay in the small town and becoming a true winner.	2006	Netflix	https://youtu.be/WGByijP0Leo	https://www.imdb.com/title/tt0317219/mediaviewer/rm3794114560/?ref_=tt_ov_i	2024-09-30 01:19:27.679746	\N	2	Approved
260	Cars 2	NaN	The famous race car Lightning McQueen and his team are invited to compete in the World Grand Prix race. There, McQueen's best friend Mater finds himself involved in international espionage, and alongside two professional British spies attempts to uncover a secret plan led by a mysterious mastermind and his criminal gang, which threatens the lives of all competitors in the tournament.	2011	Netflix	https://youtu.be/WGByijP0Leo	https://www.imdb.com/title/tt1216475/mediaviewer/rm1951513344/?ref_=tt_ov_i	2024-09-30 01:19:27.687429	\N	2	Approved
261	Cars 3	NaN	Blindsided by a new generation of blazing-fast racers, the legendary Lightning McQueen is suddenly pushed out of the sport he loves. To get back in the game, he will need the help of an eager young race technician with her own plan to win, inspiration from the late Fabulous Hudson Hornet, and a few unexpected turns. Proving that #95 isn't through yet will test the heart of a champion on Piston Cup Racing's biggest stage!	2017	Netflix	https://youtu.be/2LeOH9AGJQM 	https://www.imdb.com/title/tt3606752/mediaviewer/rm3965727488/?ref_=tt_ov_i	2024-09-30 01:19:27.692689	\N	2	Approved
263	Frozen 2	NaN	Having harnessed her ever-growing power after lifting the dreadful curse of eternal winter in Frozen (2013), Queen Elsa, the grand conjurer of snow and ice, and her sister, Princess Anna, now enjoy a happy life in the peaceful kingdom of Arendelle. However, a melodious, insistent voice only Elsa can hear keeps her awake, inviting the Snow Queen to a fabled mystical forest. As a result, unable to block the thrilling call of the secret siren, Elsa follows the voice into the perpetually misty realm in the woods to find answers. But, more and more, an inexplicable imbalance hurts her kingdom and the neighboring tribe of Northuldra. Is Queen Elsa's legendary magic enough to restore peace and stability?	2019	Netflix	https://youtu.be/bwzLiQZDw2I	https://www.imdb.com/title/tt4520988/mediaviewer/rm1974176257/?ref_=tt_ov_i	2024-09-30 01:19:27.702248	\N	2	Approved
264	Blade Runner 2049	NaN	Thirty years after the events of Blade Runner (1982), a new Blade Runner, L.A.P.D. Officer "K" (Ryan Gosling), unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard (Harrison Ford), a former L.A.P.D. Blade Runner, who has been missing for thirty years.	2017	Netflix, Prime Video, Vidio	https://www.youtube.com/watch?v=gCcx85zbxz4	https://www.imdb.com/title/tt1856101/mediaviewer/rm2677875712/?ref_=tt_ov_i	2024-09-30 01:19:27.704989	\N	2	Approved
265	Drive	NaN	A skilled Hollywood stuntman, who also moonlights as a getaway driver for criminals, lives a solitary life. However, his world changes when he forms a bond with his neighbor, Irene, and her young son. When Irene's husband returns from prison and gets involved in a dangerous deal, the driver offers to help. This decision draws him into a deadly underworld of crime and violence, where he must navigate betrayal and survival.	2011	Amazon Prime Video, Apple TV, Google Play Movies	https://www.youtube.com/watch?v=KBiOF3y1W0Y	https://www.imdb.com/title/tt0780504/mediaviewer/rm1089084160/?ref_=tt_ov_i	2024-09-30 01:19:27.707878	\N	2	Approved
266	Barbie (2023)	NaN	Barbie lives in the perfect world of Barbieland, but she begins to experience an existential crisis that sends her on an adventure into the real world. Accompanied by Ken, she learns about life outside her utopian universe, discovering self-discovery, identity, and empowerment along the way.	2023	Amazon Prime Video, Apple TV, Google Play Movies	https://www.youtube.com/watch?v=pBk4NYhWNMM	https://www.imdb.com/title/tt1517268/mediaviewer/rm431105281/?ref_=tt_ov_i	2024-09-30 01:19:27.712739	\N	2	Approved
267	The notebook	NaN	A young couple falls deeply in love during one summer, but circumstances and social expectations drive them apart. Years later, their story is retold through a notebook, revealing the enduring power of their love as they navigate life, loss, and rediscovery.	2004	Amazon Prime Video, Apple TV, Google Play Movies	https://www.youtube.com/watch?v=BjJcYdEOI0k	https://www.imdb.com/title/tt0332280/mediaviewer/rm2532203265/?ref_=tt_ov_i	2024-09-30 01:19:27.718054	\N	2	Approved
268	Fight club	NaN	A disillusioned white-collar worker forms an underground fight club with a charismatic soap salesman as a form of male bonding and release from their mundane lives. As the club grows, it spirals into a dangerous and anarchic organization, pushing the limits of their rebellion and self-destruction.	1999	Amazon Prime Video, Apple TV, Google Play Movies	https://www.youtube.com/watch?v=qtRKdVHc-cE	https://www.imdb.com/title/tt0137523/mediaviewer/rm1412004864/?ref_=tt_ov_i	2024-09-30 01:19:27.720393	\N	2	Approved
269	Harry Potter and The Sorcerer’s Stone	NaN	An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.	2001	Amazon Prime Video, Netflix, Google Play Movies	https://youtu.be/VyHV0BRtdxo?si=N2ih8rFKoiAkckUf	https://m.media-amazon.com/images/M/MV5BNmQ0ODBhMjUtNDRhOC00MGQzLTk5MTAtZDliODg5NmU5MjZhXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_.jpg	2024-09-30 01:19:27.723589	\N	5	Approved
270	Harry Potter and The Chamber of Secrets	NaN	Harry Potter lives his second year at Hogwarts with Ron and Hermione when a message on the wall announces that the legendary Chamber of Secrets has been opened. The trio soon realize that, to save the school, it will take a lot of courage.	2002	Amazon Prime Video, Netflix, Google Play Movies	https://youtu.be/nE11U5iBnH0?si=-CH0iV5bZbi80wrM	https://m.media-amazon.com/images/M/MV5BMjE0YjUzNDUtMjc5OS00MTU3LTgxMmUtODhkOThkMzdjNWI4XkEyXkFqcGdeQXVyMTA3MzQ4MTc0._V1_.jpg	2024-09-30 01:19:27.726613	\N	5	Approved
271	Meitantei Konan Kurogane no Sabumarin	Detective Conan: Black Iron Submarine	Many engineers from around the world gather at the Interpol marine facility "Pacific Buoy" on Hachijo-jima, in the sea south of central Tokyo Prefecture coast, to witness the launch of a new system that connects all law enforcement camera systems around the world and enables facial recognition worldwide. Conan, along with his friends Kogoro, Ran, Agasa, Haibara, and the Detective Boys, also heads to the island with an invitation from Sonoko to see the whales. He receives a message from Subaru, who says that a Europol agent has been murdered in Germany by Gin. Perturbed, Conan sneaks onto the police ship led by Kuroda, which is bringing them to the island to protect the completion work, and tours the new facility, just in time for the Black Organization to kidnap a female engineer, seeking a piece of important data in her USB drive. A terrifying howl of screws is heard from the ocean as an unknown person approaches Haibara.	2023	Cacthplay	https://www.youtube.com/watch?v=0rNpSmVmN2U	https://www.movieposterdb.com/detective-conan-black-iron-submarine-i27521477	2024-09-30 01:19:27.732978	\N	4	Approved
272	Meitantei Conan: Halloween no Hanayome	Detective Conan: The Bride of Halloween	During the wedding of Takagi and Sato, an assailant breaks and tries to attack Sato. But Takagi protects her while getting injured. The attacker escapes, but the situation is settled, although Sato is rightfully rattled by it all.	2022	Netflix, Bstation	https://www.youtube.com/watch?v=LzCD9wPNd6A	https://www.movieposterdb.com/detective-conan-the-bride-of-halloween-i19770970	2024-09-30 01:19:27.736567	\N	4	Approved
273	Meitantei Conan: Tokei-jikake no matenrou	Detective Conan: The TimeNULLBombed Skyscraper	Detective Shinichi Kudo was once a brilliant teenage detective until he was given a poison that reverted him to a 4 year old. He's taken the name Conan Edogawa so no one (except an eccentric inventor) will know the truth. Now he's got to solve a series of bombings before his loved ones become victims. Who is this madman and why is he doing this. Only the young genius can save the day but will even he be up to the task?	1997	Netflix, Bstation	https://www.youtube.com/watch?v=N4CP6BMyn2s	https://www.movieposterdb.com/meitantei-conan-tokei-jikake-no-matenrou-i131479	2024-09-30 01:19:27.739515	\N	4	Approved
274	Meitantei Conan: 14 banme no target	Detective Conan: The Fourteenth Target	an’s secret past revealed! Ten years ago, something happened between her mom and dad. Now, plagued by nightmares, Ran is starting to remember… Meanwhile, a murderous card dealer breaks out of jail to seek revenge. His target: Ran’s father. Can Conan stop him in time and save his girlfriend’s family?	1998	Netflix, Bstation	https://www.youtube.com/watch?v=BlJsEmOWQ1E	https://www.movieposterdb.com/meitantei-conan-14-banme-no-target-i965649	2024-09-30 01:19:27.742399	\N	4	Approved
275	Meitantei Conan: Meikyuu no crossroad	Detective Conan: Crossroad in the Ancient Capital	As the police struggle to find a lead, a Kyoto temple seeks the renowned detective Kogorou Mouri's help after receiving a mysterious puzzle. Joined by the young sleuth Conan Edogawa and high school detective Heiji Hattori, they embark on a quest to decipher the riddle, unravel the killer's identity, and confront their shared pasts.	2003	Netflix, Bstation	https://www.youtube.com/watch?v=OEWgyMspNR4	https://www.movieposterdb.com/meitantei-conan-meikyuu-no-crossroad-i1133935	2024-09-30 01:19:27.748233	\N	4	Approved
301	knives out	NaN	A detective investigates the death of the patriarch of an eccentric, combative family.	2019	Netflix	https://www.youtube.com/watch?v=qGqiHJTsRkQ 	https://cdn.shopify.com/s/files/1/0057/3728/3618/products/726b1b0e4005ab2219e31b5582e0602a_500x749.jpg?v=1573572660	2024-09-30 01:19:27.874089	\N	2	Approved
276	The Lord of the Rings: The Fellowship of the Ring	NaN	An ancient Ring thought lost for centuries has been found, and through a strange twist of fate has been given to a small Hobbit named Frodo. When Gandalf discovers the Ring is in fact the One Ring of the Dark Lord Sauron, Frodo must make an epic quest to the Cracks of Doom in order to destroy it. However, he does not go alone. He is joined by Gandalf, Legolas the elf, Gimli the Dwarf, Aragorn, Boromir, and his three Hobbit friends Merry, Pippin, and Samwise. Through mountains, snow, darkness, forests, rivers and plains, facing evil and danger at every corner the Fellowship of the Ring must go. Their quest to destroy the One Ring is the only hope for the end of the Dark Lords reign	2001	prime video	https://youtu.be/V75dMMIW2B4?si=FxXoVC24ce1f47mn	lord_of_the_rings_the_fellowship_of_the_ring_2001_advance_original_film_art_50ea31a0-b4d5-489c-89e4-c494a7966b4e_5000x.jpg (1018×1500) (originalfilmart.com)	2024-09-30 01:19:27.75412	\N	2	Approved
277	The Lord of the Rings: The Return of the King	NaN	The final confrontation between the forces of good and evil fighting for control of the future of Middle-earth. Frodo and Sam reach Mordor in their quest to destroy the One Ring, while Aragorn leads the forces of good against Sauron's evil army at the stone city of Minas Tirith.	2003	prime video	https://youtu.be/r5X-hFf6Bwo?si=j2t_y_QMMrdJrr5t	LordoftheRingsReturnoftheKing_2003_original_film_art_5000x.webp (2047×3000) (originalfilmart.com)	2024-09-30 01:19:27.759181	\N	2	Approved
278	The lord of the rings: The Two Towers	NaN	The continuing quest of Frodo and the Fellowship to destroy the One Ring. Frodo and Sam discover they are being followed by the mysterious Gollum. Aragorn, the Elf archer Legolas, and Gimli the Dwarf encounter the besieged Rohan kingdom, whose once great King Theoden has fallen under Saruman's deadly spell	2002	prime video	https://youtu.be/LbfMDwc4azU?si=WVpfJHeqh8wUDcmo	lord_of_the_rings_the_two_towers_2002_original_film_art_5dd21feb-10ab-41a1-84a1-4c4b082e9626_5000x.webp (1357×2000) (originalfilmart.com)	2024-09-30 01:19:27.766884	\N	2	Approved
279	The hobbit: an unexpected journey	NaN	Bilbo Baggins is swept into a quest to reclaim the lost Dwarf Kingdom of Erebor from the fearsome dragon Smaug. Approached out of the blue by the wizard Gandalf the Grey, Bilbo finds himself joining a company of thirteen dwarves led by the legendary warrior, Thorin Oakenshield. Their journey will take them into the Wild; through treacherous lands swarming with Goblins and Orcs, deadly Wargs and Giant Spiders, Shapeshifters and Sorcerers. Although their goal lies to the East and the wastelands of the Lonely Mountain first they must escape the goblin tunnels, where Bilbo meets the creature that will change his life forever ... Gollum. Here, alone with Gollum, on the shores of an underground lake, the unassuming Bilbo Baggins not only discovers depths of guile and courage that surprise even him, he also gains possession of Gollum's "precious" ring that holds unexpected and useful qualities ... A simple, gold ring that is tied to the fate of all Middle-earth in ways Bilbo cannot begin to know.	2012	prime video	https://youtu.be/SDnYMbYB-nU?si=67YeVvzNZKEKsOZG	latest (2000×3000) (nocookie.net)	2024-09-30 01:19:27.774474	\N	2	Approved
280	la la land	NaN	Aspiring actress serves lattes to movie stars in between auditions and jazz musician Sebastian scrapes by playing cocktail-party gigs in dingy bars. But as success mounts, they are faced with decisions that fray the fragile fabric of their love affair, and the dreams they worked so hard to maintain in each other threaten to rip them apart	2016	Netflix	https://youtu.be/0pdqf4P9MB8?si=qVuEeA9xFesBvS35	uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg (2000×3000) (tmdb.org)	2024-09-30 01:19:27.783549	\N	2	Approved
281	Overlord I	NaN	The final hour of the popular virtual reality game Yggdrasil has come. However, Momonga, a powerful wizard and master of the dark guild Ainz Ooal Gown, decides to spend his last few moments in the game as the servers begin to shut down. To his surprise, despite the clock having struck midnight, Momonga is still fully conscious as his character and, moreover, the non-player characters appear to have developed personalities of their own! Confronted with this abnormal situation, Momonga commands his loyal servants to help him investigate and take control of this new world, with the hopes of figuring out what has caused this development and if there may be others in the same predicament.	2015	Crunchyroll, Netflix	https://www.youtube.com/embed/3jE9moHQePI?enablejsapi=1&wmode=opaque&autoplay=1	https://cdn.myanimelist.net/images/anime/7/88019.jpg	2024-09-30 01:19:27.78772	\N	4	Approved
282	Overlord II	NaN	Ainz Ooal Gown, the undead sorcerer formerly known as Momonga, has accepted his place in this new world. Though it bears similarities to his beloved virtual reality game Yggdrasil, it still holds many mysteries which he intends to uncover, by utilizing his power as ruler of the Great Tomb of Nazarick. However, ever since the disastrous brainwashing of one of his subordinates, Ainz has become wary of the impending dangers of the Slane Theocracy, as well as the possible existence of other former Yggdrasil players. Meanwhile, Albedo, Demiurge and the rest of Ainz's loyal guardians set out to prepare for the next step in their campaign: Nazarick's first war… Overlord II picks up immediately after its prequel, continuing the story of Ainz Ooal Gown, his eclectic army of human-hating guardians, and the many hapless humans affected by the Overlord's arrival.	2018	Crunchyroll, Netflix	https://www.youtube.com/embed/p2ksX48PBQY?enablejsapi=1&wmode=opaque&autoplay=1	https://cdn.myanimelist.net/images/anime/1212/113415.jpg	2024-09-30 01:19:27.793217	\N	4	Approved
460	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 02:51:17.948424	\N	1	Unapproved
262	Frozen 1	NaN	Fearless optimist Anna teams up with rugged mountain man Kristoff and his loyal reindeer Sven and sets off on an epic journey to find her sister Elsa, whose icy powers have trapped the kingdom of Arendelle in eternal winter. Encountering Everest-like conditions, mystical trolls and a hilarious snowman named Olaf, Anna and Kristoff battle the elements in a race to save the kingdom. From the outside Elsa looks poised, regal and reserved, but in reality she lives in fear as she wrestles with a mighty secret: she was born with the power to create ice and snow. It's a beautiful ability, but also extremely dangerous. Haunted by the moment her magic nearly killed her younger sister Anna, Elsa has isolated herself, spending every waking minute trying to suppress her growing powers. Her mounting emotions trigger the magic, accidentally setting off an eternal winter that she can't stop. She fears she's becoming a monster and that no one, not even her sister, can help her	2013	Netflix	https://youtu.be/DSgMD4ofCmo	https://www.imdb.com/title/tt2294629/mediaviewer/rm3873693440/?ref_=tt_ov_i	2024-09-30 01:19:27.697176	\N	\N	Approved
249	Loki	NaN	The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after the events of “Avengers: Endgame.”	2021	Disney+	https://www.youtube.com/watch?v=nW948Va-l10	https://cinemags.org/wp-content/uploads/2021/05/loki-poster.jpg	2024-09-30 01:19:27.639147	\N	2	Approved
283	Overlord III	NaN	Following the horrific assault on the Re-Estize capital city, the Guardians of the Great Tomb of Nazarick return home to their master Ainz Ooal Gown. After months of laying the groundwork, they are finally ready to set their plans of world domination into Action. As Ainz's war machine gathers strength, the rest of the world keeps moving. The remote Carne Village, which Ainz once saved from certain doom, continues to prosper despite the many threats on its doorstep. And in the northeastern Baharuth Empire, a certain Bloody Emperor sets his sights on the rising power of Nazarick. Blood is shed, heroes fall, and nations rise. Can anyone, or anything, challenge the supreme power of Ainz Ooal Gown?	2018	Crunchyroll, Netflix	https://www.youtube.com/embed/awYU-9jVZxE?enablejsapi=1&wmode=opaque&autoplay=1	https://cdn.myanimelist.net/images/anime/1511/93473.jpg	2024-09-30 01:19:27.798902	\N	4	Approved
298	Fate/stay night [Heaven's Feel] III. spring song	Gekijouban Fate/stay night [Heaven's Feel] III. spring song	The final chapter in the Heaven's Feel trilogy. Angra Mainyu has successfully possessed his vessel Sakura Matou. It's up to Rin, Shirou, and Rider to cleanse the grail or it will be the end of the world and magecraft as we all know it.	2020	Apple TV, Microsoft Store Google Play Movies	https://youtu.be/KlJIMiZfxCY?si=0Lxh1O7xkwxIXi5d	Fate/stay night [Heaven's Feel] III. spring song (2020) (imdb.com)	2024-09-30 01:19:27.862481	\N	4	Approved
284	Overlord IV	NaN	E-Rantel, the capital city of the newly established Sorcerer Kingdom, suffers from a dire shortage of goods. Once a prosperous city known for its trade, it now faces a crisis due to its caution—or even fear—of its king, Ainz Ooal Gown. To make amends, Ainz sends Albedo to the city as a diplomatic envoy. Meanwhile, the cardinals of the Slane Theocracy discuss how to retaliate against Ainz after his attack crippled the Re-Estize Kingdom's army, plotting for the Baharuth Empire to take over the Sorcerer Kingdom. However, when Emperor Jircniv Rune Farlord El Nix arranges a meeting with the Theocracy's messengers at a colosseum, he is confronted by none other than Ainz himself. With their secret gathering now out in the open, the emperor and his guests learn that Ainz has challenged the Warrior King, the empire's greatest fighter, to a duel. With Ainz's motivations beyond his comprehension, Jircniv can do nothing but watch as humanity's future changes before his very eyes.	2022	Crunchyroll, Netflix	https://www.youtube.com/embed/tNYQjEyTO6s?enablejsapi=1&wmode=opaque&autoplay=1	https://cdn.myanimelist.net/images/anime/1530/120110.jpg	2024-09-30 01:19:27.802957	\N	4	Approved
285	Overlord: The Sacred Kingdom	Overlord Movie 3: Sei OukokuNULLhen	The Sacred Kingdom has enjoyed a great many years without war thanks to a colossal wall constructed after a historic tragedy. They understand best how fragile peace can be. When the terrible demon Jaldabaoth takes to the field at the head of a united army of monstrous tribes, the Sacred Kingdom's leaders know their defenses are not enough. With the very existence of the country at stake, the pious have no choice but to seek help wherever they can get it, even if it means breaking taboo and parlaying with the undead king of the Nation of Darkness!	2024	Crunchyroll, Netflix	https://www.youtube.com/embed/vniS5g48wHA?enablejsapi=1&wmode=opaque&autoplay=1	https://cdn.myanimelist.net/images/anime/1954/144101.jpg	2024-09-30 01:19:27.806667	\N	4	Approved
286	The SpongeBob SquarePants Movie	NaN	SpongeBob takes leave from Bikini Bottom in order to track down, with Patrick, King Neptune's stolen crown.	2004	Netflix	https://youtu.be/47ceXAEr2Oo?si=obQrt5lOPjfWtvCM	https://xl.movieposterdb.com/15_08/2004/345950/xl_345950_4a997ac0.jpg?v=2024-08-25%2022:27:45	2024-09-30 01:19:27.811075	\N	2	Approved
287	The SpongeBob Movie: Sponge Out of Water	NaN	When a diabolical pirate above the sea steals the secret Krabby Patty formula, SpongeBob and his friends team up in order to get it back.	2015	Netflix	https://youtu.be/4zoI4L4x1i0?si=yeutQVxsxUtJr_ua	https://xl.movieposterdb.com/14_08/2014/2279373/xl_2279373_fd7068e6.jpg?v=2023-08-25%2020:53:52	2024-09-30 01:19:27.816627	\N	2	Approved
288	The SpongeBob Movie: Sponge on the Run	NaN	After SpongeBob's beloved pet snail Gary is snail-napped, he and Patrick embark on an epic adventure to the Lost City of Atlantic City to bring Gary home.	2021	Netflix	https://youtu.be/a2cowVH03Xo?si=SqYPcZQc8Tp9DSQO	https://xl.movieposterdb.com/21_05/2020/4823776/xl_4823776_ee929659.jpg?v=2024-07-22%2015:50:22	2024-09-30 01:19:27.82345	\N	2	Approved
449	Bebek berenang	-	ini synopsis bagus sekali	2024	Amazon Prime Video, Apple TV, Netflix	https://youtu.be/OsIohljR4WY?si=e8GkLG4hROfc5YOP	https://res.cloudinary.com/dtk2yqead/image/upload/v1731297456/ceaxpebdzofcgeve4jtd.jpg	2024-11-11 10:57:36.022302	\N	10	Approved
461	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 02:54:17.78177	\N	1	Unapproved
289	Saving Bikini Bottom: The Sandy Cheeks Movie	NaN	When Bikini Bottom is suddenly scooped out of the ocean, Sandy Cheeks and SpongeBob journey to Sandy's home state of Texas, where they meet Sandy's family and must save Bikini Bottom from the hands of an evil CEO.	2024	Netflix	https://youtu.be/Ud6-SGnzH3k?si=c9j26OgFgRx0W_kA	https://xl.movieposterdb.com/23_03/0/23063732/xl_saving-bikini-bottom-the-sandy-cheeks-movie-movie-poster_da43a426.jpg	2024-09-30 01:19:27.830521	\N	2	Approved
290	Mr. Bean's Holiday	NaN	Mr. Bean wins a trip to Cannes where he unwittingly separates a young boy from his father and must help the two reunite. On the way he discovers France, bicycling, and true love.	2007	Netflix	https://youtu.be/LZfIzJ6XwPQ?si=EKjeOXWGZpuPc54G	https://xl.movieposterdb.com/07_08/2007/453451/xl_453451_781d47f2.jpg?v=2024-07-23%2015:02:08	2024-09-30 01:19:27.837757	\N	2	Approved
291	Black Panther	NaN	T'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people into a new future and must confront a challenger from his country's past.	2018	Netflix	https://youtu.be/xjDjIWPwcPU?si=jOYpfoPjbr--vOM6	https://www.imdb.com/title/tt1825683/mediaviewer/rm172972800/?ref_=ext_shr_lnk	2024-09-30 01:19:27.840477	\N	2	Approved
292	Thor the dark world	NaN	When the Dark Elves attempt to plunge the universe into darkness, Thor must embark on a perilous and personal journey that will reunite him with doctor Jane Foster.	2013	Netflix	https://youtu.be/npvJ9FTgZbM?si=KSBIYQsinBQhFeI9	https://www.imdb.com/title/tt1981115/mediaviewer/rm1847122688/?ref_=ext_shr_lnk	2024-09-30 01:19:27.843103	\N	2	Approved
293	Ant-Man	NaN	Armed with a super-suit with the astonishing ability to shrink in scale but increase in strength, cat burglar Scott Lang must embrace his inner hero and help his mentor, Dr. Hank Pym, pull off a plan that will save the world.	2015	Netflix	https://youtu.be/pWdKf3MneyI?si=G8ESHBzqLeSnefN3	https://www.imdb.com/title/tt0478970/mediaviewer/rm124909312/?ref_=ext_shr_lnk	2024-09-30 01:19:27.847164	\N	2	Approved
294	Capten Marvel	NaN	Carol Danvers becomes one of the universe's most powerful heroes when Earth is caught in the middle of a galactic war between two alien races.	2019	Netflix	https://youtu.be/Z1BCujX3pw8?si=7BDO34-ax1A_MhJl	https://www.imdb.com/title/tt4154664/mediaviewer/rm123368960/?ref_=ext_shr_lnk	2024-09-30 01:19:27.850871	\N	2	Approved
295	Sheriff	NaN	Sheriff and Nazri, police officers from different departments, team up to take down Tony, a ruthless drug kingpin running a methamphetamine syndicate responsible for numerous deaths, known as the Meth Killer.	2024	Netflix	https://youtu.be/gG3UbB_e_UY?si=rkI_-X_dQcQcV9JZ	https://www.imdb.com/title/tt28547912/mediaviewer/rm1709262081/?ref_=ext_shr_lnk	2024-09-30 01:19:27.853452	\N	6	Approved
296	Fate/stay night [Heaven's Feel] I. presage flower	Gekijouban Fate/stay night [Heaven's Feel] I. presage flower	Shirou Emiya is a young mage who attends Homurahara Academy in Fuyuki City. One day after cleaning the Archery Dojo in his school, he catches a glimpse of a fight between superhuman beings, and he gets involved in the Holy Grail War, a ritual where mages called Masters fight each other with their Servants in order to win the Holy Grail. Shirou joins the battle to stop an evildoer from winning the Grail and to save innocent people, but everything goes wrong when a mysterious "Shadow" begins to indiscriminately kill people in Fuyuki.	2017	Crunchyroll, Apple TV, Microsoft Store	https://youtu.be/AMr5pXzpvP0?si=Wrqrp_iXyxIG4dw5	Fate/stay night [Heaven's Feel] I. presage flower (2017) (imdb.com)	2024-09-30 01:19:27.857325	\N	4	Approved
297	Fate/stay night [Heaven's Feel] II. lost butterfly	Gekijouban Fate/stay night [Heaven's Feel] II. lost butterfly	The story focuses on the Holy Grail War and explores the relationship between Shirou Emiya and Sakura Matou, two teenagers participating in this conflict. The story continues immediately from Fate/stay night: Heaven's Feel I. presage flower, following Shirou as he continues to participate in the Holy Grail War even after being eliminated as a master.	2019	Apple TV, Microsoft Store	https://youtu.be/nfzKXkL_i54?si=zm6E1OQ54bidiUnf	Fate/stay night [Heaven's Feel] II. lost butterfly (2019) (imdb.com)	2024-09-30 01:19:27.85934	\N	4	Approved
300	Dragon Nest: Warrior's Dawn	Long Zhi Gu: Po Xiao Qi Bing	Lambert joins the Dragon Slayers' League to save Altera from the Black Dragon.	2014	Apple TV, Microsoft Store, Google Play Movies	https://youtu.be/0ak7gLnPZfw?si=ZbnsWQCARu5FjAqm	https://www.imdb.com/title/tt0433035/mediaviewer/rm1078443008/?ref_=tt_ov_i	2024-09-30 01:19:27.86939	\N	7	Approved
302	memento	NaN	Leonard Shelby, an insurance investigator, suffers from anterograde amnesia and uses notes and tattoos to hunt for the man he thinks killed his wife, which is the last thing he remembers.	2000	Peacock Premium Plus	https://www.youtube.com/watch?v=Rq9eM4ZXRgs	https://cdn.shopify.com/s/files/1/0057/3728/3618/products/c15059527ae4d9c832dbb365b418369e_7c2bb4af-8bcd-428c-8904-27ddc512a45c_500x749.jpg?v=1573594896	2024-09-30 01:19:27.876756	\N	2	Approved
303	the forest gump	NaN	The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.	1994	Netflix	https://www.youtube.com/watch?v=bLvqoHBptjg&t=105s	https://cdn.shopify.com/s/files/1/0057/3728/3618/products/forrest-gump---24x36_500x749.jpg?v=1645558337	2024-09-30 01:19:27.877646	\N	2	Approved
304	pulp fiction	NaN	Jules Winnfield (Samuel L. Jackson) and Vincent Vega (John Travolta) are two hit men who are out to retrieve a suitcase stolen from their employer, mob boss Marsellus Wallace (Ving Rhames). Wallace has also asked Vincent to take his wife Mia (Uma Thurman) out a few days later when Wallace himself will be out of town. Butch Coolidge (Bruce Willis) is an aging boxer who is paid by Wallace to lose his fight. The lives of these seemingly unrelated people are woven together comprising of a series of funny, bizarre and uncalled-for incidents. ??Soumitra	1994	Netflix	https://www.youtube.com/watch?v=tGpTpVyI_OQ&pp=ygUMcHVscCBmaWN0aW9u	https://cdn.shopify.com/s/files/1/0057/3728/3618/products/ab401c136cca10812cda5ac64c3f7c2e_bb5e62f7-b34f-4547-b5c7-495cc2dd1bd9_500x749.jpg?v=1573591339	2024-09-30 01:19:27.879513	\N	2	Approved
305	the prestige	NaN	The Prestige (2006) In the end of the nineteenth century, in London, Robert Angier, his beloved wife Julia McCullough, and Alfred Borden are friends and assistants of a magician. When Julia accidentally dies during a performance, Robert blames Alfred for her death, and they become enemies. Both become famous and rival magicians, sabotaging the performance of the other on the stage. When Alfred performs a successful trick, Robert becomes obsessed trying to disclose the secret of his competitor with tragic consequences. ??Claudio Carvalho, Rio de Janeiro, Brazil	2006	Netflix	https://www.youtube.com/watch?v=RLtaA9fFNXU&pp=ygUMdGhlIHByZXN0aWdl	https://www.movieposters.com/cdn/shop/files/prestige.mp.140332_480x.progressive.jpg?v=1709237534	2024-09-30 01:19:27.882743	\N	2	Approved
450	coba hapus genrenya	acu	halo	1985	Amazon Prime Video, Google Play Movies	https://youtu.be/OsIohljR4WY?si=e8GkLG4hROfc5YOP	https://res.cloudinary.com/dtk2yqead/image/upload/v1731300772/fnnuqvuezsw0wuejceob.png	2024-11-11 11:52:53.081632	\N	21	Unapproved
462	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 02:55:44.064286	\N	1	Unapproved
306	Kung Fu Panda	NaN	It's the story about a lazy, irreverent slacker panda, named Po, who is the biggest fan of Kung Fu around...which doesn't exactly come in handy while working every day in his family's noodle shop. Unexpectedly chosen to fulfill an ancient prophecy, Po's dreams become reality when he joins the world of Kung Fu and studies alongside his idols, the legendary Furious Five -- Tigress, Crane, Mantis, Viper and Monkey -- under the leadership of their guru, Master Shifu. But before they know it, the vengeful and treacherous snow leopard Tai Lung is headed their way, and it's up to Po to defend everyone from the oncoming threat. Can he turn his dreams of becoming a Kung Fu master into reality? Po puts his heart - and his girth - into the task, and the unlikely hero ultimately finds that his greatest weaknesses turn out to be his greatest strengths.	2008	Netflix	https://youtu.be/NRc-ze7Wrxw?si=c8c0goe0IM5bOTFE	https://www.imdb.com/title/tt0441773/mediaviewer/rm3096332288/?ref_=tt_ov_i	2024-09-30 01:19:27.884654	\N	2	Approved
307	Kung Fu Panda 2	NaN	After a year of being the dragon warrior, obesitized but fearless Po (Black) is a hero in China along with Crane (Cross), Mantis (Rogen), Monkey (Chan), Viper (Liu), Tigress (Jolie), and Shifu (Hoffman). But trouble pops out when villian Shen (Oldman) begins chaos. Everybody is ready to fight, but Po is unprepared when he learns Shen was his enemy in his infancy.	2011	Netflix	https://youtu.be/FQ63rqSRrEI?si=4aQIoS-g04Kd8n8u	https://www.imdb.com/title/tt1302011/mediaviewer/rm848057600/?ref_=tt_ov_i	2024-09-30 01:19:27.888388	\N	2	Approved
308	Kung Fu Panda 3	NaN	When Po's long-lost panda father suddenly reappears, the reunited duo travels to a secret panda paradise to meet scores of hilarious new panda characters. But when the supernatural villain Kai begins to sweep across China defeating all the kung fu masters, Po must do the impossible-learn to train a village full of his fun-loving, clumsy brethren to become the ultimate band of Kung Fu Pandas.	2016	Netflix	https://youtu.be/10r9ozshGVE?si=yfOLpuayyWskwlLi	https://www.imdb.com/title/tt2267968/mediaviewer/rm375908608/?ref_=tt_ov_i	2024-09-30 01:19:27.891532	\N	2	Approved
309	Kung Fu Panda 4	NaN	Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior. As such, he will train a new kung fu practitioner for the spot and will encounter a villain called the Chameleon who conjures villains from the past.	2024	Netflix	https://youtu.be/_inKs4eeHiI?si=fT22o2PANv8qVsy_	https://www.imdb.com/title/tt21692408/mediaviewer/rm3773712385/?ref_=tt_ov_i	2024-09-30 01:19:27.894487	\N	2	Approved
310	Kung Fu Hustle	NaN	Set in Canton, China in the 1940s, the story revolves in a town ruled by the Axe Gang, Sing who desperately wants to become a member. He stumbles into a slum ruled by eccentric landlords who turns out to be the greatest kung-fu masters in disguise. Sing's Actions eventually cause the Axe Gang and the slumlords to engage in an explosive kung-fu battle. Only one side will win and only one hero will emerge as the greatest kung-fu master of all.	2004	Netflix	https://youtu.be/FtE9-o6dBEI?si=1bE5qcnpSSCvwyjB	https://www.imdb.com/title/tt0373074/mediaviewer/rm2422949889/?ref_=tt_ov_i	2024-09-30 01:19:27.899955	\N	7	Approved
311	Spirited Away	Sen to Chihiro no kamikakushi	The fanciful adventures of a ten-year-old girl named Chihiro, who discovers a secret world when she and her family get lost and venture through a hillside tunnel. When her parents undergo a mysterious transformation, Chihiro must fend for herself as she encounters strange spirits, assorted creatures and a grumpy sorceress who seeks to prevent her from returning to the human world	2001	Netflix	https://youtu.be/ByXuk9QqQkk?feature=shared	Spirited Away (2001)	2024-09-30 01:19:27.902308	\N	4	Approved
312	Princess Mononoke	MononokeNULLhime	While protecting his village from rampaging boar-god/demon, a confident young warrior, Ashitaka, is stricken by a deadly curse. To save his life, he must journey to the forests of the west. Once there, he's embroiled in a fierce campaign that humans were waging on the forest. The ambitious Lady Eboshi and her loyal clan use their guns against the gods of the forest and a brave young woman, Princess Mononoke, who was raised by a wolf-god. Ashitaka sees the good in both sides and tries to stem the flood of blood. This is met by animosity by both sides as they each see him as supporting the enemy.	1997	Netflix	https://youtu.be/4OiMOHRDs14?feature=shared	https://www.imdb.com/title/tt0119698/mediaviewer/rm1586705153/?ref_=ext_shr_lnk	2024-09-30 01:19:27.904036	\N	4	Approved
327	Kal Ho Naa Ho	NaN	Naina's neighbor, Aman, introduces her to optimism, and makes her fall in love. But tragedy stopped him from moving forward. In fact, he encouraged his friend Rohit to seduce her.	2003	Netflix, Amazon Prime, Apple TV	https://www.youtube.com/watch?v=tVMAQAsjsOU	https://posters.movieposterdb.com/12_05/2003/347304/s_347304_e7f7919b.jpg	2024-09-30 01:19:27.951528	\N	8	Approved
313	My Neighbor Totoro	Tonari no Totoro	Excited about reuniting with their ailing mother, close-knit sisters Satsuki and Mei embark on an exciting adventure when they move with their loving professor father to a new house in the verdant countryside of 1950s summer Japan. Now, nothing can stop them. And with mum in the hospital, the girls have all the time in the world to explore nature and the dense adjacent forest, the home of bashful mystical creatures only children can see. Under the clear blue sky's cloudless bliss and the bright yellow sun's promise of a luminous future, nothing can blemish the young sisters' flawless fantasy--not even life's trying times. After all, mother is getting better. Then, one radiant morning, as the shimmering green leaves of the towering camphor trees swayed in the soft morning breeze, the wide-eyed siblings stumbled upon a Totoro. But who is the enchanting visitor? Will the rotund neighbour, with his fluffy fur and mysterious eyes, be the girls' forever friend?	1988	Netflix	https://youtu.be/92a7Hj0ijLs?feature=shared	https://www.imdb.com/title/tt0096283/mediaviewer/rm3112135425/?ref_=ext_shr_lnk	2024-09-30 01:19:27.906593	\N	4	Approved
314	The Boy and The Heron	Kimitachi wa dou ikiru ka	After losing his mother during the war, young Mahito moves to his family's estate in the countryside. There, a series of mysterious events lead him to a secluded and ancient tower, home to a mischievous gray heron. When Mahito's new stepmother disappears, he follows the gray heron into the tower, and enters a fantastic world shared by the living and the dead. As he embarks on an epic journey with the heron as his guide, Mahito must uncover the secrets of this world, and the truth about himself. Featuring the voices of Christian Bale, Dave Bautista, Gemma Chan, Willem Dafoe, Karen Fukuhara, Mark Hamill, Robert Pattinson and Florence Pugh.	2023	Apple tv	https://youtu.be/t5khm-VjEu4?feature=shared	https://www.imdb.com/title/tt6587046/mediaviewer/rm1725845761/?ref_=ext_shr_lnk	2024-09-30 01:19:27.909173	\N	4	Approved
463	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 02:56:43.13121	\N	1	Unapproved
315	Howl's Moving Castle	Hauru no ugoku shiro	With her country's peace constantly under threat, Sophie, a lively but unloved milliner, catches the attention of an unexpected defender. But as the wide-eyed damsel in distress crosses paths with handsome Howl, a talented young magician with excess emotional baggage, a fit of jealousy turns the hat maker's world upside down forever. Now, stained by the indelible mark of the wicked Witch of the Waste, Sophie must move mountains to break the pitiless spell, including facing her fears and the mysterious sorcerer. However, has anyone ever set foot in Howl's impenetrable home, a walking wonder powered by a fiery heart, and lived to tell the tale?	2004	Netflix	https://youtu.be/iwROgK94zcM?feature=shared	https://www.imdb.com/title/tt0347149/mediaviewer/rm1534369024/?ref_=ext_shr_lnk	2024-09-30 01:19:27.91127	\N	4	Approved
316	Prey	NaN	Naru, a skilled warrior of the Comanche Nation, fights to protect her tribe against one of the first highly-evolved Predators to land on Earth.	2022	Netflix	https://www.youtube.com/watch?v=wZ7LytagKlc	https://www.imdb.com/title/tt11866324/mediaviewer/rm4094888705/?ref_=ext_shr_lnk 	2024-09-30 01:19:27.918604	\N	2	Approved
317	The Predator	NaN	When a young boy accidentally triggers the universe's most lethal hunters' return to Earth, only a ragtag crew of ex-soldiers and a disgruntled scientist can prevent the end of the human race.	2018	Netflix	https://www.youtube.com/watch?v=WaG1KZqrLvM	https://www.imdb.com/title/tt3829266/mediaviewer/rm3117827584/?ref_=ext_shr_lnk	2024-09-30 01:19:27.921596	\N	2	Approved
318	Alien: Romulus	NaN	While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.	2024	Netflix	https://youtu.be/OzY2r2JXsDM?si=MbgSoX-pENIohGad	https://www.imdb.com/title/tt18412256/mediaviewer/rm3993072385/?ref_=ext_shr_lnk	2024-09-30 01:19:27.924801	\N	2	Approved
319	Alien vs Predator: Requiem	NaN	Warring Alien and Predator races descend on a rural Colorado town, where unsuspecting residents must band together for any chance of survival.	2007	Netflix	https://www.youtube.com/watch?v=oqLM_21tqyc	https://www.imdb.com/title/tt0758730/mediaviewer/rm3172046848/?ref_=ext_shr_lnk	2024-09-30 01:19:27.927343	\N	2	Approved
320	Alien vs Predator	NaN	During an archaeological expedition on Bouvetøya Island in Antarctica, a team of archaeologists and other scientists find themselves caught up in a battle between the two legends. Soon, the team realize that only one species can win.	2004	Netflix	https://www.youtube.com/watch?v=fQE62sQBkqA	https://www.imdb.com/title/tt0370263/mediaviewer/rm3021379584/?ref_=ext_shr_lnk	2024-09-30 01:19:27.930878	\N	2	Approved
321	Kingsman: The Secret Service	NaN	The story of a super-secret spy organization that recruits an unrefined but promising street kid into the agency’s ultra-competitive training program just as a global threat emerges from a twisted tech genius.	2014	Netflix, Amazon US	https://www.youtube.com/watch?v=m4NCribDx4U&pp=ygUba2luZ3NtYW4gdGhlIHNlY3JldCBzZXJ2aWNl	https://a.ltrbxd.com/resized/film-poster/1/4/8/2/0/0/148200-kingsman-the-secret-service-0-1000-0-1500-crop.jpg?v=cd49b739cf	2024-09-30 01:19:27.933455	\N	5	Approved
322	Kingsman: The Golden Circle	NaN	When an attack on the Kingsman headquarters takes place and a new villain rises, Eggsy and Merlin are forced to work together with the American agency known as the Statesman to save the world.	2017	Netflix, Amazon US	https://www.youtube.com/watch?v=6Nxc-3WpMbg&pp=ygUaa2luZ3NtYW4gdGhlIGdvbGRlbiBjaXJjbGU%3D	https://a.ltrbxd.com/resized/sm/upload/3h/o6/gc/iy/yOGf8Or1k78Y6OLdYmTTSGHW1dP-0-1000-0-1500-crop.jpg?v=9a2da8212b	2024-09-30 01:19:27.936618	\N	5	Approved
323	Behind Her Eyes	NaN	It follows Louise, a single mum with a son and a part-time job in a psychiatrist's office. She begins an affair with her boss and strikes up an unlikely friendship with his wife.	2021	Netflix	https://www.youtube.com/watch?v=c4LtoWQaLxk&pp=ygUXYmVoaW5kIGhlciBleWVzIHRyYWlsZXI%3D	https://posters.movieposterdb.com/22_06/2021/9698442/l_9698442_818a3641.jpg	2024-09-30 01:19:27.939551	\N	5	Approved
324	Baby Driver	NaN	After being coerced into working for a crime boss, a young getaway driver finds himself taking part in a heist doomed to fail.	2017	Apple TV, Amazon	https://www.youtube.com/watch?v=zTvJJnoWIPk	https://a.ltrbxd.com/resized/film-poster/2/6/8/9/5/0/268950-baby-driver-0-1000-0-1500-crop.jpg?v=61304ddfc8	2024-09-30 01:19:27.941375	\N	5	Approved
325	Back to the Future	NaN	Eighties teenager Marty McFly is accidentally sent back in time to 1955, inadvertently disrupting his parents’ first meeting and attracting his mother’s romantic interest. Marty must repair the damage to history by rekindling his parents’ romance and - with the help of his eccentric inventor friend Doc Brown - return to 1985.	1985	Amazon Prime	https://www.youtube.com/watch?v=qb7Fd0l_BRo	https://a.ltrbxd.com/resized/film-poster/5/1/9/4/5/51945-back-to-the-future-0-1000-0-1500-crop.jpg?v=6662417358	2024-09-30 01:19:27.943508	\N	2	Approved
326	Ae Dil Hai Mushkil	NaN	Ayan goes on a quest for true love when Alizeh does not reciprocate his feelings. On his journey, he meets different people who make him realize the power of unrequited love.	2016	Netflix, Amazon Prime, Apple TV	https://www.youtube.com/watch?v=Z_PODraXg4E	https://posters.movieposterdb.com/21_11/2016/4559006/l_4559006_2672b3c1.jpg	2024-09-30 01:19:27.946567	\N	8	Approved
328	Kabhi Khushi Kabhie Gham	NaN	Rahul is sad because his father disapproves of his relationship with the poor Anjali, but still marries her and moves to London. 10 years later, Rahul's younger brother wants to reconcile his father and brother.	2001	Netflix, Amazon Prime, Apple TV	https://www.youtube.com/watch?v=7uY1JbWZKPA	https://posters.movieposterdb.com/10_08/2001/248126/s_248126_0a404d08.jpg	2024-09-30 01:19:27.953477	\N	8	Approved
329	Jab Tak Hai Jaan	NaN	Samar Anand is forced to leave his girlfriend, Khushi (Katrina Kaif). From London, he returns to Kashmir leaving his past behind, and meets Akira, a cheerful woman who works for a television program about wildlife. Will Samar still hope for Khushi or choose to start a new life with Akira?	2012	Amazon Prime, Apple TV	https://www.youtube.com/watch?v=v0UXgoJ9Shg	https://posters.movieposterdb.com/12_09/2012/2176013/s_2176013_f513dba4.jpg	2024-09-30 01:19:27.955588	\N	8	Approved
330	Bajrangi Bhaijaan	NaN	Pavan, a devotee of Hanuman, faces various challenges when he tries to reunite Munni with her family after Munni goes missing while traveling back home with her mother.	2015	Disney +, Bstation	https://www.youtube.com/watch?v=4nwAra0mz_Q	https://posters.movieposterdb.com/15_09/2015/3863552/s_3863552_b160f1f4.jpg	2024-09-30 01:19:27.957339	\N	8	Approved
331	Transformers: Revenge of the Fallen	NaN	A youth chooses manhood. The week Sam Witwicky starts college, the Decepticons make trouble in Shanghai. A presidential envoy believes it's because the Autobots are around; he wants them gone. He's wrong: the Decepticons need access to Sam's mind to see some glyphs imprinted there that will lead them to a fragile object that, when inserted in an alien machine hidden in Egypt for centuries, will give them the power to blow out the sun. Sam, his girlfriend Mikaela Banes, and Sam's parents are in danger. Optimus Prime and Bumblebee are Sam's principal protectors. If one of them goes down, what becomes of Sam?	2009	Netflix	https://youtu.be/fnXzKwUgDhg?si=OQS8kGFiwTr7QiNx	https://m.media-amazon.com/images/M/MV5BNjk4OTczOTk0NF5BMl5BanBnXkFtZTcwNjQ0NzMzMw@@._V1_.jpg	2024-09-30 01:19:27.959061	\N	2	Approved
332	Transformers: Dark of the Moon	NaN	Autobots Bumblebee, Ratchet, Ironhide, Mirage (aka Dino), Wheeljack (aka Que) and Sideswipe led by Optimus Prime, are back in Action taking on the evil Decepticons, who are eager to avenge their recent defeat. The Autobots and Decepticons become involved in a perilous space race between the United States and Russia to reach a hidden Cybertronian spacecraft on the moon and learn its secrets, and once again Sam Witwicky has to go to the aid of his robot friends. The new villain Shockwave is on the scene while the Autobots and Decepticons continue to battle it out on Earth.	2011	Netflix	https://youtu.be/97wCoDn0RrA?si=e5YzLTIFpIwrYnYe	https://m.media-amazon.com/images/M/MV5BMTkwOTY0MTc1NV5BMl5BanBnXkFtZTcwMDQwNjA2NQ@@._V1_FMjpg_UY478_.jpg	2024-09-30 01:19:27.962876	\N	2	Approved
333	Transformers: Age of Extinction	NaN	After the battle between the Autobots and Decepticons that leveled Chicago, humanity thinks that all alien robots are a threat. So Harold Attinger, a CIA agent, establishes a unit whose sole purpose is to hunt down all of them. But it turns out that they are aided by another alien robot who is searching for Optimus Prime. Cade Yeager, a "robotics expert", buys an old truck and upon examining it, he thinks it's a Transformer. When he powers it up, he discovers it's Optimus Prime. Later, men from the unit show up looking for Optimus. He helps Yeager and his daughter Tessa escape but are pursued by the hunter. They escape and Yeager learns from technology he took from the men that a technology magnate and defense contractor named Joshua Joyce is part of what's going on, so they go to find out what's going on.	2014	Netflix	https://youtu.be/T9bQCAWahLk?si=8FrmWIM7-aw4mbPX	https://m.media-amazon.com/images/M/MV5BMjEwNTg1MTA5Nl5BMl5BanBnXkFtZTgwOTg2OTM4MTE@._V1_FMjpg_UY749_.jpg	2024-09-30 01:19:27.967255	\N	2	Approved
334	Transformers: The Last Knight	NaN	Having left Earth, Optimus Prime finds his dead home planet, Cybertron, and discovers that he was in fact responsible for its destruction. Optimus learns that he can bring Cybertron back to life, but in order to do so, he will need an artifact that is hidden on Earth.	2017	Netflix	https://youtu.be/6Vtf0MszgP8?si=jChC9qfWPfCUXZIv	https://m.media-amazon.com/images/M/MV5BYWNlNjU3ZTItYTY3Mi00YTU1LTk4NjQtYjQ3MjFiNjcyODliXkEyXkFqcGc@._V1_.jpg	2024-09-30 01:19:27.969959	\N	2	Approved
335	Transformers: Rise of the Beasts	NaN	Returning to the Action and spectacle that has captivated moviegoers around the world, Transformers: Rise of the Beasts will take audiences on a global '90s adventure with the Autobots and introduce a new fAction of Transformers - the Maximals - to join them as allies in the war. the ongoing battle on earth. Directed by Steven Caple Jr. and starring Anthony Ramos and Dominique Fishback	2023	Netflix	https://youtu.be/itnqEauWQZM?si=7JF9i9hFZ3PDlpPw	https://m.media-amazon.com/images/M/MV5BZTVkZWY5MmItYjY3OS00OWY3LTg2NWEtOWE1NmQ4NGMwZGNlXkEyXkFqcGc@._V1_FMjpg_UY711_.jpg	2024-09-30 01:19:27.974641	\N	2	Approved
336	Spider-Man : Homecoming	NaN	Peter Parker tries to stop Adrian 'The Vulture' Toomes from selling weapons made with advanced Chitauri technology while trying to balance his life as an ordinary high school student.	2017	Netflix	https://youtu.be/rk-dF1lIbIg?si=AyYI2nZrJdrBQDIm	https://www.imdb.com/title/tt2250912/mediaviewer/rm3554683648/?ref_=ext_shr_lnk	2024-09-30 01:19:27.977185	\N	2	Approved
337	Spider-Man : Far From Home	NaN	Peter Parker, the beloved superhero Spider-Man, faces four destructive elemental monsters while on holiday in Europe. Soon, he receives help from Mysterio, a fellow hero with mysterious origins.	2019	Netflix	https://youtu.be/Nt9L1jCKGnE?si=UPt6mE-cSS95j5rG	https://www.imdb.com/title/tt6320628/mediaviewer/rm2921502465/?ref_=tt_ov_i	2024-09-30 01:19:27.985991	\N	2	Approved
338	Finding Nemo	NaN	After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.	2003	Disney +	https://youtu.be/9oQ628Seb9w?si=aUyIDJTghK1HCNIX	https://www.imdb.com/title/tt0266543/mediaviewer/rm1261017088/?ref_=ext_shr_lnk	2024-09-30 01:19:27.990144	\N	2	Approved
339	Finding Dory	NaN	Friendly but forgetful blue tang Dory begins a search for her long-lost parents and everyone learns a few things about the real meaning of family along the way.	2016	Disney +	https://youtu.be/JhvrQeY3doI?si=Ee2QRlj9G8v45RFc	https://www.imdb.com/title/tt2277860/mediaviewer/rm2983925248/?ref_=ext_shr_lnk	2024-09-30 01:19:27.993294	\N	2	Approved
340	Danur: I Can See Ghosts	NaN	As a young girl, Risa has the ability to see ghosts. Due to her parents busy with work, Risa befriends 3 ghosts in her estate. However things turned south when a malevolent spirit decided to take her younger sister. Risa will soon find out what secret lies in her house.	2017	NaN	https://youtu.be/YLU6Qfi0cDY?si=FEASPlafSDOjNHmU	https://www.imdb.com/title/tt6496236/mediaviewer/rm3741201152/?ref_=ext_shr_lnk	2024-09-30 01:19:28.001086	\N	3	Approved
341	Danur 2: Maddah	NaN	As Risa's ability to see ghosts continues to disrupt her life, her uncle's peculiar behavior leads her to discover a haunting mystery at his new house.	2018	NaN	https://youtu.be/bMQrdGnYX9E?si=eCIb9kCY3w2CSYS1	https://www.imdb.com/title/tt7981182/mediaviewer/rm540562944/?ref_=ext_shr_lnk	2024-09-30 01:19:28.005098	\N	3	Approved
342	Danur 3: Sunyaruri	NaN	After years of being friendly with her little ghosts, Risa begins to feel that she must have a normal life like other women. Especially now Risa has a boyfriend named Dimas, a radio announcer. Risa does not tell Dimas about her ability to see ghosts, and that she has five little friends who were not human.	2019	NaN	https://youtu.be/9EsGdyVx6HM?si=F3HEHrrmiGuaJZCY	https://www.imdb.com/title/tt10698468/mediaviewer/rm459846145/?ref_=ext_shr_lnk	2024-09-30 01:19:28.006794	\N	3	Approved
343	Sri Asih	NaN	Alana does not understand why she is always overcome by anger. But she always tried to fight it. She was born during a volcanic eruption that separated her and her parents. She is adopted by a rich woman who tries to help her live a normal life. But as an adult, Alana discovers the truth about her origins. She's not an ordinary human	2022	NaN	https://youtu.be/564eG_1Mvf0?si=WWubqaJ4s8dKvsJk	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUWGBgaGBcYFRoYGBgXGBoYGxcYFx0aHSggHxolGx8YITEhJSkrLi4uHR8zODMsNygtLisBCgoKDg0OGxAQGzUlHyUtLTUtNy8tLTUvKy0tLS8vLy0vMC0tLS0tLS0vLS0tLS0tLS0vLS0tLS0tLS0tLS0tLf/AABEIARMAtwMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgMEAAIHAf/EAEUQAAIBAgQDBgMECAQEBgMAAAECEQADBBIhMQVBUQYTImFxgTKRoSOxwfAHFDNCUmJy0SSC4fFzkrKzFTRDg6LCRFNj/8QAGgEAAgMBAQAAAAAAAAAAAAAAAwQBAgUGAP/EADERAAICAQMCBQMEAgIDAQAAAAECABEDEiExBEETIjJRYXGB8AWRobHB0SMzJELxFP/aAAwDAQACEQMRAD8AQAqoA7N6D6j8+tUOK8RDucu0QOXXUxVO5O06TPvUYt0FVF2ZvZc7kaVFCeKT1qUiK2t2vzNbOkn7qtq3imggSEVZw9lmnKC0bgan1ite6ovwe1H2jljbQwEBP2jxK21j2JPIeomrtQlAhkuE4ayLmuq8E6IASzEc/wCVdSJO+sAxRTh2JUkKmGQa65tfmSJqTAcIvYpy7IubTkREDRRlfwx0Owpo4XwUpDsUcDUAbSPOT6UhmzADfmMoskbh6W0DsiSRtlGgI/3pQ49jMrmJ+semv4U8Xr58d14hBpz8R2j0/CuXcYxhuOT50v0ql2sw+QhEki9ori+Gcyn4lOqn+x6Ea1cwVxbpUL41zDwN8aSRJB5jzHuKT3bU0X7LB2xNvICxU5gBucgzAe8Ae9aj4gFsTKDlmj1217NFx+tJqCFDxurAAKx8iuXXr61zbGYcqa7HgcfmZgCCRAYQCGEZWznbWOo225lP7b8BVfHamDuvND09Oh2PkdKX6bMQQjQ2fEfVOdXWNRZjUt4QYiKhNaomeZ7mPWszHzrxROwmjvCeDFhmYe1Vdwosy2PGzmhBmFVidAW8h+NMVrs9cZCwVhCzBnXypn4TwxViFA9qcMFh5WCJrPy9Wb2E08fRKB5jOB4m3lPlyqGaY+33DxYxjoNjDr6PqfrNLlP421KDM510sRPQaysFeVeVhN7jTy+VeK5oxe4VIJBiCZ9aGi1qaUDKeJuZMDod5aw+Jy2mTKPGfi3OkbVoqsRAJKzMToD1jrXqroB6mrFrDnQL8X19qHYEiiRvwJrhcGbjRMcyx2VRux8h+daZOH4A3RPitYa0sZo8bidgBzY8hoSY5DKNt3Mg7sbmMx5EjUKvkDueZ9BLbh1ZLdu2FLOxBKryMR4jB1Bkf5RzFCyOZXQORLPCLxYFLSi1aQCQIM9AzGZJ/igc4o0GbJMAyNCRy9IjoAB051Sso0raIUKu4EeJ5BJ5QoiAT0nnFbcWxV24CBmt2wIkfER6kCPlWdkIJ2l0U3FztNxIJbyFhJJPoNh6CPvpAxVw/nzoxxO8mc6E67kyfn1oHjiTPTlWn02MKIp1WS+JTam3sFbVe+vPqEFvQTJAY3SBH/DUehIpRmm3sRxS1ZZ1vfsrq5G0mJ0DjzWZ+dM5r0GonhrXvDrA21uKtwC2uZsyt4XLschJ3gIF089aE2OKk2XDMHWCAx+IEsuig6kbmNtOU1a7Q3Myi0sMRGx0cLIBWDqNjFBMLaDqwMhgQBIgKIOg95pRFFWZpOb8olHjWHlASgyz4bq+mqt9+U6jlppQfDYQsdaPfrj2WKrBVxDodVYeY8uu4qfD4ZPiQR/LzHp1FNjIVWIjBqea4HAKNhRiyAvOKn4JhBcYLVLtRZv4W7Kgshj2NLXrbTHiBjWxHDgOKtOyoHUseVOVnCwK5TZ459l3WJsOjkLkdFEqWnIQwY75W0I5GnLsDx+7fRrV7W5b/ejdeU+dByYqFzwy6uJzr9LTg48AbpZtg+pLt9zCkumP9IF8PxHFEagXMv8AyKqH6g0ukVp4hSAfEzsm7EzwVlerWUSDqOzXCRB8zG1C71ohj+NE2uGJJMrt5ak6e+tQXbjvNxiSCYLcpjY8tqywxnV9RuJDbuAhQyjwzsANyTrpJ9z5VPdvZtFgACNBE6843PrUIt6HXnt69Pz0q4LVtVBz+PWVA+WteNXFQLFTTAOymQY99KdcdxLJlJZpYQIJEKSSWHnrA96TrTAmVWOokn+00dRw1y0ZAhVERPwyDqdv9eVCymzvKBKMZuC4cgOY1AHWJOoG/Lf86h+0mNAQIhkkRM6ADf3q5d4kFsy7HxNInWfQf2pS7Q8WzJkywSecZoHXoPKl8OMu9mRkIRSTAOPuifD8+p/tQtrtTYi5VG41baLtMXI5u5rc0NT4e9qKrE1vhkk0QgVvBjnaNuHxEoVzEb6iDE778j5VpYukkyxYCNSZ1jWPzzqHCrAFWUFJkCaayi9qWJ3mrVpIrYJUiJXiZZVhXs/iMt1fWuh8Q4KmKtzz/HrXNcCsMD511Ps5iZULS2T1Qx9NxO7X9nRasrcnxoIA0ykToYiZBJPuao/+LLhcAlwXBavXi4z92XJ7tQco2AJJAknSdujP+kzFKiIpOppD7TWQ3DbdzfJiAB6XEefqq0RBdBoE+mxES85ZixJLMSSeZJMkn3qMipHao60REmAEwCvaxayplKEcrt1C2sxPLeKqXrubU76bCBoI5VqykzEelbW7JIJ6b/XWswCt50wtuZiualS0dwfrt61LhcPOoH0kH+9SLbAOYmPTQfd+FV1jgQRSpLhFAOrEzyA66b7/AEovgQB+6AfMyR9PSqNq4CpyA/5VP/Uf9q8tm7BCgICNSzSfkOfrQWGqRY7byzj+KASIVn0AI/dHTynpvShjZJneaJ4gKsiczRJJ2G21Crr7zzprAgXiIdUxbYwfebWqjmp8RVZjWgsyG5mCifC7E60NtLJApjwVrKKrlahD9Omo3LeSBXoNaZq2LUpNCSHWrFhaqq1W7fWoMlYTwFrUV0Ls1a0pF4SJM0WxHHrmEh1tNcRtJXXLtEjfXXXypcglqhW9MXe1t+4cdeN85crQgIY/Zj4coUHQ7nzrfiNy23CsQp0h7Zt8gxziQJ1nLm9polxLtvYvWLrLYm4qeE3FUgMWC8pMjNMGJy1zXEYp3jO7NH8TE/KdqYRSee0oRtR4g9q0IqxdUbioSKcUxLIlGarWVsorKtcCVjffw5AmNelROkGJnqRI9tR+Y50euYbwzlnmfIT901B+oICG5Ebec8j02rFGcTrWwqDawZh7twRBbw7ROh3086m7zMW33meknWdKM4+/cVAioFUGRlBDNpvUnCsWm11QJBE6SZ18VU8U1qqU0V8wJnHWvcRjcoAPoDzHtzHrVu/Y8ROjKBqSMoHsOdBMTb7y4FU6ZtjvAjxT9I/vR0puZTqSVFJyeJVaZJOoIOvXUTr/AHqlebeiF6/lL5dUMCORA6/3FS4KxbcHMrMsciA9s9dwGX86b04preYmZKNRdczpVZqcrnCsE2gu3LLdbiypPtMD1YUN412buWxnQd5b5OjBwdPIdZoyZVuonkwtVwZw2C2u/nzo4hpWAg0TwHEtg/z/AL1ORCdxJwZQBpMPWVr2/ZNa4R5IonicPoPOkyaM0QLEBhtYqzZeKK2uAMbF/EsMtu0kgn95zAVfSSCaC4bEArL+GP3hMH23+VX1AiQmJ2JqMnAySYpl43wlltC6GAUA5pMALGs/L7qUODt4hkdWPKGE/I6/Sm7tDihdwy4YMJYqXA1hV1APKZAPtSuVgrWY1hxPkIVRObcWxpvMQvw6bCMzCfGw6xpQq5ZPSmvE4ewhyoSx8tv7VQvi3/C0nzGn0oidRfAmo/6cNF3F3JUTLRe/YGsajrzofdt00jgzH6jpikrga15UqrrWUW4j4c6Bh8QUYHMAIg7nQaag9Y+tE7l23iF7u0oFyDJYECOqedBLydB+etS8JxGW8jGdNJ30PkfWsFsd+Ycidlnwdx2hDAXo8DyY0B/0NTY21ZPiVio5rANVuNWWW+0AyJ25g6gyOVV8MjASG38qqFvzAyFwKy6wZU4heyqADJOijpOpnqecfkj2KWrYBJN25JIBjKmmXWNzP1J5azIneM95gO6s5sp1hiupbXzGvyoDg1JVndvFEiTqxnz3/wBulaONBVe3P19ph53K5Aw73R+O5+/Am18FY1AjQ+vtWli9DAq4Vp8wPbofz5UQw/ZrEXBmKhAdfGYPyGvzihmO4JctkgwfMf7U0hXi5n5lbkDaGgiYgZQwW6D/AJG6g/wt9PSqV/GXsPfbKpsE7oNUjzB0YHf3oVh8UVMPIjQMNx5H+JfL/anPB4xL1sWsUudI8NxdWTzU81ndT9Cahl0fIimsnbiALyWMSYIFi62zD9m5/Az+TtQnH8KuWWyusHkeRHUHnTbjuyj21JUi5biVcagjz6UQ4Xh0OHjFSbZZUE6lWIJzKdxAj2qBnC+k2J44tfPMTOCY4owDSV59R6V27guAw+ItW2UhlHMHn0PQ+Rrk/H+zD4chlOe22quNiOXvUfCOI3LRzW3ZG/lJHz6ieR617JjXKNSmSmV8XlM6f+k7iVmzg1wykZrty2Ao3yqwZyfLSJ8xXM2wZLEE5UQlZI6bwOZq7YUXbvfXSzvIMsTuNtKbcVZt4i21wW/trKguqj9rZ2Dgc3XYjnA6iBOuhQBzH+j6kKxDek1A3BRZVfCpGsZj8TfnSrmPslhltqCQNVk6jzP4GoeI8PdHRWAGZA1uNVZDBBtkaHf2rexhrx+CF65T89tqy8i6X1Hn5nW4mxPjDIwr+IMe33Xgyrn/AHiPFk/lEyJ6nzqpibenn6AaUzYfg+US5B9Bzra7w62QSxb1J2J20gafOvDOAYQ5cQGkbxJeyQdR9K1u4JeensT7aUw43hjASrIwmJBAJ23HX0oXisKc0Az6cuk04ma+8Vy4EZTW8F2cOuaQCY5ERJ+ZNZVy8QsR57HzIJ+lZR7LbzNOjF5TGLimHMBlWQILHXmPhI6DWivZnsw95MxgTOU5pGm+g+W9WOHXVuJcXu8tzSAQTr1EzpXvCw9vEJK5crDVZyn+I6c4/wBqyGzNpK8VGs2R99Bowpxfh4XKSsBYUx8WnWd1oJjMDn8FmA1xgM2+RTIMciYk7aRPq58fVDbOXLLLoSZJBOmvIUu8NwRNxbZJbKrGecnT6CRQUat7ieLM7Yea/wBSpieCjuTZyLly5QNQpEaZiIMUO4N2fs2CrND3B+9HhX+gfjv6bUwcWv8AdjICSeZJmghxUmtDp1dU3PMDlYZCD7cQwiqfMelSYrs/avIQBBqhgNTTRgDFXFgwGQ0NpxHtLwV7DMvLn7axVTs/jzbYA6qTqp2P9j510ntzhg+Y1zHFYfI08vxp/E+taMz8+OiHE7L2PVCpKHOh+K2dxP8Apz29NBRLj3ZxLtpFtDKfE+QjeYHsYArmPZ7jD2GturEGNPYkV1fhHaC1jIS4RbvRo40Df29KSZCrT3axEWxeNktauJ3lo/HaO/8AUnRucc/XWh3Guy6qBestnsv8LxMfyt0I8/pTp2l4K6tmZZjZwNPf8/fQPB8QbDs0p3ll/wBtajcfxoP4wOXMe1ERjyJfykbxawGGdiECSToI3J8/9qM2b72GS6vxWjJU6FkOlxPdZ94olicGcMy38Oyvh7w8Fzpm5HoehPnzFVsFaV110I0EnTarPkPfiHx4gw2l3HNbk4e4f8NdHe2Lg3s5tRcTyBIzKP3SOczc4TiWcth74C4qyJmfDet/u3VI3BET669ANt4Vnwz2xPe4U57fVrL6keYBzD/lFWeEZbpsZR9pZM2m/lM97hyehXMU85Gg3o4V10mWVWxnUO0vPYbmDHkp/CqGPsEAMp0JjX6g/SnC9gM3Kqx4KSBI0kmPMx8thWPlQ4m34mji61RRMQeIYEglVEAtM6QIHLy8z0qnjcMFn2n5D/T5inrFYNVUlhJHwjkD1PWKT+JWC5MSfODr0omHLZqa3T9R4or2itircty201BHTr5fWsohicG/JHHsZ+6srUTKKi+XpNTEyfhWNa1lLZshJ1U6n0k103DYC3cw4uW3bMwkSdTpseVczt8LutlQ6hfhHQEydq6B2dtNlt2nRlVfDIbrvNZ/VhORzBdZjKoGBqv6l7AWjew4buyriLcmNAp1PTWob9wWQzqZUgAHmTrM+VNtjBpZssokrBJnWSeVcy7U8QKmFMfPTy9ajDiBYN+XMdM3ilgvpuBcZxFiSxEzO466SKq4e7LdQeevvHpVO/dz/wAvptNWuHYc5hz9K0gABCsewjtwexIB025cvzNFLrBQah4SoCfnlVfi98R7UCCokwDxq7mzUm4zCZgQedMF/Egk1RxoAXTcwAJAknbU6Cj4yRPZAK3iqHIKr0BH/wAmola4kwGlSW7WDt63XfEXOa2iLdkHp3jAs3qqgeZqVOMWYITB21HLxlj8yu9Ntv2mau3eM/ZL9IT2iLWIm5a5T8aek7jyp6vcHs4hP1jCZWkaryPt+6fLb0rkuHa3cE90u8aOBHnGT8aff0eWszsbDXky/FmKtb0iZMgzqNKVcC9hC6NtVzOEI1lzaZM9m6YezGquT8aDk07rz3Gokycc7MmwpNuWtlt+axybzp7fBLcIuSM6jR1/H3j/AEqhhMK1l7jMcyXCMysS06H4Z5x13A+Qi9cy+PNRsc+3vFjgF2LttWUEvKZucEE8vMDQ1XTCizcuBDBzbZQYYEMp99DTfZ4BaFxb9o+ASQvRiIn0AJ0oJxGz/iGLA5G3IGoiVnbyFLZRoG/eP4c6uxr23+ojFgbveIGGsifnrViIG1UuDYUWlyhs6mcrbeZUjqDI+VEHUkaUrn1MumZ7katuIu8Wsk6iB5Ur4zAuZhm+ddCuYYHce9D/ANVWY0neY+lJhik0em6zwxtOe8QwIthSGZ2IM+IgAzoB10rKfcRhLKnVZ6gGAD5Csq6dU1ekmaKfqlLupM5xwjirFszW7JiJzKAecRBA3j50z8I7QrKhkA5nKTv0GsGud21Pr6Uw8Dsksq5dSQPPetDqMK8zR6jpcb4yzTpuP4gDYWJ8W/oPxmK59xvLckzB1AMTPkTz++ifHeKiWUHVAVy81I3kcjNKeIxBaT0AlSdTHMec6+VWx4mAE57p8aqpqDWQo+0nzgqfbnRngVsk1TsQ+h1HI8x5Gj/CMPl3psttRkN8Q8zZE9qVuOY/Q60X4nioWKQ+P4uJNexrZgS2kXPbGJkmhXaLGgt3asGVYkjYmNh1j76H3cc7KUt9PE39qGW3p/Hho2Yjl6qxphC3iyqsBBDLDZlBI1nwncHbX1rzD4wr5jpVdROtb2hr0jWjUBF6PaFlxHMT5xuPXy8xTDwDjroCgb7NjLKDBnQSNNDoPkPOUqzdKnMPyKJW2U+MaA7jof7fnpQnxgwiZTOo8F48bbysjznf1Ap2wvHLd4ZXgE8xt7g6Vwvh2MKn4jHKaaOH45xrqQCMwHxFJ8WXzik3w6eIyAuTnmdOTGPh3ljmtncgD5+o+cabgUP7VJcVluIZtnxAwCIJn8T7RU/DOIWHAT4A0ZCWzI3QEyYblBirdvCHu3sHYS1ufL4k/t5GlXAI0/t+fMnGfDcMR9fke/2lfs/czgodMwzCOREA/h8qN2OYJkjoOR2pe4FJdckAayum0HbrrFTNxJkugLHidVaemg1rP8Jg19pbNjLuQv1h11O1U76gGSKJb6HeqmLTl5VXMpRbiuNt6gu9ZGvQ+9ZVpUVASzbxpWUj46+0cGQ9pxDCMk/6004XiaYa0bwEPB7tdzm2VjOwza+cUvcHwQjvLg8GsLzeJk/0j61Z4paa4bY5sxJH8KiAvt91dDQOQfE6P9Sy305H2lDjNlwLV8MQ5PjM7zzPud/Or1m2LhMyrR0gGfx+lNmC4Gt1lzTCDkd5oFx/ii2rz2hOUDQhjmU9RJ+h+lELFthMPG9WBB4w5ttB06imTAHSD+fShHD+PLeYW8Si3AdBcA8Q6bQY8tDTha7Mllm024kSZU++49wahh2g2zAeqKPHGK1zntDiSWy8uddD49dCZ0u+EqYPMq206br1igF79G2Oa2Ly9ywdbbwLuuS4QFY+GI15E+9M9JzvF+seloGLHZhc10p/EpqvxDC93euJ0Mj0IDD6GnTD/o/xmEvZ7hs/ZpcuMq3Gzd1byi4wBQAxmU6GrHansFiDdFzPYRSbdtjcu5IuMpdFbw7lco9SBTlkZPtEPKcd3wZz7L0qfDqIc9APqR/ami1+jjGteu2EbDtcshc4W9orMSFtk5f2hyk5elU+yfZW/jrd/ucim21pW7xiurlgBAU6yIqWupZHWLjoakwN7K0H4ToR600Yn9HWOtWLmIud0tu33uYZyT9izK8ZVI3GknWRWN+jnG58NbyoGxM5PH8DC2LuS7p4WyGY1q0jytuDBGqPl9IPkdQfcfWnPs3dkidx+YqpiuwOMATP3Kqtpna813LaW2GgFiRIMkiMuvtoV7O9lMUe8ZWslbThGZbudSciuCpQGRlYbx5xQMikiNYnUcmPTcJz2yViGXxTppvp5+lVsFxp1sC4WzNh7/d3D/FbBAJP+RvpV/s7jluWYJ5fMEbfWKXsXb/88kABu6bSDqVYNI5HwiksiLYMPjJYENwP/kO3YtX2IaMrhgPI7x5cqn40EIZsuZjmIOoAUGASFOs9aV+NYktbs3eb4dG85CIT9WPypptYoNas3NZ7q3qBzKgj8aVZNJMKRsjd+Ia4XiM9tSfiAgnqYH1rzFEk6UI4NxZXN0DSMpiIGsjQcth5VbfF/L6ikuraxQi3gkOZgE71lV79w7gxWVm+HcOEJnLbF4vckwBByjkqjcAdAPuohw77TFEzpbAWPbX66UG4dxBVZrlw6KIHn0UAddveh2Cxt0lwpKKSc7/vueYHQV02PETZmn+rZhqXGPz2nTcZ2gsYVCM2a4Roq+I+UxXNOIq118+VpJ8vxP4VNcxSAeFYPrM+Z51Lhbs0RV07zMQCR4PDMDORvmDXQ+ynapbIy3FuR6Ax5/FNLeD5D861LeuHZVljoFG5PID3oZazL5MQZd5T7dXLdxjdtnMGJJHTrH1pfxHaTEXBYtNchbC2hYALLbPckFBdXNDEkDXyFUcZiHNhb2oIuMjjUQWkgeUFXHvQ63dVwVbTz6Hr+fPrTiIVWIFgTRhnHfpCxhxKXylhbtvvAYtEBxdGV1uAscy7GOutF+Ndpr+IwfeypZrqYhvD/wCra5b/AAgTp5UuDgq3LYuXbyW2BKkZWd2CxqABBOoiWHqKu8Ox1i0ndCxde3JlmugNruQBbyj+mT686u+QGiORIx9K9ny7GeYX9JGPRrj22t22u3hfuFbQ8bBQuU5ifBAGgg7660y8Hwlzur+TH2bLY0C/eFqFazdVluLbBF4FVIuGdoyuNoNJF/giAPctXkdFElGDJdClguogoYLDZz+FWLPDrdrN3twPKx3doNmkj953QKusagP6c6I2Re0pj6VydJG/0k+F7c4i3hlwpt2bltS5i9bLtN1i7y2YTLHmKJp+kniLMLhe05W6biB7Q+zbKyEJBGmViNZPnQXucK+jJdsmNLmcXR/mUopI8wR6HasfgkG0q37TLcLgMC+VTbVWbMGQMNCDoKr4gqEHTFT512hSz23xeSW7q7FoWbgu28/e2wZUXpPiKkmG0OpmatcN7eYhQ6ZMPkuOHKdwAqsEVBlCkADKANZPnQkYCyodGum45t3GBtgqqm2juMzOAW+EDKFG/wAVCrdojXluPP51UOD3hmxgH0x/4RxUhAATHM+lWuGYvO+NY6EJaBPWQ8ffSTwZJMNKwddNflP9qbOG2gljFXAzeN7SaiI7sNProaXegajG7JYFS3x9/wDAYQ9LB+QEa+wFGrbsuHsWgwDG1akf02lmKo8UsBsDhhH/AOMTE9VB58taixzhGtMWBi0ANdRlQCY9QRSeZ7GkfML0+LcE/MsdnLxR70/DKgDmvxEj0o02JIlhqPLX5+VK/Dr7JbMsdZIBMiNIgHapcPxN1ObTXQg7EefKkMtlyZoDpNQsCHRxITM6HlOntWUPxCLdQG1od8kzrsYPP319ayqaZ4YcR9RoxB4Uodsn8REnyEk/QVnEbiqzBdBO3So+CMB3jj91Y/5tvoDQ7GX5JroUTcxH9R6jUwHsP7mG6SaL8MoJYEkUycMtVbJsIliu4Uw+lX+BeLEqTsoJ9zoPvJ9qoXTlUmrHZ98qm6RoTAPWNPvzfSs/OaQmO4xr8skx3AF/WL9m4R3ONJNs80xAglfUkZh1gj15pxXhz4e61u4MroYI/EeR3rqXbPHoMK4YTtHUMNQR0PQ9WFc441xj9ZALszOuiltXyn912gBgOR336010LuyWZldSoRq7zxLxNtD0Zh9EifaflRXD2WuraCMsqHRrTXBbzB2kMpbwkiTpvptrNVuErbNkKzZGLHVgWtMBl0YKMykTOYT7bmTFYMp0+HMpV1dGWYJVhtsdDOxkzV32O00sLjJiVHJG4o/M2ucOZBftMCrm3ARwFb9rbMjUhhGsgnzAqpificdKvYC6Lttrd2SLQD2jzSWVGUT+6Q2aOq6RJmliWGdx5mqfn9RnpdY6lg53r95c4/hmW5dBzQb1xlknZsp0nl6VTVISwf8A+mK/7NmiHELDo6rfZ2UEiMxJyiJKZtIP4VtxDh5RbThg1tg5QhSsSjBgQSxDbTqeWpEVCn8+0FlVUwqo3357cwXYXxNHOziP+xdqvbVggA16iOv5FW+H/tNp+yv6HY/Y3NDFSJbE94JAUM2U/wAoBAnmM0D3q4ae6vbMT8S1gsIYhf3JB/qO8em1F+F2iuCuEyZuvM76Kpn51c7Km1kUFwcuZgcpGYtqcxIH550XtLZ/V0XcsWIA01LESJ1NKZc5G1SUxgAbe0J8StZUsqDBW1bEkbeFB94pU7RcPAuXLqzEwRsq5jM/h0p8x+Gm6WGuTKpU7RmMaelAuJISS0HKDsDEEcmHMUic+nKSJbp6YKO/+4u5z3ajfQnpG8j7vlVO1jHUQAWU8on6UV4njbbLGQL/ABFAfEOhnzM1VtooyxMctSYOggk8j9K8GsWwm9iICUVmd1cCqVgak76GQBI6afdWVPw+42YqNpMLoIPMVlUOUqaoSjuAdwIo8Ntn9XMbuzEeijb1maD3Goxcfu7dtRoyqD6MfEfqaD3reVokHzGxBEiPY10i8mcdlNm4T4dhiHhgQQYI2IplwlmBVbgOFNw5maSQJPPQR89APzNFeJEWwNdfzFLO1mowi6RcocXxPgCjc6e50FW84tqqHa2Ndd+nzNAP1jPcmdF+8/6T9KkxWJiFnSZO/t+JpbMhYhZp9BjvznvNe1+LVjYS4xC3PE5GsADKNP6tf8tLGFQklFIIM+UhfX7qv8fxD94mpjIseYkzRi5xBw3dYcCyC+XMpYvM5fjYllH9Me9NofCxqB7TLfpz1HUPXY/xx+bQdhbBKBdmBYwZEg5YgnTkdyKvNiYtC33LFxIDydASSRly67nnVrA8evWDJuG8JYEOWYSuhjNqN9xRa72mJCXUtqJRjlMkSrMJmZGw50F2Oq6jyaseJF2YX5T8yn2a4BfuZmFolWWJG2joTrsfhOxJmq/FuyeJtszvaYBiY0Py6T6TVhuM4/HXBbF8qAJCK7Ig1A5GSZP7xNEOG/pAxeFDWnIvBZEXJbboTrFe3uWYZxkL0C3cfEq9vLTG5aAtnRNYBMyTDadfvmh7K5wiggjLcugAgyc1pYj3p17QdurlpwO7RxGkjaOQ8qrJ2pN/CvimtIvd3chRZCuuXNJ13B+lCsqoqLh8nggFdr5vvcQ+F4dw0lGEW72pUj/0bg6VdvWguGLRuyr8zmP/AEURsdoheui33KoCtw5gzSMqMw0Jjcc6o3u1k2ERsOjSttycziWKTIhtPiNWOssNvbvDZSzPRHmr47d+Zf4bhwbEgbB2P0Ao1wO0h/U7TiT9mQZ6nN+FV+DXk7ppEK1sHLJIHeW0aJOsTO9X+H2SMTYE6rZn1y2mMj3IoBYsSplKKi/j/EL8WDrcW5mlX+QKrJ28xQB+NE5gyiQdCJP30yYPHLcW5aOsF2HUZfDHv/alZuHuD8O5mDv5aRBpHynUH5jPSjzAN2ml/DgwSD4wTExPI8ql4qtuzaW4FOVgA6sNQeW350r3vluFVOYxJWG5j4lAYfjyqwb9p7eUuyjlnBH3H8KFZBFx8u1i7isuPVDsSWgyWDaa6TGsbTE1lXOIcPZElMrKDuBqJPLymOVZT6DG4uv5h9SmKPEWOczzoeCNNZ6jmD/aivEAZZjQSda3V4nFNtOkdjwCu2tCu1eLPelRyqbsZiYjWDQ/tsuXEMYjOAfwP3fWlVH/ACGN0WAA7wXbu676dfvNepiTM9fzFD2uQPX7v96sYRCRsRmMKYMT086uyDkzUTOAQo7S6OHXbxZ7YByqAxOgUakAeZ/CpcL+3/8Ae/8AvQri2LYMLAOiN4lJEC5oG20kQFnyFErU962X4u8OX1zafWoyghRftFOgcPnyEd7k+PdCBkEQ1wNpHjBGY7n5/QVaSxOFD6yqN6QWuTPyqrxDEvcaXZWMsPCFABHxA5QNdqtYJ/DaXvAma3d+IEo0O2jgcvPWJ2oULmHh9PjreiOPvxI+z9xgzZZzlPCBuSHRoXzgGBz2GtQ42wxZjuZMqdHB5gg855CTVi7whhGmXN8IPiRtzFu4JVtOQk9akwnFsh7vEAvb+Ezq9vlNsnUR0GhqIbWXY5sBBNUQZr2kvZrp8ndfkahsXithVBPiuX5HIxatHWo+IoQzKxzMt24rNMyQQCda0J+ztf8AExP/AGbVergfnEAD/wCIp+f8yz2bt5sTb81u/wDauUIv2yttAQQRbtggiCDkXQ0R4JZd7qLbbK5mGmIhSTr6A1UxlzNLZi+YK2YzJDAETOu1eHq/b/MedB4uq99J2+43jXwy+FRcy5lNqxpMHW1bFOeBs5r7kbJbKxyEi2untNKmDwzPaswu1uxMb/s0+e9M2Ev5f1hgNAABpB/ebb2FZ7NbGuYo6/8AGPp/qCMGz2jeuzsqgEjSWYk6b7CrlzFXBZe6QMxabQLEz4fEQDy1GlRcOabZDQRcuH4hIhVUbSOZPOq3aPDPKqjWyyoAEXwwp5KCTB++KFmAdgG5hsKjXXb/AFBVy47KtxY2nzB2JBB/1FWVZ7i5mtAldNRvP7wIivMJg3UjNmI328QjcGj+Pxgs2rdtUmSZ6Drt91DyPVBRcdyPRAXe4KwFp0E6gHlyH9+VZXtvihJYBBExAM+ZJPrXtBZWvcSDbb1EHHjegrjWoBxO4pMtmBOza/LpWLjFY66fnrXYDGROOOZWjb2TvQ1Fu3eFDJbudCVkdGE/eKAdm2hxTn2nw3eYK5/KubT+WCfoDSb7ZBHsLUtzmTWWJ0BPoCaKW2/VbRYx35PhUwxtKNS5Xkxjfl84GPiWRTkJWOYJkt69BQl75M6/Edep9fem1QtzF+qz6dh3k2LxjXbmd4zGJgRMc9OdNuDH+I/97/70pIBcKhVAZV11+ODuB/FG/WKbMG3+IPldk+QD6k9AOtB6kCgBGv0c+Z2aQKfi/wCNf/6hU90R3H/Cv/8AXQ79atxcOfRb10mFLaOwykHbWDzqTG8VtjulBYqLbgsEEy7FlgZunnQ9DauPypdeqxDp8a3upBhHC4traX3B2tg+Ry3bUTUGO1Zj1M1FgMVvkFu8rLlZGzAxIOqhlYagGQY863Rwzw7IjMfhXxETtpOg5eIzVNBEeTqcXinKWGkgfvLPFW+1uyI/xF37xUF4+Gx/Xiv+zZq72quJm7zxgO7HRQdSNJlhGgoJd4hb+yH2hyNeLEooP2tu2ggZzMZSdxUojGjX5USPUoOn8O97/wA3C3BL4S5nOypdJ9rVw0OT9mv/AA7f/QtaYfG2gH+0Otq8oBQglntOqgRmHxEc62sA5UkaG3bAPIkIoInqDuKjQRZMcTqUy9SNJ20197nVOz+GW7Yw+RvtEt2pT+IC2h8PmOnnRfBYLPYdSMrO0dNgBz9TSJhMe9nu3UghbdrTmAbVv8+4pvTj1u7h7b3DkZvFO4Orbx6ViZMWRSWG4P8AEpl1Clv2+09ThbBrdsb5ZPoWZiYPOKD9q+D3Dd75dyPh5+E6Ee3L1powvEg2ZjBQZUU6HWAND+d6qcY4l+rxmXOp/d5r0PWlzmyrkArf+5XDmyBuPzmAcJjXi3mALah+kDr57Uc4jYWGYQQJJEbfmaD4nG4W58JILRKlW0OnPLHWjdpo8QiCI6yvP6VXJexqo47DZhtFLiFt1aEUgXfEXUE5SBLa7AE8uprKMYrAJmzEMdB4ZMfICsphOoAUCv4hrDbziNiyjHK0yRoeh5aVTuIVJB3FGOG4MXjdQfEEDL6qQI95obeaTDiGGk8/euwB3qcOy7AyxwjiL2mBXUc1P4dK63wPiVvF4dgh1ylWU/EsgjXy864wUKwfkRTZ2T42RcXSbkZQdi45L5noD5RQc+IMLEP0+Yr5TxAOLchFjQyPmJP31RDjxFgSTsZ2M6k9aucXbWP5mOnQnT6VQoqDaV6l7ybfE3tMAZ1nkQdjV3ivFGulgoyWyxOSdyTMuf3j9Byih9eVYqCbgQ7BdI4m6gwSNtJ1+WlY9wmtY0mp+HXUW4rXFzIJkddCB9Yrx2BM8PaaYfLmGf4Z1jpV/hd2wrObgc+FhbKQCLn7jtJEgb5ec0MitrTlSCNCDPuK8RPAzrVg4fFYcE2bhWRmE6+FfECc0oc/i56etK8YFc2axePiUAd5BVQtsPPjjNmF0jcagaAVQ4Hxp7dwhpYPBOXkduu0UQ43lIW8vwvuep8/r9aVUFTUcamWxKtnE4BbUvhrly7ljS6yWw+YkMCGLRlOxXdRvMjXheIt99cVFIs3SzIjGTlDMUBM75OczI3oTc16a8hXli4Q6QwWGGpmB6wCY66URl1LUjG+htU6KmEto3fXW+yC28qzObKirr8tvXlVZ+JJd79rS+Cfs7ZGqsxtlmBHIHMQP5mpV4rxY3DlBORdB59Y8p/O0X+xuMRLs3DCKFYmJjwty9QtKHBS6jGz1Ftpj8mK7i2lo/EAGfmCzbgjn09INZxLF/rJz6kxqoJ+nlSb/wCMm4Xu/wAbaDptA9AsCp7PEQCDECQCZn3FZufpT4mrvNLpnXSDGDD2VkBVM6A6g785iiHEMaFAtBzCcgpBMzQpeJC7oreLqRGb1qjiGYan4gdo5etK+EWbzRxWQmG7HaVQe7t23OX9/IW5SR1rKAPjSSCsqwENE6+emxrKJ/8AkQ9v5k6Ad6iV2dxGS4907AQR5E8vpTbheA2MSrXCqtqfFnKwIXLIDDSc3yPpSjw+0O4uHqfuqtbx/gC7EE+kV0RBLahOTBAQKe8cW4LhbJ8b4dQeRvOwO/Iv0j617b4Tw1/2dyyr6EL31wjSCxBzDkGMenSgXDbouqUuLodjyny6HnQ23ZNrEFCfhFzXqO7YqflFWVrsd4J8emiOI1Yjh+Bc5u8w5J633XXz8XWOleYjs5hxauXAtuFRiGW6zCRMbt6UiTpHnUtlR/L7kD76LUFyZmQx/pNFeMWMNl+xUhswnxE6QZA1OsxqRr5c5eHWldghWS2gyMpPsJk+grXiWCVT4WO07/Wq6t5fRtcl7McNwVwOcVeZCHtBQHykoxIutHduSVENpvqPMXuGcM4Rcth7mJu2rhFw90x0nvGFlS62jl8AXM0H4wwGhFKplZHXnW15FDAKc59PKpJkVH08N4OwFtsZcyKkqoO13UvLm0MytK5TAnK500Fe4bs9wNmM468RIywQIGikEm1qcwdv6WQbzKBgcG9xgFBPtTNw/CrbJJAhQdOnp50F2CChzGsHTnLueIyXOBcMyOlnEXDd7oFACILZGLZh3YhcwVeR1PrV48O4abZsvimgqpIz6K4icpFnaM0nkUG+aklbuQG4w8T9Dqo5AHyFa2FHc3bk7CBrzOn3kULUbsx04hpIuTca4Xg1ewMLfZy5uF8zBgqgjuzoi6kbjUbQd6k4vhkuXkttfT7NVDeEyZ3kiddvmaWLd1rbBgAfJhIq5gMaks1wkMxJ208uc0dla9Uz0YVpPvDydlbLk91jV/pe2c3zB1+VUuIcLGHD/byxAXJ3TLmEjmTGm/tVZlJBZDmH8utSYXG3Gi07F0O4YzAHMTsRy9KqGbvLMi8iGMBhbX6urlirCA3iXcuF1U6/DLb7RWXLNqPDfJ3gZI1AkCc3tt16VU4phO5Wf/2OT7qzAfSap22BoGQAm41hZlFXD3CzbEm7cygRpBJ9QQNOVX7V1HUfaK4O24Zd9TPKY+dL1q4QNdfapcOqEgxHodvSlGRSNxHA7c3GHD4PxSwEjTxDQ/nrWVW/XGGgAcDYbEg9DP31lJlHJ2jidSwEQ7hhCBtA+6qOWsrK6Ne85V+30hzgP7K55OhHlJFa8X/8yn9Kj2Mg/SsrKGP+w/ntCt/1D894EA0FZlrKyjxaEeDGL9ojcOKjuOcoE8hWVlU7wg4lVhXlpdR61lZVjKDmNHD7zW1TIcvxbe9R4vXJPNtfPQn769rKSUDUZvN6P2kHFOVW+0FsLYw2URnUFo5kbE+eprKyvf8Asn1P9QWX0P8AQf3ALjlWhQVlZTomU3MjQlSSpIIEgg0z2kB7tiNXy5j18LH7wK9rKpll8PeEO1w+ztf13B7ZjQC2orKylB6Y4PVCeEPhI6/61o2kRpWVlL9zHBJLeIbedY/GKysrK8QJaf/Z	2024-09-30 01:19:28.008529	\N	3	Approved
346	Turning Red	NaN	A thirteen-year-old girl named Mei Lee is torn between staying her mother's dutiful daughter and the changes of adolescence. And as if the challenges were not enough, whenever she gets overly excited she transforms into a giant red panda.	2022	Disney+	https://youtu.be/XdKzUbAiswE 	https://www.imdb.com/title/tt8097030/mediaviewer/rm1685446657/?ref_=tt_ov_i	2024-09-30 01:19:28.023533	\N	2	Approved
347	The Conjuring	NaN	Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.	2013	Netflix	https://youtu.be/k10ETZ41q5o 	https://www.imdb.com/title/tt1457767/mediaviewer/rm1035247872/?ref_=tt_ov_i 	2024-09-30 01:19:28.025999	\N	2	Approved
348	The Conjuring 2	NaN	Ed and Lorraine Warren travel to North London to help a single mother raising four children alone in a house plagued by a supernatural spirit.	2016	Netflix	https://youtu.be/VFsmuRPClr4	https://www.imdb.com/title/tt3065204/mediaviewer/rm2478051584/?ref_=tt_ov_i	2024-09-30 01:19:28.030023	\N	2	Approved
349	Tangled	NaN	The magically long-haired Rapunzel has spent her entire life in a tower, but now that a runaway thief has stumbled upon her, she is about to discover the world for the first time, and who she really is.	2010	NaN	https://youtu.be/2f516ZLyC6U	https://www.imdb.com/title/tt0398286/mediaviewer/rm798852608/?ref_=tt_ov_i	2024-09-30 01:19:28.036116	\N	2	Approved
350	Locke and Key	NaN	After their father is murdered under mysterious circumstances, the three Locke siblings and their mother move into their ancestral home, Keyhouse, which they discover is full of magical keys that may be connected to their father's death.	2020	Netflix	https://youtu.be/_EonRi0yQOE?si=IIhKwJs7h3N2AyrM	https://m.media-amazon.com/images/M/MV5BOTdkMDY3NDctZTgyZi00Yzc3LTk1ZWEtNWUxNTVlN2YzNDU3XkEyXkFqcGdeQXVyNDk3ODk4OQ@@._V1_.jpg	2024-09-30 01:19:28.041152	\N	2	Approved
351	Gadis Kretek	Cigarette Girl	Amid the evocative blend of flavorful spices to create the perfect kretek cigarette, two souls embark on an epic romance set in 1960s Indonesia.	2023	Netflix	https://youtu.be/PJybk11EIm8?si=-5o7RqiijqWx9kiS	https://m.media-amazon.com/images/M/MV5BYzcxYzIzODItMTljNy00OGYwLWJmMWUtNzIyZDdiOTI1MWNlXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg	2024-09-30 01:19:28.050045	\N	3	Approved
352	Nightmares and Daydreams	NaN	Ordinary people encountering strange phenomenons that may be keys to the answer about the origin of our world and the imminent threat we will soon face.	2024	Netflix	https://youtu.be/YF6s3lIc17Q?si=vOut8-buvxyfIW0m	https://m.media-amazon.com/images/M/MV5BMTc4N2M4OTEtMGExMS00MDJkLWJkYjUtOTI5MmQ4NjhjYjJiXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg	2024-09-30 01:19:28.054754	\N	3	Approved
353	Bohemian Rhapsody	NaN	The story of the legendary British rock band Queen and lead singer Freddie Mercury, leading up to their famous performance at Live Aid (1985)	2018	Netflix	https://youtu.be/mP0VHJYFOAU?si=tEUYVdP5TE_NHU7a	https://m.media-amazon.com/images/M/MV5BMTA2NDc3Njg5NDVeQTJeQWpwZ15BbWU4MDc1NDcxNTUz._V1_FMjpg_UX1000_.jpg	2024-09-30 01:19:28.059053	\N	2	Approved
354	Young Sheldon	NaN	Meet a child genius named Sheldon Cooper (already seen as an adult in The Big Bang Theory (2007)) and his family. Some unique challenges face Sheldon, who is socially impaired.	2017	Netflix, Prime Video	https://youtu.be/FStMMcj-RiA?si=gJ_zZkkNb1jB-4uJ	https://m.media-amazon.com/images/M/MV5BZTlmYjk0ZTItODNhMC00YmIyLWExZWEtYjk0YWQzMGNhOTZmXkEyXkFqcGdeQXVyMTY0Njc2MTUx._V1_FMjpg_UX1000_.jpg	2024-09-30 01:19:28.063385	\N	2	Approved
355	Spy Kids	NaN	The film opens with Carmen and Juni Cortez (Alexa Vega and Daryl Sabara) being tucked into bed by their mother, Ingrid (Carla Gugino). While Juni applies wart killer to his fingers, Carmen requests to hear the bedtime story, "The Two Spies Who Fell in Love".	2001	Netflix	https://youtu.be/GE5aHKJp6HI?si=rwvzLkvs829Sn2qE	https://m.media-amazon.com/images/M/MV5BY2JhODU1NmQtNjllYS00ZmQwLWEwZjYtMTE5NjA1M2YyMzdjXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_QL75_UX190_CR0,0,190,281_.jpg	2024-09-30 01:19:28.069313	\N	2	Approved
356	Spy Kids 2: The Island of Lost Dreams	NaN	The Cortez siblings set out for a mysterious island, where they encounter a genetic scientist and a set of rival spy kids.	2002	Vidio	https://youtu.be/8tTJ7kMgANg?si=w5iOj2O2Y07Jm0LG	https://m.media-amazon.com/images/I/51UtV22RQPL._AC_UF1000,1000_QL80_.jpg	2024-09-30 01:19:28.076137	\N	2	Approved
357	Spy Kids 3-D: Game Over	NaN	Carmen's caught in a virtual reality game designed by the Kids' new nemesis, the Toymaker. It's up to Juni to save his sister, and ultimately the world.	2003	Vidio	https://youtu.be/GeFgj3CsfpI?si=8qIqAfIdRUVQ4yoR	https://m.media-amazon.com/images/I/51J30GKHNGL._AC_UF894,1000_QL80_.jpg	2024-09-30 01:19:28.083328	\N	2	Approved
358	Spy Kids: All the Time in the World	NaN	A retired spy is called back into Action, and to bond with her new step-children, she invites them along for the adventure to stop the evil Timekeeper from taking over the world.	2011	Prime Video	https://youtu.be/yUdkW8Nvpx8?si=-ong0RPOvUgjAAC7	https://m.media-amazon.com/images/I/810QZaXJdML._AC_UF894,1000_QL80_.jpg	2024-09-30 01:19:28.088823	\N	2	Approved
386	Home Alone 3	NaN	Alex Pruitt, an 8-year-old boy living in Chicago, must fend off international spies who seek a top-secret computer chip in his toy car.	1997	Disney+, Amazon Prime Video	https://youtu.be/PP--dDh4axI?si=OV6lgDXfIUOAD8Qk	https://upload.wikimedia.org/wikipedia/en/c/cc/Home_Alone_3_film.jpg	2024-09-30 01:19:28.236896	\N	2	Approved
359	Spy Kids: Armageddon	NaN	Tony (Connor Esterson) and Patty (Everly Carganilla) were quite good at playing online games, and they spend most of their time doing that, which is why their parents, Terrence Tango (Zachary Levi) and Nora Torrez (Gina Rodriguez), had some strict rules in place. Terrence has these rules as Terence and Nora are spies and their computers host the top-secret Armageddon code, and they are afraid that someone might use their kids' computers to hack into their network and steal the Armageddon code. Both spies are told by their boss Devlin that unknown assailants are trying to break into OSS servers to get to the Armageddon code.	2023	Netflix	https://youtu.be/TuiRw0v3bAw?si=cbsMjAM9vs090sIv	https://m.media-amazon.com/images/M/MV5BYzRkYjRmNDYtOGYyYS00ZWJjLWIzMTYtYmIyYTYwN2M1NTM4XkEyXkFqcGdeQXVyNDc5NDc2Nw@@._V1_.jpg	2024-09-30 01:19:28.098205	\N	2	Approved
360	Twilight	NaN	When Bella Swan moves to a small town in the Pacific Northwest, she falls in love with Edward Cullen, a mysterious classmate who reveals himself to be a 108-year-old vampire.	2008	Netflix	https://youtu.be/uxjNDE2fMjI?si=gHtuavf6Lpoo2uYH	https://www.imdb.com/title/tt1099212/mediaviewer/rm2266076160/?ref_=ext_shr_lnk	2024-09-30 01:19:28.106995	\N	2	Approved
361	The Twilight Saga : New Moon	NaN	After Edward leaves because of an incident involving Bella, Jacob Black becomes her best friend. But what Bella doesn't realize is that Jacob also has a secret that will change their lives suddenly.\n	2009	Netflix	https://youtu.be/q58iQSHhZGg?si=30wn0_omCoJbp7zM	https://www.imdb.com/title/tt1259571/mediaviewer/rm365071872/?ref_=ext_shr_lnk	2024-09-30 01:19:28.114199	\N	2	Approved
362	The Twilight Saga : Eclipse	NaN	As a string of mysterious killings grips Seattle, Bella, whose high school graduation is fast approaching, is forced to choose between her love for vampire Edward and her friendship with werewolf Jacob.	2010	Netflix	https://youtu.be/S2HIda5wSVU?si=m2pSeToxE55gSMqo	https://www.imdb.com/title/tt1325004/mediaviewer/rm2166430209/?ref_=ext_shr_lnk	2024-09-30 01:19:28.124404	\N	2	Approved
363	The Twilight Saga : Breaking Dawn - Part 1	NaN	The Quileutes close in on expecting parents Edward and Bella, whose unborn child poses a threat to the Wolf Pack and the towns people of Forks.	2011	Netflix	https://youtu.be/PQNLfo-SOR4?si=fnOflQyp2KHuqu0F	https://www.imdb.com/title/tt1324999/mediaviewer/rm582373889/?ref_=ext_shr_lnk	2024-09-30 01:19:28.133925	\N	2	Approved
464	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 02:57:01.931864	\N	1	Unapproved
364	The Twilight Saga : Breaking Dawn - Part 2	NaN	After the birth of Renesmee/Nessie, the Cullens gather other vampire clans in order to protect the child from a false allegation that puts the family in front of the Volturi.	2012	Netflix	https://youtu.be/5gRpIQfvNLA?si=WzlHOUNxqJrobFcp	https://www.imdb.com/title/tt1673434/mediaviewer/rm2619415041/?ref_=ext_shr_lnk	2024-09-30 01:19:28.141518	\N	2	Approved
370	The Mist	Stephen King's The Mist	The Draytons - David, Steff and their son Billy - live in a small Maine town. One night a ferocious storm hits the area, damaging their house. The storm is accompanied by a strange mist the following morning. David and Billy and their neighbour Brent Norton go into town and find themselves trapped in a grocery store with several other people. There they discover that the mist contains something frightening and intent on killing humans.	2007	Netflix	https://youtu.be/LhCKXJNGzN8?si=jqW65zv6OIZU9B_5	https://www.imdb.com/title/tt0884328/mediaviewer/rm1226609408/?ref_=tt_ov_i	2024-09-30 01:19:28.170859	\N	2	Approved
371	Interstellar	NaN	In the near future around the American Midwest, Cooper, an ex-science engineer and pilot, is tied to his farming land with his daughter Murph and son Tom. As devastating sandstorms ravage Earth's crops, the people of Earth realize their life here is coming to an end as food begins to run out. Eventually stumbling upon a N.A.S.A. base 6 hours from Cooper's home, he is asked to go on a daring mission with a few other scientists into a wormhole because of Cooper's scientific intellect and ability to pilot aircraft unlike the other crew members. In order to find a new home while Earth decays, Cooper must decide to either stay, or risk never seeing his children again in order to save the human race by finding another habitable planet.	2014	Netflix, Apple TV, Prime Video	https://youtu.be/zSWdZVtXT7E?si=zDZMp74oOG_pbGEG	https://www.imdb.com/title/tt0816692/mediaviewer/rm4043724800/?ref_=ext_shr_lnk	2024-09-30 01:19:28.175476	\N	2	Approved
372	Shutter Island	NaN	In 1954, up-and-coming U.S. marshal Teddy Daniels is assigned to investigate the disappearance of a patient from Boston's Shutter Island Ashecliffe Hospital. He's been pushing for an assignment on the island for personal reasons, but before long he thinks he's been brought there as part of a twisted plot by hospital doctors whose radical treatments range from unethical to illegal to downright sinister. Teddy's shrewd investigating skills soon provide a promising lead, but the hospital refuses him access to records he suspects would break the case wide open. As a hurricane cuts off communication with the mainland, more dangerous criminals "escape" in the confusion, and the puzzling, improbable clues multiply, Teddy begins to doubt everything - his memory, his partner, even his own sanity.	2010	Netflix, Google Play Film, Apple TV	https://youtu.be/5iaYLCiq5RM?si=w3gb4gYN6QMY6t3q	https://www.imdb.com/title/tt0482571/mediaviewer/rm4031813632/?ref_=tt_ov_i	2024-09-30 01:19:28.182848	\N	2	Approved
373	The Invisible Guest	Contratiempo	Adrián Doria, a wealthy businessman named Man of the Year due to his high-tech company and his trade agreements with the Asian market, meets Virginia Goodman, a veteran lawyer expert in witness preparation and judicial declaration, recommended by Adrián's lawyer Felix Leiva in order to create a credible defense. Arrested by the police in a mountain hotel room with the corpse of his lover at his side, photographer Laura Vidal, Adrián talks Virginia about the crime and his relationship with Laura, revealing that both suffered a car crash where a man called Daniel Garrido died, and how Laura manipulated Adrián to avoid the jail by Daniel's death. At the same time that Félix is looking for a clue that it could change the course of the events, Virginia and Adrián keep talking about the case but her, unconvinced of the Adrián's testimony, forces him to clear the dark points of his history, in a puzzle where the truth and the lie are easily exchangeable.	2016	Apple TV, Amazon Video	https://youtu.be/epCg2RbyF80?si=ZAwyNXnimlx1xufW	https://www.imdb.com/title/tt4857264/mediaviewer/rm2063468288/?ref_=tt_ov_i	2024-09-30 01:19:28.190822	\N	9	Approved
374	Inception	NaN	Dom Cobb is a skilled thief, the absolute best in the dangerous art of extrAction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive and cost him everything he has ever loved. Now Cobb is being offered a chance at redemption. One last job could give him his life back but only if he can accomplish the impossible, inception. Instead of the perfect heist, Cobb and his team of specialists have to pull off the reverse: their task is not to steal an idea, but to plant one. If they succeed, it could be the perfect crime. But no amount of careful planning or expertise can prepare the team for the dangerous enemy that seems to predict their every move. An enemy that only Cobb could have seen coming.	2010	Apple TV, Google Play Film	https://youtu.be/YoHD9XEInc0?si=pP0xiCiYPxwDFcIj	https://www.imdb.com/title/tt1375666/mediaviewer/rm3426651392/?ref_=ext_shr_lnk	2024-09-30 01:19:28.196644	\N	2	Approved
375	Pacific Rim	NaN	Long ago, legions of monstrous creatures called Kaiju arose from the sea, bringing with them all-consuming war. To fight the Kaiju, mankind developed giant robots called Jaegers, designed to be piloted by two humans locked together in a neural bridge. However, even the Jaegers are not enough to defeat the Kaiju, and humanity is on the verge of defeat. Mankind's last hope now lies with a washed-up ex-pilot, an untested trainee and an old, obsolete Jaeger.	2013	Netflix	https://youtu.be/5guMumPFBag?si=5lGCXjccMSJB37yy	https://m.media-amazon.com/images/M/MV5BMTY3MTI5NjQ4Nl5BMl5BanBnXkFtZTcwOTU1OTU0OQ@@._V1_.jpg	2024-09-30 01:19:28.20154	\N	2	Approved
376	Pacific Rim: Uprising	NaN	Jake Pentecost is a once-promising Jaeger pilot whose legendary father gave his life to secure humanity's victory against the monstrous Kaiju. Jake has since abandoned his training only to become caught up in a criminal underworld. But when an even more unstoppable threat is unleashed to tear through cities and bring the world to its knees, Jake is given one last chance by his estranged sister, Mako Mori, to live up to his father's legacy.	2018	Netflix	https://youtu.be/8BAhwgjMvnM?si=9OdTE_h4sGgCLVce	https://m.media-amazon.com/images/M/MV5BMjI3Nzg0MTM5NF5BMl5BanBnXkFtZTgwOTE2MTgwNTM@._V1_.jpg	2024-09-30 01:19:28.205463	\N	2	Approved
377	The Da Vinci Code	NaN	A murder in Paris' Louvre Museum and cryptic clues in some of Leonardo da Vinci's most famous paintings lead to the discovery of a religious mystery. For 2,000 years a secret society closely guards information that -- should it come to light -- could rock the very foundations of Christianity.	2006	Netflix	https://youtu.be/5sU9MT8829k?si=hlYLoPjj0NzxCTS3	https://upload.wikimedia.org/wikipedia/id/9/9b/The_da_vinci_code.jpg	2024-09-30 01:19:28.2088	\N	2	Approved
378	Inferno	NaN	Famous symbologist Robert Langdon (Tom Hanks) follows a trail of clues tied to Dante, the great medieval poet. When Langdon wakes up in an Italian hospital with amnesia, he teams up with Sienna Brooks (Felicity Jones), a doctor he hopes will help him recover his memories. Together, they race across Europe and against the clock to stop a madman (Ben Foster) from unleashing a virus that could wipe out half of the world's population.	2016	Netflix	https://youtu.be/RH2BD49sEZI?si=M0D6nbooVBubx2qI	https://m.media-amazon.com/images/M/MV5BMTUzNTE2NTkzMV5BMl5BanBnXkFtZTgwMDAzOTUyMDI@._V1_.jpg	2024-09-30 01:19:28.211231	\N	2	Approved
379	6 Underground	NaN	Six individuals from all around the globe, each the very best at what they do, have been chosen not only for their skill, but for a unique desire to delete their pasts to change the future.	2019	Netflix	https://youtu.be/YLE85olJjp8?si=RhBp3nlYhwKVT7p5	https://m.media-amazon.com/images/M/MV5BNzE2ZjQxNjEtNmI2ZS00ZmU0LTg4M2YtYzVhYmRiYWU0YzI1XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg	2024-09-30 01:19:28.215674	\N	2	Approved
380	10 Things I Hate About You	NaN	A high-school boy, Cameron, cannot date Bianca until her anti-social older sister, Kat, has a boyfriend. So, Cameron pays a mysterious boy, Patrick, to charm Kat.	1999	Netflix	https://youtu.be/uE7qjQlfoRs?si=A4BpkWgOnDRd4lY9	https://www.imdb.com/title/tt0147800/mediaviewer/rm953815296/?ref_=ext_shr_lnk	2024-09-30 01:19:28.218352	\N	2	Approved
381	Jalan yang Jauh, Jangan Lupa Pulang	NaN	Studying abroad in London, Aurora struggles with her relationships while away from her family in this sequel to "One Day We'll Talk About Today."	2023	Netflix	https://youtu.be/RX_F6AoQphc?si=ZIif06-9t4DiXvlv	https://www.imdb.com/title/tt23472308/mediaviewer/rm1705851905/?ref_=ext_shr_lnk	2024-09-30 01:19:28.220859	\N	3	Approved
382	Detective Conan: The Last Wizard of the Century	Meitantei Konan: Seikimatsu no Majutsushi	Conan takes on the notorious thief Kaitou Kid in a battle of wits involving a precious Russian Easter egg.	1999	Amazon Prime Video, Crunchyroll	https://youtu.be/YW_t7Y93Rnc?si=o0cLyqfNEmw20s9w	https://www.detectiveconanworld.com/wiki/images/thumb/6/6f/Movie3poster.jpg/275px-Movie3poster.jpg	2024-09-30 01:19:28.224202	\N	4	Approved
383	Detective Conan: Captured in Her Eyes	Meitantei Konan: Hitomi no Naka no Ansatsusha	After witnessing a murder, Ran loses her memory and Conan must protect her from being targeted by the killer.	2000	NaN	https://youtu.be/kZGz0zrzlQw?si=HzeIPA9FWfM5TN0M	https://www.detectiveconanworld.com/wiki/images/thumb/5/59/Movie4poster.jpg/275px-Movie4poster.jpg	2024-09-30 01:19:28.22766	\N	4	Approved
384	Home Alone	NaN	An 8-year-old boy is accidentally left home alone by his family during Christmas vacation and must defend his home against two inept burglars.	1990	Disney+, Amazon Prime Video	https://youtu.be/NOIgZYlYvyk?si=WRFYgNPzHPNAeNy0	https://upload.wikimedia.org/wikipedia/en/7/76/Home_alone_poster.jpg	2024-09-30 01:19:28.231416	\N	2	Approved
385	Home Alone 2: Lost in New York	NaN	Kevin accidentally boards a flight to New York City and gets separated from his family who are on their way to Miami. He then bumps into two of his old enemies, who plan to rob a toy store.	1992	Disney+, Amazon Prime Video, Hulu	https://youtu.be/5h9VDUNtoto?si=B0bqZ_SQxU9Exswt	https://upload.wikimedia.org/wikipedia/en/thumb/5/50/Home_Alone_2.jpg/220px-Home_Alone_2.jpg	2024-09-30 01:19:28.234102	\N	2	Approved
387	Despicable Me	NaN	In a happy suburban neighborhood surrounded by white picket fences with flowering rose bushes, sits a black house with a dead lawn. Unbeknownst to the neighbors, hidden beneath this house is a vast secret hideout. Surrounded by a small army of minions, we discover Gru (Steve Carell), planning the biggest heist in the history of the world. He is going to steal the moon. Gru delights in all things wicked. Armed with his arsenal of shrink rays, freeze rays, and battle-ready vehicles for land and air, he vanquishes all who stand in his way. Until the day he encounters the immense will of three little orphaned girls who look at him and see something that no one else has ever seen: a potential Dad. The world's greatest villain has just met his greatest challenge: three little girls named Margo (Miranda Cosgrove), Edith (Dana Gaier), and Agnes (Elsie Fisher).	2010	Netflix	https://youtu.be/zzCZ1W_CUoI?si=9zVVTZI8tBr7SxkQ	https://xl.movieposterdb.com/10_06/2010/1323594/xl_1323594_2b69270c.jpg?v=2024-08-05%2013:30:11	2024-09-30 01:19:28.239618	\N	2	Approved
388	Despicable Me 2	NaN	While Gru, the ex-supervillain is adjusting to family life and an attempted honest living in the jam business, a secret Arctic laboratory is stolen. The Anti-Villain League decides it needs an insider's help and recruits Gru in the investigation. Together with the eccentric AVL agent, Lucy Wilde, Gru concludes that his prime suspect is the presumed dead supervillain, El Macho, whose his teenage son is also making the moves on his eldest daughter, Margo. Seemingly blinded by his overprotectiveness of his children and his growing mutual attrAction to Lucy, Gru seems on the wrong track even as his minions are being quietly kidnapped en masse for some malevolent purpose.	2013	Netflix	https://youtu.be/TlbnGSMJQbQ?si=7fwRoOeiDCimK7Yq	https://xl.movieposterdb.com/15_02/2013/1690953/xl_1690953_473a6949.jpg?v=2024-05-16%2019:32:27	2024-09-30 01:19:28.242815	\N	2	Approved
453	hapus award	-	dasbda	1987	Amazon Prime Video, Google Play Movies	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	https://res.cloudinary.com/dtk2yqead/image/upload/v1731301493/yv8wxrtoicxm22eucqxu.jpg	2024-11-11 12:04:53.521927	\N	6	Unapproved
465	dsaa	daksbbdabdkjabsk	dsa	1987	Apple TV, Amazon Prime Video	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	\N	2024-11-25 03:00:47.055228	\N	33	Unapproved
389	Despicable Me 3	NaN	After he is fired from the Anti-Villain League for failing to take down the latest bad guy to threaten humanity, Gru (Steve Carell) finds himself in the midst of a major identity crisis. But when a mysterious stranger shows up to inform Gru that he has a long-lost twin brother - a brother who desperately wishes to follow in his twin's despicable footsteps - one former supervillain will rediscover just how good it feels to be bad.	2017	Netflix	https://youtu.be/6DBi41reeF0?si=M3-e-Dc0alqjbnZ6	https://xl.movieposterdb.com/20_06/2017/3469046/xl_3469046_30126921.jpg?v=2024-08-06%2019:50:11	2024-09-30 01:19:28.247077	\N	2	Approved
390	Despicable Me 4	NaN	Gru, Lucy, Margo, Edith, and Agnes welcome a new member to the family, Gru Jr., who is intent on tormenting his dad. Gru faces a new nemesis in Maxime Le Mal and his girlfriend Valentina, and the family is forced to go on the run.	2024	NaN	https://youtu.be/LtNYaH61dXY?si=iuxTe-GH10U-jktB	https://xl.movieposterdb.com/24_02/2024/7510222/xl_despicable-me-4-movie-poster_3c4ff16e.jpg?v=2024-08-19%2012:46:58	2024-09-30 01:19:28.250309	\N	2	Approved
391	Minions	NaN	Ever since the dawn of time, the Minions have lived to serve the most despicable of masters. From the T-Rex to Napoleon, the easily distracted tribe has helped the biggest and the baddest of villains. Now, join protective leader Kevin, teenage rebel Stuart, and lovable little Bob on a global road trip. They'll earn a shot to work for a new boss, the world's first female supervillain, and try to save all of Minionkind from annihilation.	2015	Netflix	https://youtu.be/eisKxhjBnZ0?si=6CXztBK0pwJoTU2V	https://xl.movieposterdb.com/15_02/2015/2293640/xl_2293640_644af6d9.jpg?v=2024-08-06%2001:11:59	2024-09-30 01:19:28.253294	\N	2	Approved
392	Pirates of the Caribbean: The Curse of the Black Pearl	NaN	This swash-buckling tale follows the quest of Captain Jack Sparrow, a savvy pirate, and Will Turner, a resourceful blacksmith, as they search for Elizabeth Swann. Elizabeth, the daughter of the governor and the love of Will's life, has been kidnapped by the feared Captain Barbossa. Little do they know, but the fierce and clever Barbossa has been cursed. He, along with his large crew, are under an ancient curse, doomed for eternity to neither live, nor die. That is, unless a blood sacrifice is made	2003	Hotstar	https://youtu.be/naQr0uTrH_s?si=v4LXSox8FcDrPK6y	https://a.ltrbxd.com/resized/film-poster/2/6/9/5/2695-pirates-of-the-caribbean-the-curse-of-the-black-pearl-0-1000-0-1500-crop.jpg?v=272b36c0d8	2024-09-30 01:19:28.256461	\N	2	Approved
393	Pirates of the Caribbean: Dead Man's Chest	NaN	Once again we're plunged into the world of sword fights and "savvy" pirates. Captain Jack Sparrow is reminded he owes a debt to Davy Jones, who captains the flying Dutchman, a ghostly ship, with a crew from hell. Facing the "locker" Jack must find the heart of Davy Jones but to save himself he must get the help of quick-witted Will Turner and Elizabeth Swann. If that's not complicated enough, Will and Elizabeth are sentenced to hang, unless Will can get Lord Cutler Beckett Jack's compass. Will is forced to join another crazy adventure with Jack.	2006	Hotstar	https://youtu.be/SNA-Ezahmok?si=Sh13Whh-ESV4Hukc	https://a.ltrbxd.com/resized/film-poster/5/1/9/8/9/51989-pirates-of-the-caribbean-dead-man-s-chest-0-1000-0-1500-crop.jpg?v=f9c46ae728	2024-09-30 01:19:28.258752	\N	2	Approved
394	Pirates of the Caribbean: At World's End	NaN	After losing Jack Sparrow to the locker of Davy Jones, the team of Will Turner, Elizabeth Swan and Captain Barbossa make their final alliances with the pirate world to take on the forces of Lord Cutler Beckett and his crew, including Davy Jones, who he now has control over. It's not going to be easy, as they must rescue Sparrow, convince all the pirate lords to join them and defeats Beckett, whilst each individual pirate has their own route which they wish to follow. 	2007	Hotstar	https://youtu.be/HKSZtp_OGHY?si=Yf_jU7WrbUvWgf2n	https://a.ltrbxd.com/resized/film-poster/5/1/7/7/3/51773-pirates-of-the-caribbean-at-world-s-end-0-1000-0-1500-crop.jpg?v=6d572cf726	2024-09-30 01:19:28.261412	\N	2	Approved
395	Pirates of the Caribbean: On Stranger Tides	NaN	Captain Jack Sparrow (Johnny Depp) crosses paths with a woman from his past, Angelica (Penélope Cruz), and he's not sure if it's love, or if she's a ruthless con artist who's using him to find the fabled Fountain of Youth. When she forces him aboard the Queen Anne's Revenge, the ship of the formidable pirate Blackbeard (Ian McShane), Jack finds himself on an unexpected adventure in which he doesn't know who to fear more: Blackbeard or the woman from his past.	2011	Hotstar	https://youtu.be/0BXCVe8Yww4?si=J1wWAZ4nziK5UT_U	https://a.ltrbxd.com/resized/film-poster/5/0/7/3/5/50735-pirates-of-the-caribbean-on-stranger-tides-0-1000-0-1500-crop.jpg?v=84b9897282	2024-09-30 01:19:28.264742	\N	2	Approved
396	Pirates of the Caribbean: Dead Men Tell No Tales	NaN	Captain Jack Sparrow (Johnny Depp) finds the winds of ill-fortune blowing even more strongly when deadly ghost pirates led by his old nemesis, the terrifying Captain Salazar (Javier Bardem), escape from the Devil's Triangle, determined to kill every pirate at sea...including him. Captain Jack's only hope of survival lies in seeking out the legendary Trident of Poseidon, a powerful artifact that bestows upon its possessor total control over the seas.	2017	Hotstar	https://youtu.be/Hgeu5rhoxxY?si=skbqzd6mgLHh4Fio	https://a.ltrbxd.com/resized/film-poster/1/2/3/0/6/6/123066-pirates-of-the-caribbean-dead-men-tell-no-tales-0-1000-0-1500-crop.jpg?v=67c23b3308	2024-09-30 01:19:28.273276	\N	2	Approved
397	Tokidoki Bosotto Russia-go de Dereru Tonari no Alya-san	Alya Sometimes Hides Her Feelings in Russian	Seirei Academy is a prestigious school attended by the very best students in Japan. Alisa Mikhailovna "Alya" Kujou, the half-Russian and half-Japanese treasurer of the school's student council, is known for her intelligence, stunning looks, and rigid personality. Contrasting her near-flawless persona, Alya's unmotivated classmate Masachika Kuze slacks off during lessons and seems to show no interest in her.\n\nInitially irritated, Alya gradually becomes more intrigued by Masachika and starts expressing her affection for him in Russian. However, she is oblivious to his secret—he understands the language fluently! Due to a childhood friend who was temporarily staying in Japan, Masachika has been studying Russian in hopes of reuniting with her.\n\nAs the two spend more time together, the playful and eccentric relationship between them quickly deepens. In the meantime, both must learn to navigate their new growing feelings for one another.	2024	Cruncyroll	https://www.youtube.com/watch?v=pBX6TtOlYow	https://cdn.myanimelist.net/images/anime/1825/142258.jpg	2024-09-30 01:19:28.281786	\N	4	Approved
399	Kiss x Sis	NaN	After Keita Suminoe's mother passed away, his father promptly remarried, introducing two step-sisters into Keita's life: twins Ako and Riko. But since their fateful first encounter, a surge of incestuous love for their younger brother overcame the girls, beginning a lifelong feud for his heart.\n\nNow at the end of his middle school career, Keita studies fervently to be able to attend Ako and Riko's high school. While doing so however, he must resolve his conflicting feelings for his siblings and either reject or succumb to his sisters' intimate advances. Fortunately—or perhaps unfortunately for Keita—his sisters aren't the only women lusting after him, and there's no telling when the allure of temptation will get the better of the boy as well.	2010	BiliBili	https://youtu.be/hemw2TBFtP8	https://cdn.myanimelist.net/images/anime/1660/121553.jpg	2024-09-30 01:19:28.290865	\N	4	Approved
400	Shingeki no Kyojin Season 3 Part 2	Attack on Titan Season 3 Part 2	Seeking to restore humanity's diminishing hope, the Survey Corps embark on a mission to retake Wall Maria, where the battle against the merciless "Titans" takes the stage once again.\n\nReturning to the tattered Shiganshina District that was once his home, Eren Yeager and the Corps find the town oddly unoccupied by Titans. Even after the outer gate is plugged, they strangely encounter no opposition. The mission progresses smoothly until Armin Arlert, highly suspicious of the enemy's absence, discovers distressing signs of a potential scheme against them.\n\nShingeki no Kyojin Season 3 Part 2 follows Eren as he vows to take back everything that was once his. Alongside him, the Survey Corps strive—through countless sacrifices—to carve a path towards victory and uncover the secrets locked away in the Yeager family's basement.	2019	Netflix	https://youtu.be/hKHepjfj5Tw	https://cdn.myanimelist.net/images/anime/1517/100633.jpg	2024-09-30 01:19:28.293893	\N	4	Approved
401	Annabelle	NaN	A couple begins to experience terrifying supernatural occurrences involving a vintage doll shortly after their home is invaded by satanic cultists.	2014	Netflix	https://www.youtube.com/watch?v=paFgQNPGlsg	https://posters.movieposterdb.com/14_09/2014/3322940/l_3322940_9caff983.jpg	2024-09-30 01:19:28.296732	\N	2	Approved
402	InuYasha	NaN	Kagome Higurashi's 15th birthday takes a sudden turn when she is forcefully pulled by a demon into the old well of her family's shrine. Brought to the past, when demons were a common sight in feudal Japan, Kagome finds herself persistently hunted by these vile creatures, all yearning for an item she unknowingly carries: the Shikon Jewel, a small sphere holding extraordinary power. Amid such a predicament, Kagome encounters a half-demon boy named Inuyasha who mistakes her for Kikyou, a shrine maiden he seems to resent. Because of her resemblance to Kikyou, Inuyasha takes a violent dislike to Kagome. However, after realizing the dire circumstances they are both in, he sets aside his hostility and lends her a hand. Unfortunately, during a fight for the Shikon Jewel, the miraculous object ends up shattered into pieces and scattered across the land. Fearing the disastrous consequences of this accident, Kagome and Inuyasha set out on a challenging quest to recover the shards before they fall into the wrong hands.	2000	Hulu	https://youtu.be/n5f47FVUlrs	https://cdn.myanimelist.net/images/anime/1589/95329.jpg	2024-09-30 01:19:28.298816	\N	4	Approved
403	InuYasha: Kanketsu-hen	InuYasha: The Final Act	Thwarted again by Naraku, Inuyasha, Kagome Higurashi, and their friends must continue their hunt for the few remaining Shikon Jewel shards, lest they fully form into a corrupted jewel at the hands of Naraku. But Naraku has plans of his own to acquire them, and will destroy anyone and anything standing in his way—even his own underlings. The persistent, unyielding danger posed by Naraku forces Sango and Miroku to decide what is most important to them—each other or their duty in battle. Meanwhile, Inuyasha must decide whether his heart lies with Kikyou or Kagome, before fate decides for him. Amid the race to find the shards, Inuyasha and his brother Sesshoumaru must also resolve their feud and cooperate for their final confrontation with Naraku, as it is a battle they must win in order to put a stop to his evil and cruelty once and for all.	2009	Hulu	https://youtu.be/BcAuqVLCsZE	https://cdn.myanimelist.net/images/anime/7/75570.jpg	2024-09-30 01:19:28.303512	\N	4	Approved
404	InuYasha Movie 1: Toki wo Koeru Omoi	InuYasha the Movie: Affections Touching Across Time	During their quest in the feudal era to recover the shards of the miraculous Shikon Jewel, Inuyasha, Kagome Higurashi, and their friends become the target of Menoumaru Hyouga—a demon awakened by one of the Shikon fragments, now in pursuit of Inuyasha's heirloom sword Tessaiga. Following a clash between the fathers of Inuyasha and Menoumaru, the weapon is the only means to restore Menoumaru his rightful family heritage. However, upon ambushing Inuyasha, Menoumaru discovers that Tessaiga's owner alone can wield it. Determined to achieve his objective regardless, he kidnaps Kagome to force Inuyasha to use his blade and release the sealed powers of the Hyouga clan. With their dependable companions' assistance, Inuyasha and Kagome oppose Menoumaru, unaware that his sinister intentions and alarming potential will endanger not only their world but also its distant future.	2001	Hoopla	https://youtu.be/hGhgHK4xKF4?si=ai_aipVgrpsYm_eZ	https://cdn.myanimelist.net/images/anime/1683/94370.jpg	2024-09-30 01:19:28.308131	\N	4	Approved
405	InuYasha Movie 2: Kagami no Naka no Mugenjou	InuYasha the Movie 2: The Castle Beyond the Looking Glass	Fortune smiles on Inuyasha and his allies when they finally defeat their nemesis Naraku, who has caused them unrelenting hardships. Overjoyed by the long-awaited victory, they all hurry to resume their former lives, unaware that danger still lurks around. Kanna and Kagura, two of Naraku's subordinates, make arrangements to set free a sealed demonic entity that claims to be Kaguya, the legendary Princess of the Heavens. Although preoccupied with their own endeavors, Inuyasha's group members reunite by a string of unusual coincidences involving Kanna and Kagura along with an inexplicable phenomenon of repeated full-moon nights. Upon realizing that Kaguya is behind the troubling events and that she holds a terrible power, they join forces once more to stop the disastrous fate she has planned for the world.	2002	Hoopla	https://youtu.be/BZiXEbZ9OQg	https://cdn.myanimelist.net/images/anime/1162/92219.jpg	2024-09-30 01:19:28.312773	\N	4	Approved
406	Hanyou no Yashahime: Sengoku Otogizoushi	Yashahime: Princess HalfNULLDemon	Half-demon twins Towa and Setsuna were always together, living happily in Feudal Japan. But their joyous days come to an end when a forest fire separates them and Towa is thrown through a portal to modern-day Japan. There, she is found by Souta Higurashi, who raises her as his daughter after Towa finds herself unable to return to her time. Ten years later, 14-year-old Towa is a relatively well-adjusted student, despite the fact that she often gets into fights. However, unexpected trouble arrives on her doorstep in the form of three visitors from Feudal Japan; Moroha, a bounty hunter; Setsuna, a demon slayer and Towa's long-lost twin sister; and Mistress Three-Eyes, a demon seeking a mystical object. Working together, the girls defeat their foe, but in the process, Towa discovers to her horror that Setsuna has no memory of her at all. Hanyou no Yashahime: Sengoku Otogizoushi follows the three girls as they endeavor to remedy Setsuna's memory loss, as well as discover the truth about their linked destinies.	2020	Youtube Ani One	https://youtu.be/O9c9AWheBdQ	https://cdn.myanimelist.net/images/anime/1005/114781.jpg	2024-09-30 01:19:28.31644	\N	4	Approved
466	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 03:02:12.426931	\N	1	Unapproved
410	Ong-Bak 1	 Muay Thai Warrior	"Ong Bak" follows a Muay Thai fighter named Ting who embarks on a quest to retrieve a stolen Buddha statue’s head from his village. Ting faces numerous obstacles and dangerous enemies in Bangkok.	2003	Amazon Prime Video, Netflix, \nyoutube	https://youtu.be/GQ5qcPsCP9A?feature=shared	https://image.tmdb.org/t/p/original/5iG1Ql7pQJd5gnG77BruaVYjLUq.jpg	2024-09-30 01:19:28.325848	\N	10	Approved
411	Ong-Bak 2	The Beginning 	This sequel serves as a prequel to the first film, following the story of a hero born as the son of a ruler who becomes a warrior seeking revenge. The film explores Ting’s journey to avenge his family and combat enemies who have destroyed his life.	2008	Amazon Prime Video, Netflix, \nyoutube	https://youtu.be/lml3uGdL0RM?feature=shared	https://image.tmdb.org/t/p/original/dAOREYQcl0qWwpN2SPp4yDUk1VG.jpg	2024-09-30 01:19:28.328482	\N	10	Approved
412	Ong-Bak 3	NaN	This film continues from "Ong Bak 2," with Ting now as a ruler striving to restore honor and peace to his kingdom after various conflicts. Ting must confront enemies and challenges to save his village.	2010	Amazon Prime Video, Netflix, \nyoutube	https://youtu.be/ELXzjJ1RiWA?feature=shared\n	https://es.web.img3.acsta.net/r_1280_720/medias/nmedia/18/82/35/79/19840043.jpg	2024-09-30 01:19:28.330039	\N	10	Approved
418	Pee Mak Phrakanong	NaN	After serving in the war, Mak invites his four soldier friends to his home. Upon arrival they witness the village terrified of a ghost. The four friends hear rumors that the ghost is Mak's wife Nak. Based on Thai folklore.	2013	Netflix	https://www.youtube.com/watch?v=B9xbj_UK1pc	https://xl.movieposterdb.com/13_04/2013/2776344/xl_2776344_a3e9a2f0.jpg?v=2024-09-06%2003:26:37	2024-09-30 01:19:28.345061	\N	10	Approved
419	Top Secret: Wai roon pun lan	NaN	Teen gamer turned businessman launches bestselling seaweed snack brand after family bankruptcy, earning 800 million baht yearly revenue by age 26.	2011	Netflix	https://www.youtube.com/watch?v=3jocFB7TZaQ	https://xl.movieposterdb.com/12_03/2011/2292955/xl_2292955_4e3dd665.jpg	2024-09-30 01:19:28.346365	\N	10	Approved
455	hapus genre		dsaad	1998	Amazon Prime Video	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	https://res.cloudinary.com/dtk2yqead/image/upload/v1731301587/ln2sb08gfxxcclvqemq5.jpg	2024-11-11 12:06:28.072476	\N	20	Unapproved
408	Start-Up	Sandbox	Start-Up is set in the fictional South Korean Silicon Valley called Sandbox and follows the story of young entrepreneurs striving to build their own companies, navigating challenges in business and relationships.	2020	Netflix	https://youtu.be/QLiAdBBAVxI	https://cinemags.org/?attachment_id=159160	2024-09-30 01:19:28.320959	\N	\N	Approved
409	Kill It	NaN	The story revolves around a skilled assassin who secretly works as a veterinarian and embarks on a journey to find his true identity while being pursued by a detective who is determined to catch him.	2019	Viki, Amazon Prime	https://www.youtube.com/watch?v=bHhxocusS7M	https://www.movieposterdb.com/kill-it-i9772814	2024-09-30 01:19:28.323011	\N	\N	Approved
414	Our Blues	Uridurui Beulluseu	Romance is sweet and bitter - and life riddled with ups and downs - in multiple stories about people who live and work on bustling Jeju Island.	2022	Netflix	https://youtu.be/WX1A-iyTAAM?feature=shared	https://www.imdb.com/title/tt19115260/mediaviewer/rm250027777/?ref_=tt_ov_i	2024-09-30 01:19:28.333864	\N	\N	Approved
415	Dream High	Deurimhai	Six students at Kirin Art High School work to achieve their dreams of becoming stars.Students at an arts and entertainment school mature as they face incidents and struggles	2011	Netflix	https://youtu.be/Dh8t8tdwAiA?feature=shared	https://www.imdb.com/title/tt1996607/mediaviewer/rm4144287489/?ref_=tt_ov_i	2024-09-30 01:19:28.336304	\N	\N	Approved
416	Pyramid Game	Piramideu Geim	Each person is graded through a popular vote against the backdrop of a girl's high school and if they receive an F grade, they become legitimate victims of school violence.	2024	Viu	https://youtu.be/BcYin0vw1yc?feature=shared	https://www.imdb.com/title/tt29311421/mediaviewer/rm1041136641/?ref_=tt_ov_i	2024-09-30 01:19:28.339134	\N	\N	Approved
417	All of Us Are Dead	Jigeum Uri Hakgyoneun	A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out or turn into one of the rabid infected.	2022	Netflix	https://youtu.be/IN5TD4VRcSM?feature=shared	https://www.imdb.com/title/tt14169960/mediaviewer/rm1351868929/?ref_=tt_ov_i	2024-09-30 01:19:28.342605	\N	\N	Approved
467	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 03:02:57.599398	\N	1	Unapproved
456	hapus actor	sd	dasd	2002	Netflix, Apple TV	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	https://res.cloudinary.com/dtk2yqead/image/upload/v1731301633/egfipkedgjdpa76b8nqk.png	2024-11-11 12:07:14.337527	\N	10	Unapproved
468	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 03:06:01.763522	\N	1	Unapproved
469	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 03:08:09.780579	\N	1	Unapproved
457	tes edit movie	undefined	aaaaadsadas tes 	1996	Google Play Movies, Amazon Prime Video	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	https://res.cloudinary.com/dtk2yqead/image/upload/v1731303300/nu7fdcknlpzyemmynvoy.jpg	2024-11-11 12:08:09.636071	\N	15	Unapproved
226	The Goblin	NaN	Former gangster Doo-hyun, known as "Goblin", served time for his boss' murder to protect Young-min. Out of prison, Young-min kidnaps Doo-hyun's daughter, forcing him to seek vengeance and reclaim his "Goblin" persona.	2021	Netflix 	https://youtu.be/vSQ-2incUEM?si=YkoqreKTEvOwRMHz	https://upload.wikimedia.org/wikipedia/id/6/69/Golbin_Poster.jpg	2024-09-30 01:19:27.560237	\N	\N	Approved
227	Itaewon Class	NaN	An ex-con opens a street bar in Itaewon, while also seeking revenge on the family who was responsible for his father's death.	2020	Netflix 	https://youtu.be/NNP8m3gaaFE?si=naxieCcmL1ZoCZjp	https://upload.wikimedia.org/wikipedia/id/f/f9/Itaewon_Class_poster.jpg	2024-09-30 01:19:27.562935	\N	\N	Approved
228	Vincenzo	NaN	During a visit to his motherland, a Korean-Italian Mafia lawyer gives an unrivaled conglomerate a taste of its own medicine with a side of justice.	2021	Netflix 	https://youtu.be/_J8tYxYB_YU?si=YnLEiQpH7CLVECMW	https://awsimages.detik.net.id/community/media/visual/2021/03/01/vincenzo-1.png	2024-09-30 01:19:27.566621	\N	\N	Approved
229	Descendants of the Sun	NaN	This Drama tells of the love story that develops between a surgeon and a special forces officer.	2016	Netflix 	https://youtu.be/XyzaMpAVm3s?si=C9-C3laIbJZ3tS6w	https://upload.wikimedia.org/wikipedia/id/6/6e/DescendantsoftheSun.jpg	2024-09-30 01:19:27.569287	\N	\N	Approved
225	Crash Landing on You	undefined	The absolute top secret love story of a chaebol heiress who made an emergency landing in North Korea because of a paragliding accident and a North Korean special officer who falls in love with her and who is hiding and protecting her.	2019	Netflix, Amazon Prime Video, Apple TV	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	https://res.cloudinary.com/dtk2yqead/image/upload/v1731277721/dhkn27jh9vcnajd6mbyp.jpg	2024-09-30 01:19:27.547864	\N	\N	Approved
458	dsad	undefined	aaaaaaaaaaabcsa	1995	Apple TV, Netflix, Google Play Movies	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	\N	2024-11-11 12:33:02.187069	\N	31	Approved
470	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 03:10:56.398597	\N	1	Unapproved
454	hapus country	acu	dasdasd	1992	Amazon Prime Video	https://youtu.be/GVQGWgeVc4k?si=52NMaAQYHKXEtxPT	https://res.cloudinary.com/dtk2yqead/image/upload/v1731301535/ogmb1kgl4bflasiyozsm.jpg	2024-11-11 12:05:35.844632	\N	\N	Unapproved
437	coba pake actor	acu	ini sinposis lucu	2024	netflix	https://youtu.be/OsIohljR4WY?si=e8GkLG4hROfc5YOP	https://res.cloudinary.com/dtk2yqead/image/upload/v1731243559/ewwj8z89kzsmcwsqfifc.png	2024-11-10 19:59:19.088963	\N	\N	Approved
471	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 03:12:08.974656	\N	1	Unapproved
472	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-25 03:15:46.008383	\N	1	Approved
438	avail sudah oke	undefined	sinposis avail	2012	Amazon Prime Video, Netflix, Apple TV, Crunchyroll	https://youtu.be/OsIohljR4WY?si=e8GkLG4hROfc5YOP	https://res.cloudinary.com/dtk2yqead/image/upload/v1731298149/rxnj0cwnfz9tze0jdddd.png	2024-11-10 22:21:32.257132	\N	\N	Unapproved
240	Twenty Five Twenty One	Seumuldaseot Seumulhana	In a time when dreams seem out of reach, a teen fencer pursues big ambitions and meets a hardworking young man who seeks to rebuild his life. At 22 and 18, they say each other's names for the first time, at 25 and 21, they fall in love.	2022	Netflix	https://youtu.be/n7F8o-SoK8s?feature=shared	https://www.imdb.com/title/tt17513352/mediaviewer/rm29353729/	2024-09-30 01:19:27.606488	\N	\N	Approved
244	The Moon	Deo mun	A man is left in space due to an unfortunate accident while another man on Earth struggles to bring him back safely.	2023	Vidio, Prime Video	https://youtu.be/gxMM6Ntv78A?feature=shared	https://www.imdb.com/title/tt27688034/mediaviewer/rm2719636225/	2024-09-30 01:19:27.621957	\N	\N	Approved
344	Exhuma	Pamyo	When a renowned shaman and her protégé are hired by a wealthy, enigmatic family, they begin investigating the cause of a disturbing supernatural illness that affects only the first-born children of each generation. With the help of a knowledgeable mortician and the country's most revered geomancer , they soon trace the affliction's origin to a long-hidden family grave located on sacred ground	2024	NaN	https://youtu.be/xQ2mH3Jp15E?si=gO7r1noaWlxtATCo	https://www.imdb.com/title/tt27802490/mediaviewer/rm4170924801/?ref_=ext_shr_lnk	2024-09-30 01:19:28.017088	\N	\N	Approved
365	Oh My Ghost	오 나의 귀신님 (Oh Naui Gwisinnim)	The story follows a shy assistant chef who gets possessed by a lustful virgin ghost. With her newfound confidence, she tries to seduce her boss, but things get complicated as they all get entangled in the ghost's unfinished business.	2015	Viu	https://youtu.be/dgVZdt1j8-M?si=BPMBlS3tf7U5C8Fi	https://thumbor.prod.vidiocdn.com/AcDmZjSup_7kgrDdRlExK4r-Jrw=/filters:quality(70)/vidio-media-production/uploads/image/source/4683/384411.jpg	2024-09-30 01:19:28.148667	\N	\N	Approved
366	Reply1988	응답하라 1988 (Eungdabhara 1988)	Set in the late 1980s, this Drama follows five childhood friends who live in the same neighborhood. It captures the warmth and hardships of their families, the joys of friendship, and the sweet moments of first love.	2015	Netflix	https://youtu.be/hDI4IpZoaG4?si=KgGRZyiRAZLM5J4y	https://upload.wikimedia.org/wikipedia/id/d/d8/TVN%27s_Reply_1988_%28%EC%9D%91%EB%8B%B5%ED%95%98%EB%9D%BC_1988%29_poster.jpg	2024-09-30 01:19:28.155048	\N	\N	Approved
367	My Liberation Notes	나의 해방일지 (Naui Haebangilji)	This series portrays the lives of three siblings who long to escape their mundane lives and find true liberation. They meet a mysterious stranger who changes their perspectives on life.	2022	Netflix	https://youtu.be/EwqFfHRPp8Q?si=gNlXZWBcVj-rF2hd	https://asianwiki.com/images/1/14/My_Liberation_Notes-p1.jpg	2024-09-30 01:19:28.16004	\N	\N	Approved
368	Mouse	마우스 (Mauseu)	A suspenseful thriller that explores the question of whether psychopaths are born or made. The story follows a rookie police officer who encounters a psychopathic killer that leads to a chase filled with mind games.	2021	Netflix	https://youtu.be/Q6Nki1_8RBU?si=Grd1A0ii_PNgJtjS	https://assets-a1.kompasiana.com/items/album/2021/06/29/mouse-03-60dae4471525104a40180012.jpg	2024-09-30 01:19:28.164022	\N	\N	Approved
369	Moving	무빙 (Mubing)	A supernatural Drama about a group of teenagers who inherit superpowers from their parents. They struggle to protect their secrets while trying to understand the origins of their abilities.	2023	Disney+	https://www.youtube.com/watch?v=UVYw3biOgyE	https://asianwiki.com/images/e/ec/Moving-MP1.jpeg	2024-09-30 01:19:28.167242	\N	\N	Approved
407	Record of Youth	The Moment of 18	The series follows the lives of three young adults as they navigate the challenges of pursuing their dreams in the competitive world of entertainment and fashion while dealing with love, friendship, and family.	2020	Netflix	https://youtu.be/tahWtPeNkM0	https://h7.alamy.com/comp/2DA5DMM/record-of-youth-aka-chungchungirok-poster-from-left-byeon-woo-seok-park-so-dam-park-bo-gum-season-1-premiered-in-the-us-sep-7-2020-photo-netflix-courtesy-everett-collection-2DA5DMM.jpg	2024-09-30 01:19:28.319219	\N	\N	Approved
439	last check	undefined	niidas	1985	Amazon Prime Video, Google Play Movies, Netflix, Apple TV, Crunchyroll	https://youtu.be/OsIohljR4WY?si=e8GkLG4hROfc5YOP	https://res.cloudinary.com/dtk2yqead/image/upload/v1731298329/adasbfmjcor7ax2d14me.png	2024-11-10 22:25:36.513325	\N	21	Unapproved
299	Real Steel	NaN	In a near future where robot boxing is a top sport, a struggling ex-boxer feels he's found a champion in a discarded robot.	2011	Netflix, Hotstar, Hulu	https://youtu.be/1VFd5FMbZ64?si=ItKqmKxKBM6r4Whv	Real Steel (2011) (imdb.com)	2024-09-30 01:19:27.865562	\N	2	Approved
475	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-29 15:15:29.760997	\N	1	Unapproved
476	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-29 15:16:44.836463	\N	1	Unapproved
477	Updated Movie Title	Updated Alt Title	This is an updated synopsis for the movie.	2023	Not Available	http://updated-trailer.url	\N	2024-11-29 15:17:21.427475	\N	2	Unapproved
345	Parasite	Gisaengchung	Greed and class discrimination threaten the newly-formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.	2019	NaN	https://youtu.be/5xH0HfJHsaY 	https://www.imdb.com/title/tt6751668/mediaviewer/rm3194916865/?ref_=tt_ov_i	2024-09-30 01:19:28.019275	\N	\N	Approved
478	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-29 15:51:40.470244	\N	1	Unapproved
479	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-29 15:55:48.308774	\N	1	Unapproved
480	Movie Title	Alternative Title	This is a movie synopsis	2024	Available	http://trailer.url	\N	2024-11-29 15:57:58.496197	\N	1	Unapproved
398	Godzilla x Kong: The New Empire	NaN	Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island's mysteries.	2024	Netflix	https://www.youtube.com/watch?v=lV1OOlGwExM	https://posters.movieposterdb.com/24_03/2024/14539740/s_godzilla-x-kong-the-new-empire-movie-poster_df4bd47b.jpg	2024-09-30 01:19:28.287355	\N	2	Approved
413	Miracle in Cell No.7	7beonbangNULLui Seonmul	A story about the love between a mentally-ill father and his lovingly adorable daughter.	2013	Netflix	https://youtu.be/h9MGZFy-gog?feature=shared	https://www.imdb.com/title/tt2659414/mediaviewer/rm317480448/?ref_=tt_ov_i	2024-09-30 01:19:28.331536	\N	\N	Approved
420	SuckSeed: Huay Khan Thep	NaN	As a young boy, Ped was a geeky kid who held a crush on classmate Ern. When Ern moved away with her family to Bangkok, Ped was crushed. Now in high school, Ped and Ern are reunited after she backs to her hometown and attends the same school. Ped's best friend Koong then hatches a plan to get the attention of Ern and other girls. They will form a rock band! The boys are in for a bigger surprise when they learn Ern is a talented guitarist and joins their band. A talent show competition looms ahead for the band, while Ped and Koong find themselves vying for the attention of Ern ....	2011	Netflix	https://www.youtube.com/watch?v=GEgbtJV1D7w	https://media-cache.cinematerial.com/p/500x/rumdotbn/suckseed-huay-khan-thep-thai-movie-poster.jpg?v=1576006547	2024-09-30 01:19:28.347806	\N	10	Approved
421	Seasons change: Phror arkad plian plang boi	NaN	The story takes place at the College of Music, Mahidol University over one year and covers the three seasons that Bangkok typically experiences - summer, winter and monsoon. It chronicles the life of a young high school student, Pom, and his impulsive decision to attend a music school, unknown to his parents, because of a girl he has secretly liked for three years, Dao. At the music school, he befriends Aom, who eventually becomes his best friend at the academy. As a talented rock drummer he aids a wise Japanese instructor, Jitaro in research. He also forms a rock band with two friends, Ched and Chat. However, in order to become closer to the talented violinist Dao, he joins the orchestra and is assigned by the feisty conductor, Rosie, to play timpani. Eventually, as time schedule collides, he is forced to choose between playing in a rock band or the orchestra, and is also forced to choose between his crush on Dao, or his best friend, Aom.	2006	Netflix	https://www.youtube.com/watch?v=ophEFZt9iiU	 https://xl.movieposterdb.com/12_02/2006/880477/xl_880477_1c18464f.jpg	2024-09-30 01:19:28.349575	\N	10	Approved
422	Rot fai faa... Maha na ter	NaN	An urban love story set in the center of Bangkok where 30-year-old Mei Li is struggling to find true love. When Mei Li accidentally meets a handsome BTS engineer whom she considers the right man, she plans to make her first move. Though too many obstacles keep popping up, Mei Li will never give up.	2009	Netflix	https://www.youtube.com/watch?v=ZSMUF8izOJM	https://xl.movieposterdb.com/11_04/2009/1621642/xl_1621642_8ef2bf4a.jpg	2024-09-30 01:19:28.351471	\N	10	Approved
\.


--
-- TOC entry 4947 (class 0 OID 24817)
-- Dependencies: 234
-- Data for Name: user_watchlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_watchlist (id, username, movie_id, added_at) FROM stdin;
2	sarah	226	2024-11-10 20:12:25.444367
4	sarah	225	2024-11-10 20:19:19.417494
5	sarah	232	2024-11-10 20:19:24.846216
6	sarah	229	2024-11-10 21:04:11.121412
7	sarah	234	2024-11-10 21:10:40.728788
9	sarah	236	2024-11-11 10:17:06.584824
10	sarah	270	2024-11-11 12:37:40.01696
11	sarah	227	2024-12-01 21:22:58.05216
\.


--
-- TOC entry 4934 (class 0 OID 16435)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (username, email, password, role_id, created_at, google_id, banned, reset_password_token, reset_password_expires) FROM stdin;
Sarah	nlupa@gmail.com	\N	Writer	2024-09-13 15:59:18.638801	101355154598023365860	t	d9277a985941b4a07e831d9739fac3fcd3257348db6dabb80b95b5f7de93f0b2	2024-11-11 10:11:27.977
john_doe	john_doe@example.com	hashed_password	Writer	2024-10-12 14:45:40.180231	\N	f	\N	\N
sarah	sarah@admindramaku.com	$2b$10$QoWlrKm2IP.y7oBYyNXI.uwiHbHLMNgNW6/QainBF3tEm5g6zrhp6	Admin	2024-09-13 15:59:18.638801	\N	f	\N	\N
sarahkedua	vikendikrichas@gmail.com	$2b$10$qpupSsFRs.x5aJKLgUyEt.cUD1tcsgabkEPsedtdugknUoWHiLcp2	Writer	2024-09-13 15:59:18.638801	\N	f	\N	\N
rezagg	vikendikrichas@gmail.com	$2b$10$qpupSsFRs.x5aJKLgUyEt.cUD1tcsgabkEPsedtdugknUoWHiLcp2	Admin	2024-09-13 15:59:18.638801	\N	f	\N	\N
dump acc	accdump59@gmail.com	\N	Writer	2024-09-13 15:59:18.638801	112407556472365846446	f	\N	\N
arnanda	sarah.ajjh69@gmail.com	$2b$10$2c41PPH/n3lSLisEgHx.EexqcHRHQypjHSYJ8dKwcPu1V0i8v5iiK	Writer	2024-09-13 15:59:18.638801	\N	t	\N	\N
admin	admin12345@admindramaku.com	contoh123	Writer	2024-10-13 12:51:25.558842	\N	f	\N	\N
hayucoba	sarah.ajjh69@gmail.com	$2b$10$l4d2JJHRqgczpordvNIioeOKMdRtpg4FWErfUGjrIyHbuJtLmfYyi	Writer	2024-09-13 15:59:18.638801	\N	f	\N	\N
3B_059_SARAH	sarah.tif422@polban.ac.id	\N	Writer	2024-09-13 15:59:18.638801	107608592105513353178	f	\N	\N
\.


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 229
-- Name: actors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actors_id_seq', 972, true);


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 228
-- Name: awards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.awards_id_seq', 205, true);


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 230
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 27, true);


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 231
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.countries_id_seq', 49, true);


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 232
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.genres_id_seq', 55, true);


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 217
-- Name: movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movies_id_seq', 480, true);


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 233
-- Name: user_watchlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_watchlist_id_seq', 11, true);


--
-- TOC entry 4773 (class 2606 OID 16464)
-- Name: actors actors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actors
    ADD CONSTRAINT actors_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 16457)
-- Name: awards awards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.awards
    ADD CONSTRAINT awards_pkey PRIMARY KEY (id);


--
-- TOC entry 4769 (class 2606 OID 24763)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4765 (class 2606 OID 16434)
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 16429)
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 16411)
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 24823)
-- Name: user_watchlist user_watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_watchlist
    ADD CONSTRAINT user_watchlist_pkey PRIMARY KEY (id);


--
-- TOC entry 4767 (class 2606 OID 16443)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- TOC entry 4778 (class 2606 OID 16569)
-- Name: actors actors_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actors
    ADD CONSTRAINT actors_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE SET NULL;


--
-- TOC entry 4776 (class 2606 OID 16559)
-- Name: comments comments_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id);


--
-- TOC entry 4777 (class 2606 OID 16564)
-- Name: comments comments_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_username_fkey FOREIGN KEY (username) REFERENCES public.users(username);


--
-- TOC entry 4783 (class 2606 OID 16534)
-- Name: movie_actor movie_actor_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_actor
    ADD CONSTRAINT movie_actor_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.actors(id);


--
-- TOC entry 4784 (class 2606 OID 16539)
-- Name: movie_actor movie_actor_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_actor
    ADD CONSTRAINT movie_actor_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id);


--
-- TOC entry 4781 (class 2606 OID 16524)
-- Name: movie_award movie_award_award_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_award
    ADD CONSTRAINT movie_award_award_id_fkey FOREIGN KEY (award_id) REFERENCES public.awards(id);


--
-- TOC entry 4782 (class 2606 OID 16529)
-- Name: movie_award movie_award_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_award
    ADD CONSTRAINT movie_award_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id);


--
-- TOC entry 4779 (class 2606 OID 16514)
-- Name: movie_genre movie_genre_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_genre
    ADD CONSTRAINT movie_genre_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id);


--
-- TOC entry 4780 (class 2606 OID 16519)
-- Name: movie_genre movie_genre_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_genre
    ADD CONSTRAINT movie_genre_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id);


-- Completed on 2024-12-02 12:57:20

--
-- PostgreSQL database dump complete
--

