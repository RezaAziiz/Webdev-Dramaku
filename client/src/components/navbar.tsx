import { FormEvent, useEffect, useState } from "react";
import {
  LuBookmark,
  LuClapperboard,
  LuCompass,
  LuHome,
  LuLibrary,
  LuLogOut,
  LuSearch,
  LuTv,
} from "react-icons/lu";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { USER_ROLES } from "../constants/auth";

type AuthState = {
  isAuthenticated: boolean;
  username: string;
  role: string | null;
  logout: () => void;
};

const primaryLinks = [
  { label: "Home", to: "/", icon: LuHome },
  { label: "Movies", to: "/filtered-movies", icon: LuClapperboard },
  { label: "Trending", to: "/#trending", icon: LuCompass },
  { label: "TV Shows", to: "/search?type=tv", icon: LuTv },
  { label: "Anime", to: "/search?type=anime", icon: LuBookmark },
  { label: "Browse", to: "/search", icon: LuCompass },
];

const mobileLinks = [
  { label: "Home", to: "/", icon: LuHome },
  { label: "Movies", to: "/filtered-movies", icon: LuClapperboard },
  { label: "TV", to: "/search?type=tv", icon: LuTv },
  { label: "Anime", to: "/search?type=anime", icon: LuBookmark },
];

export default function Navbar() {
  const { isAuthenticated, username, role, logout } = useAuth() as AuthState;
  const safeUsername = typeof username === "string" ? username : "";
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/search?term=${encodeURIComponent(query)}`);
    } else {
      navigate("/search");
    }
  };

  const libraryTo = isAuthenticated
    ? `/watchlist/${encodeURIComponent(safeUsername)}`
    : "/login";

  const profileInitial = safeUsername ? safeUsername.charAt(0).toUpperCase() : "A";

  const signOut = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const desktopNavigation = (
    <nav className="desktop-nav-links" aria-label="Primary navigation">
      {primaryLinks.map(({ label, to }) => (
        <NavLink
          key={label}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `desktop-nav-link${isActive ? " is-active" : ""}`
          }
        >
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
            className="icon-button"
            type="button"
            aria-label="Open search"
            onClick={() => navigate("/search")}
          >
            <LuSearch aria-hidden="true" />
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

      <header className="desktop-header" aria-label="Site header">
        <Link className="brand-mark" to="/" aria-label="Dramaku home">
          <span className="brand-icon" aria-hidden="true">
            <LuClapperboard />
          </span>
          <span>Dramaku</span>
        </Link>
        {desktopNavigation}
        <div className="desktop-header-actions">
          <form className="nav-search" role="search" onSubmit={submitSearch}>
            <input
              aria-label="Search movies and shows"
              placeholder="Search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button
              className="icon-button"
              type="submit"
              aria-label="Submit search"
            >
              <LuSearch aria-hidden="true" />
            </button>
          </form>
          <Link
            className="icon-button"
            to={libraryTo}
            aria-label={isAuthenticated ? "Open your library" : "Sign in"}
          >
            <LuLibrary aria-hidden="true" />
          </Link>
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
              `mobile-tab${isActive ? " is-active" : ""}`
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
