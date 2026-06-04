import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AccommodationDetails() {
  const { id } = useParams();
  const [accommodation, setAccommodation] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/accommodations/${id}`);
        if (!res.ok) throw new Error('Accommodation not found');
        const data = await res.json();
        setAccommodation(data);
        setAmenities(
          data.available_amenities
            ? data.available_amenities.split(',').map((a) => a.trim())
            : []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', minHeight: '100vh' }}>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading accommodation details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', minHeight: '100vh' }}>
        <p style={{ fontSize: '1.2rem', color: '#c00' }}>Error: {error}</p>
        <Link to="/" style={{ color: 'var(--dl-color-theme-primary2)', marginTop: '1rem', display: 'inline-block' }}>
          ← Back to Homepage
        </Link>
      </div>
    );
  }

  if (!accommodation) return null;

  return (
    <div className="details-page-container">
      {/* ── Navigation Sidebar ── */}
      <nav className="navigation">
        <div className="logo-section">
          <h2 style={{ fontSize: '1.5rem', color: 'black', fontWeight: 800 }}>
            UnderKilometer
          </h2>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Back to Homepage
          </Link>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="details-main-content">
        {/* Header */}
        <div className="header-section">
          <h1 className="page-title">{accommodation.accommodation_name}</h1>
          <p className="accommodation-name">Details</p>
        </div>

        {/* Info Cards Grid */}
        <div className="info-container">
          {/* Property Information */}
          <div className="info-card" id="details">
            <h3 className="card-title">Property Information</h3>
            <ul className="info-list">
              <li className="info-item">
                <span className="info-label">accommodation:</span>
                <span>{accommodation.accomodation_type}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Room Type:</span>
                <span>{accommodation.room_type}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Gender Type:</span>
                <span>{accommodation.gender_type}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Curfew Timing:</span>
                <span>{accommodation.curfew}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Security Provided:</span>
                <span>{accommodation.security}</span>
              </li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="info-card" id="stats">
            <h3 className="card-title">Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{accommodation.distance} km</div>
                <div className="stat-label">Distance</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{accommodation.rating}</div>
                <div className="stat-label">Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{accommodation.recommendation}</div>
                <div className="stat-label">Recommended</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="info-card full-width" id="amenities">
            <h3 className="card-title">Available Amenities</h3>
            <div className="amenities-grid">
              {amenities.map((amenity, idx) => (
                <div className="amenity-item" key={idx}>
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
