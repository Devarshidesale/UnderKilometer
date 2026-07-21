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
      <div className="ad-loading">
        <div className="ad-loading-spinner" />
        <p>Loading accommodation details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-error">
        <p>Error: {error}</p>
        <Link to="/" className="ad-back-link">← Back to Homepage</Link>
      </div>
    );
  }

  if (!accommodation) return null;

  /* ── helper: only render a row if the value exists ── */
  const Row = ({ label, value }) =>
    value != null && value !== '' ? (
      <div className="ad-info-row">
        <span className="ad-info-label">{label}</span>
        <span className="ad-info-value">{value}</span>
      </div>
    ) : null;

  return (
    <div className="ad-page">
      {/* ════════════════════════════════════════
          LEFT PANEL
      ════════════════════════════════════════ */}
      <aside className="ad-left">
        {/* Back link */}
        <Link to="/" className="ad-back-btn">
          <span className="ad-back-icon">←</span> Back
        </Link>

        {/* Title block */}
        <div className="ad-title-block">
          <span className="ad-category-tag">Accommodation</span>
          <h1 className="ad-title">{accommodation.accommodation_name}</h1>
          {accommodation.accomodation_type && (
            <p className="ad-subtitle">{accommodation.accomodation_type}</p>
          )}
        </div>

        {/* Map placeholder — ready for Google Maps API */}
        <div className="ad-map-block">
          <div className="ad-map-header">
            <svg className="ad-map-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Location</span>
          </div>
          {/* TODO: Replace this div with <GoogleMap> component when API key is ready */}
          <div className="ad-map-placeholder" id="google-map-container">
            <div className="ad-map-pin-anim">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p className="ad-map-msg">Google Maps</p>
            <p className="ad-map-sub">Location view coming soon</p>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          RIGHT PANEL — dark background
      ════════════════════════════════════════ */}
      <main className="ad-right">
        {/* ── Section: Property Info ── */}
        <section className="ad-section">
          <h2 className="ad-section-title">Property Information</h2>
          <div className="ad-info-grid">
            <Row label="Type"         value={accommodation.accomodation_type} />
            <Row label="Room Type"    value={accommodation.room_type} />
            <Row label="Gender Type"  value={accommodation.gender_type} />
            <Row label="Curfew"       value={accommodation.curfew} />
            <Row label="Security"     value={accommodation.security} />
          </div>
        </section>

        <div className="ad-divider" />

        {/* ── Section: Quick Stats ── */}
        <section className="ad-section">
          <h2 className="ad-section-title">Quick Stats</h2>
          <div className="ad-stats-row">
            {accommodation.distance != null && (
              <div className="ad-stat">
                <div className="ad-stat-value">{accommodation.distance} <small>km</small></div>
                <div className="ad-stat-label">Distance</div>
              </div>
            )}
            {accommodation.rating != null && accommodation.rating !== '' && (
              <div className="ad-stat">
                <div className="ad-stat-value">{accommodation.rating}</div>
                <div className="ad-stat-label">Rating</div>
              </div>
            )}
            {accommodation.overall_monthly_rent != null && accommodation.overall_monthly_rent !== '' && (
              <div className="ad-stat">
                <div className="ad-stat-value">₹{accommodation.overall_monthly_rent}</div>
                <div className="ad-stat-label">Monthly Rent</div>
              </div>
            )}
            {accommodation.recommendation != null && accommodation.recommendation !== '' && (
              <div className="ad-stat">
                <div className="ad-stat-value">{accommodation.recommendation}</div>
                <div className="ad-stat-label">Recommended</div>
              </div>
            )}
          </div>
        </section>

        {/* ── Section: Contact ── */}
        {accommodation.phone_number && (
          <>
            <div className="ad-divider" />
            <section className="ad-section">
              <h2 className="ad-section-title">Contact</h2>
              <div className="ad-info-grid">
                <Row label="Phone" value={accommodation.phone_number} />
              </div>
            </section>
          </>
        )}

        {/* ── Section: Amenities ── */}
        {amenities.length > 0 && (
          <>
            <div className="ad-divider" />
            <section className="ad-section">
              <h2 className="ad-section-title">Available Amenities</h2>
              <div className="ad-amenities">
                {amenities.map((amenity, idx) => (
                  <span className="ad-amenity-tag" key={idx}>{amenity}</span>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
