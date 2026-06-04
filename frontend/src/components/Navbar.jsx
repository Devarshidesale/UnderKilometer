import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav id="hero-navbar" className="hero-navbar">
      <div className="hero-navbar-container">
        <div className="hero-navbar-logo">
          <Link to="/">
            <span className="hero-navbar-brand">UnderKilometer</span>
          </Link>
        </div>
        <div className="hero-navbar-links">
          {isHome ? (
            <>
              <a href="#Filters" className="hero-navbar-link">Filters</a>
              <a href="#Accommodations" className="hero-navbar-link">Accommodations</a>
            </>
          ) : (
            <Link to="/" className="hero-navbar-link">Back to Home</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
