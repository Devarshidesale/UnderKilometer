import { Link } from 'react-router-dom';

export default function AccommodationDisplay({ accommodations }) {
  return (
    <>
      {/* ── Section Header ── */}
      <div className="desktop-thq-colorsection-elm">
        <div className="desktop-thq-header-elm2">
          <div className="desktop-thq-title-elm2">
            <span className="desktop-thq-text-elm26 Heading1">
              <span className="desktop-thq-text-elm24">03</span>
              <span id="Accommodations">Accommodations</span>
            </span>
            <div className="desktop-thq-number-elm" />
          </div>
        </div>
      </div>

      {/* ── Card Grid ── */}
      <div className="accomodation-card-section">
        {accommodations.map((item) => (
          <div className="card" key={item.id}>
            <p className="card-title">{item.accommodation_name}</p>
            <div className="small-desc">
              <strong>₹ {item.overall_monthly_rent}</strong>
              <p>Distance: {item.distance}km</p>
              <span>student contact: {item.phone_number}</span>
            </div>
            <div className="go-corner">
              <Link to={`/details/${item.id}`} className="card-button">
                <div className="go-arrow">→</div>
              </Link>
            </div>
          </div>
        ))}

        {accommodations.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
            No accommodations found. Try adjusting your filters.
          </p>
        )}
      </div>
    </>
  );
}
