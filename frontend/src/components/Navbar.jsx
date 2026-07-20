import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const isHome     = location.pathname === '/';
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav id="hero-navbar" className="hero-navbar">
      <div className="hero-navbar-container">
        {/* Brand */}
        <div className="hero-navbar-logo">
          <Link to="/">
            <span className="hero-navbar-brand">UnderKilometer</span>
          </Link>
        </div>

        {/* Centre links (home only) */}
        <div className="hero-navbar-links">
          {isHome ? (
            <>
              <a href="#Filters"        className="hero-navbar-link">Filters</a>
              <a href="#Accommodations" className="hero-navbar-link">Accommodations</a>
            </>
          ) : (
            <Link to="/" className="hero-navbar-link">← Home</Link>
          )}
        </div>

        {/* Right: auth actions */}
        <div className="hero-navbar-auth">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hero-navbar-link navbar-admin-link">
                  ⚙ Admin
                </Link>
              )}
              <Link to="/profile" className="hero-navbar-avatar" title={`@${user?.username}`}>
                {user?.username?.[0]?.toUpperCase() || '?'}
              </Link>
              <button className="hero-navbar-logout" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="hero-navbar-link">Sign In</Link>
              <Link to="/signup" className="hero-navbar-cta">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
