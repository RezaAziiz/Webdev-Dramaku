import { Link } from "react-router-dom";
import { LuClapperboard } from "react-icons/lu";

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-main">
      <Link className="brand-mark site-footer-brand" to="/" aria-label="Dramaku home">
        <span className="brand-icon" aria-hidden="true">
          <LuClapperboard />
        </span>
        <span>Dramaku</span>
      </Link>
      <p className="site-footer-note">
        Discover films and series from the catalog.
      </p>
    </div>
    <nav className="site-footer-links" aria-label="Footer navigation">
      <Link to="/">Home</Link>
      <Link to="/#added-title">Movies</Link>
      <Link to="/#browse-title">TV Shows</Link>
      <Link to="/#anime-title">Anime</Link>
      <Link to="/search">Discover</Link>
      <Link to="/login">Sign in</Link>
    </nav>
    <div className="site-footer-bottom">
      <p>
        This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </p>
      <span>© {new Date().getFullYear()} Dramaku</span>
    </div>
  </footer>
);

export default Footer;
