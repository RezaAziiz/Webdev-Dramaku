import { FormEvent, useEffect, useRef, useState } from "react";
import {
  LuBookmark,
  LuClapperboard,
  LuCompass,
  LuFilm,
  LuHome,
  LuLibrary,
  LuLogOut,
  LuSearch,
  LuTv,
} from "react-icons/lu";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { USER_ROLES } from "../constants/auth";
import { normalizeMovie, type MediaItem } from "../adapters/mediaAdapter";
import { searchMovies } from "../services/movieService";

type AuthState = {
  isAuthenticated: boolean;
  username: string;
  role: string | null;
  logout: () => void;
};

const primaryLinks = [
  { label: "Home", to: "/", icon: LuHome },
  { label: "Movies", to: "/search?type=movie", icon: LuClapperboard },
  { label: "TV Shows", to: "/search?type=tv", icon: LuTv },
  { label: "Anime", to: "/search?type=anime", icon: LuFilm },
  { label: "Browse", to: "/search", icon: LuCompass },
];

const mobileLinks = [
  { label: "Home", to: "/", icon: LuHome },
  { label: "Movies", to: "/search?type=movie", icon: LuClapperboard },
  { label: "TV", to: "/search?type=tv", icon: LuTv },
  { label: "Anime", to: "/search?type=anime", icon: LuBookmark },
];

const getSuggestionTypeLabel = (suggestion: MediaItem) => {
  if (suggestion.genre.some((genre) => genre.toLowerCase() === "anime")) {
    return "Anime";
  }
  return suggestion.type?.toLowerCase() === "tv" ? "TV" : "Movie";
};

const isNavigationTargetActive = (to: string, isActive: boolean, location: {
  pathname: string;
  search: string;
  hash: string;
}) => {
  if (to.includes("#")) {
    const [pathname, hash] = to.split("#");
    return location.pathname === (pathname || "/") && location.hash === `#${hash}`;
  }
  if (to.includes("?")) {
    const [pathname, search] = to.split("?");
    const expected = new URLSearchParams(search);
    const current = new URLSearchParams(location.search);
    return (
      location.pathname === pathname &&
      [...expected].every(([key, value]) => current.get(key) === value)
    );
  }
  if (to === "/search") {
    return location.pathname === to && location.search === "";
  }
  return isActive;
};

const getSuggestionItems = (response: unknown): Record<string, unknown>[] => {
  if (!response || typeof response !== "object") return [];
  const record = response as Record<string, unknown>;
  const items = Array.isArray(response)
    ? response
    : record.results ?? record.items ?? record.suggestions ?? record.data;
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object"),
  );
};

const getSuggestionHref = (suggestion: MediaItem) => {
  if (suggestion.id === null) return null;
  const mediaType = suggestion.type?.trim().toLowerCase() ?? "";
  const isTv = ["tv", "series", "tv show", "show", "anime"].includes(mediaType) ||
    suggestion.genre.some((genre) => genre.toLowerCase() === "anime");
  return `/movies/${isTv ? "tv" : "movie"}/${encodeURIComponent(suggestion.id)}`;
};

export default function Navbar() {
  const { isAuthenticated, username, role, logout } = useAuth() as AuthState;
  const safeUsername = typeof username === "string" ? username : "";
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const suggestionsDismissedRef = useRef(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    suggestionsDismissedRef.current = true;
    setSuggestions([]);
    setActiveSuggestion(-1);
    setSearchTerm("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target as Node)
      ) {
        suggestionsDismissedRef.current = true;
        setSuggestions([]);
        setActiveSuggestion(-1);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setActiveSuggestion(-1);
      return undefined;
    }

    suggestionsDismissedRef.current = false;
    let current = true;
    const timeout = window.setTimeout(() => {
      searchMovies(query, { page: 1 })
        .then((response) => {
          if (!current || suggestionsDismissedRef.current) return;
          setSuggestions(
            getSuggestionItems(response)
              .map(normalizeMovie)
              .filter((item) => item.title)
              .slice(0, 6),
          );
        })
        .catch((error) => {
          if (current && !suggestionsDismissedRef.current) {
            console.error("Navbar search suggestions unavailable.", error);
            setSuggestions([]);
          }
        });
    }, 250);

    return () => {
      current = false;
      window.clearTimeout(timeout);
    };
  }, [searchTerm]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      chooseSuggestion(suggestions[activeSuggestion]);
      return;
    }
    const query = searchTerm.trim();
    if (query) {
      navigate(`/search?term=${encodeURIComponent(query)}`);
    } else {
      navigate("/search");
    }
    suggestionsDismissedRef.current = true;
    setSuggestions([]);
  };

  const chooseSuggestion = (suggestion: MediaItem) => {
    const href = getSuggestionHref(suggestion);
    if (!href) return;
    suggestionsDismissedRef.current = true;
    setSearchTerm(suggestion.title);
    setSuggestions([]);
    setActiveSuggestion(-1);
    navigate(href);
  };

  const libraryTo = isAuthenticated
    ? `/watchlist/${encodeURIComponent(safeUsername)}`
    : "/login";
  const desktopLinks = [
    ...primaryLinks,
    { label: "My Library", to: libraryTo, icon: LuLibrary },
  ];

  const profileInitial = safeUsername ? safeUsername.charAt(0).toUpperCase() : "A";

  const signOut = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const desktopNavigation = (
    <nav className="desktop-nav-links" aria-label="Primary navigation">
      {desktopLinks.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `desktop-nav-link${
              isNavigationTargetActive(to, isActive, location) ? " is-active" : ""
            }`
          }
        >
          <Icon aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <header
        className={`mobile-topbar${isScrolled ? " is-scrolled" : ""}`}
        aria-label="Site header"
      >
        <Link className="brand-mark" to="/" aria-label="Dramaku home">
          <span className="brand-icon" aria-hidden="true">
            <LuClapperboard />
          </span>
          <span>Dramaku</span>
        </Link>
        <div className="mobile-header-actions">
          <button
            className="icon-button mobile-search-button"
            type="button"
            aria-label="Open search"
            onClick={() => navigate("/search")}
          >
            <LuSearch aria-hidden="true" />
            <span>Search</span>
          </button>
          {isAuthenticated ? (
            <div className="profile-menu">
              <button
                className="profile-trigger"
                type="button"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                {profileInitial}
              </button>
              {profileOpen && (
                <div className="profile-popover">
                  <Link
                    to={libraryTo}
                    onClick={() => setProfileOpen(false)}
                  >
                    Your library
                  </Link>
                  {(role === USER_ROLES.ADMIN || role === USER_ROLES.WRITER) && (
                    <Link
                      to="/dramaInput"
                      onClick={() => setProfileOpen(false)}
                    >
                      Content management
                    </Link>
                  )}
                  <button type="button" onClick={signOut}>
                    <LuLogOut aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="account-link" to="/login">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <header
        className={`desktop-header${isScrolled ? " is-scrolled" : ""}`}
        aria-label="Site header"
      >
        <Link className="brand-mark" to="/" aria-label="Dramaku home">
          <span className="brand-icon" aria-hidden="true">
            <LuClapperboard />
          </span>
          <span>Dramaku</span>
        </Link>
        {desktopNavigation}
        <div className="desktop-header-actions">
          <form
            ref={searchFormRef}
            className="nav-search"
            role="search"
            onSubmit={submitSearch}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && suggestions.length) {
                event.preventDefault();
                setActiveSuggestion((index) =>
                  Math.min(index + 1, suggestions.length - 1),
                );
              } else if (event.key === "ArrowUp" && suggestions.length) {
                event.preventDefault();
                setActiveSuggestion((index) => Math.max(index - 1, 0));
              } else if (event.key === "Escape") {
                suggestionsDismissedRef.current = true;
                setSuggestions([]);
                setActiveSuggestion(-1);
              }
            }}
          >
            <input
              aria-label="Search movies and shows"
              placeholder="Search"
              value={searchTerm}
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded={searchTerm.trim().length >= 2 && suggestions.length > 0}
              aria-controls="nav-search-suggestions"
              aria-activedescendant={
                activeSuggestion >= 0
                  ? `nav-search-suggestion-${activeSuggestion}`
                  : undefined
              }
              onChange={(event) => {
                suggestionsDismissedRef.current = false;
                setSearchTerm(event.target.value);
                setActiveSuggestion(-1);
              }}
            />
            <button
              className="icon-button"
              type="submit"
              aria-label="Submit search"
            >
              <LuSearch aria-hidden="true" />
            </button>
            {searchTerm.trim().length >= 2 && suggestions.length > 0 && (
              <div className="nav-search-suggestions">
                <div
                  id="nav-search-suggestions"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id ?? `${suggestion.title}-${index}`}
                      id={`nav-search-suggestion-${index}`}
                      type="button"
                      role="option"
                      aria-selected={activeSuggestion === index}
                      className="nav-search-suggestion"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseSuggestion(suggestion)}
                    >
                      {suggestion.poster ? (
                        <img src={suggestion.poster} alt="" loading="lazy" />
                      ) : (
                        <span className="nav-search-suggestion-poster" aria-hidden="true" />
                      )}
                      <span className="nav-search-suggestion-copy">
                        <strong>{suggestion.title}</strong>
                        <small>
                          {[suggestion.year, suggestion.rating !== null
                            ? `★ ${Number(suggestion.rating).toFixed(1)}`
                            : ""]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      </span>
                      <span className="nav-search-suggestion-type">
                        {getSuggestionTypeLabel(suggestion)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
          {isAuthenticated ? (
            <div className="profile-menu">
              <button
                className="profile-trigger"
                type="button"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                {profileInitial}
              </button>
              {profileOpen && (
                <div className="profile-popover">
                  {role === USER_ROLES.ADMIN && (
                    <Link to="/dramaInput" onClick={() => setProfileOpen(false)}>
                      Content management
                    </Link>
                  )}
                  {role === USER_ROLES.WRITER && (
                    <Link to="/dramaInput" onClick={() => setProfileOpen(false)}>
                      Content editor
                    </Link>
                  )}
                  <button type="button" onClick={signOut}>
                    <LuLogOut aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="sign-in-button" to="/login">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <nav className="mobile-tabbar" aria-label="Main navigation">
        {mobileLinks.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `mobile-tab${
                isNavigationTargetActive(to, isActive, location) ? " is-active" : ""
              }`
            }
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink
          to={libraryTo}
          className={({ isActive }) =>
            `mobile-tab${isActive ? " is-active" : ""}`
          }
        >
          <LuLibrary aria-hidden="true" />
          <span>Library</span>
        </NavLink>
      </nav>

      {profileOpen && isAuthenticated && (
        <button
          className="profile-dismiss"
          type="button"
          aria-label="Close account menu"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}
