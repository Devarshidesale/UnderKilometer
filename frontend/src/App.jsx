import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AccommodationFilters from './components/AccommodationFilters';
import AccommodationDisplay from './components/AccommodationDisplay';
import AccommodationDetails from './components/AccommodationDetails';

/**
 * Home page — composes Navbar + Hero + Filters + Accommodation grid.
 * Owns the accommodations state so filters can update it.
 */
function HomePage() {
  const [accommodations, setAccommodations] = useState([]);

  useEffect(() => {
    fetch('/api/accommodations')
      .then((res) => res.json())
      .then((data) => setAccommodations(data))
      .catch((err) => console.error('Failed to load accommodations:', err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="desktop-container1">
        <div className="desktop-thq-desktop-elm">
          <div className="desktop-thq-main-elm1">
            {/* Hero + About */}
            <HeroSection />

            {/* Filters + Cards */}
            <div className="desktop-thq-main-elm2">
              <AccommodationFilters onFilter={setAccommodations} />
              <AccommodationDisplay accommodations={accommodations} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * App root — defines client-side routes.
 *   /             → HomePage
 *   /details/:id  → AccommodationDetails (has its own sidebar nav)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/details/:id" element={<AccommodationDetails />} />
    </Routes>
  );
}
