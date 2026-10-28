import { Link } from "react-router-dom";
import logo from "../assets/Logo.png";
import { LuFilm, LuTv, LuCompass, LuHome, LuLibrary, LuLogIn } from "react-icons/lu";

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-main">
      <Link className="brand-mark site-footer-brand" to="/" aria-label="Lumo home">
        <img className="brand-logo" src={logo} alt="Lumo" />
      </Link>
      <p className="site-footer-note">
        Discover films and series from the catalog.
      </p>
    </div>
    <nav className="site-footer-links" aria-label="Footer navigation">
      <Link to="/"><LuHome /> Home</Link>
      <Link to="/search?type=movie"><LuFilm /> Movies</Link>
      <Link to="/search?type=tv"><LuTv /> TV Shows</Link>
      <Link to="/#anime-title"><LuFilm /> Anime</Link>
      <Link to="/search"><LuCompass /> Discover</Link>
      <Link to="/login"><LuLogIn /> Sign in</Link>
    </nav>
    <div className="site-footer-bottom">
      <p>
        This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </p>
      <span>© {new Date().getFullYear()} Lumo</span>
    </div>
  </footer>
);

export default Footer;
