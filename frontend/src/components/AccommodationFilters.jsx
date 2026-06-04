import { useState } from 'react';

const AMENITIES_LIST = [
  'Wi-Fi',
  'Washing Machine',
  'Security (CCTV/Guard)',
  'Personal Washroom',
  'Kitchen',
  'Mess/Tiffin',
];

export default function AccommodationFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    distance: '',
    accomodation_type: '',
    gender_type: '',
    max_rent: '',
    amenities: [],
  });

  const handleRadioChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload — only include non-empty values
    const payload = {};
    if (filters.distance) payload.distance = filters.distance;
    if (filters.accomodation_type) payload.accomodation_type = filters.accomodation_type;
    if (filters.gender_type) payload.gender_type = filters.gender_type;
    if (filters.max_rent) payload.max_rent = filters.max_rent;
    if (filters.amenities.length > 0) payload.amenities = filters.amenities;

    try {
      const res = await fetch('/api/accommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onFilter(data);
    } catch (err) {
      console.error('Filter error:', err);
    }
  };

  const handleClear = async () => {
    setFilters({
      distance: '',
      accomodation_type: '',
      gender_type: '',
      max_rent: '',
      amenities: [],
    });

    try {
      const res = await fetch('/api/accommodations');
      const data = await res.json();
      onFilter(data);
    } catch (err) {
      console.error('Clear error:', err);
    }
  };

  return (
    <div className="desktop-thq-strategysection-elm">
      {/* Section Header */}
      <div className="desktop-thq-header-elm1">
        <div className="desktop-thq-title-elm1">
          <span className="desktop-thq-text-elm23 Heading1">
            <span className="desktop-thq-text-elm24">02</span>
            <span id="Filters">Filters</span>
          </span>
        </div>
      </div>

      {/* Filter Form */}
      <div className="filter-form-container">
        <form className="filter-form" onSubmit={handleSubmit}>
          <div className="filter-groups-row">
            {/* ─── Distance Filter ─── */}
            <div className="filter-group">
              <h3 className="filter-heading">Distance from College</h3>
              <div className="radio-group">
                {[
                  { value: '0.5', label: 'Within 0.5 km' },
                  { value: '1', label: 'Within 1 km' },
                  { value: '2', label: 'Within 2 km' },
                  { value: '3', label: 'More than 2 km' },
                ].map((opt) => (
                  <label className="radio-label" key={opt.value}>
                    <input
                      type="radio"
                      name="distance"
                      value={opt.value}
                      checked={filters.distance === opt.value}
                      onChange={handleRadioChange}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ─── Accommodation Type Filter ─── */}
            <div className="filter-group">
              <h3 className="filter-heading">Accommodation Type</h3>
              <div className="radio-group">
                {[
                  { value: 'Private Hostel', label: 'Hostel' },
                  { value: 'PG', label: 'PG' },
                  { value: 'Flat near PICT', label: 'Flat' },
                ].map((opt) => (
                  <label className="radio-label" key={opt.value}>
                    <input
                      type="radio"
                      name="accomodation_type"
                      value={opt.value}
                      checked={filters.accomodation_type === opt.value}
                      onChange={handleRadioChange}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ─── Gender Filter ─── */}
            <div className="filter-group">
              <h3 className="filter-heading">Gender</h3>
              <div className="radio-group">
                {[
                  { value: 'Boys only', label: 'Male' },
                  { value: 'Girls only', label: 'Female' },
                  { value: 'Co-Ed', label: 'Co-ed' },
                ].map((opt) => (
                  <label className="radio-label" key={opt.value}>
                    <input
                      type="radio"
                      name="gender_type"
                      value={opt.value}
                      checked={filters.gender_type === opt.value}
                      onChange={handleRadioChange}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ─── Monthly Rent Filter ─── */}
            <div className="filter-group">
              <h3 className="filter-heading">Monthly Rent Range</h3>
              <div className="rent-inputs">
                <input
                  type="number"
                  name="max_rent"
                  placeholder="Max rent (₹)"
                  className="rent-input"
                  value={filters.max_rent}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, max_rent: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* ─── Amenities Filter ─── */}
            <div className="filter-group">
              <h3 className="filter-heading">Amenities</h3>
              <div className="checkbox-group">
                {AMENITIES_LIST.map((amenity) => (
                  <label className="checkbox-label" key={amenity}>
                    <input
                      type="checkbox"
                      name="amenities"
                      value={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="filter-buttons">
            <button type="submit" className="btn-apply">
              Apply Filters
            </button>
            <button type="button" className="btn-reset" onClick={handleClear}>
              Clear All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
