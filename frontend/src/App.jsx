import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AccommodationFilters from './components/AccommodationFilters';
import AccommodationDisplay from './components/AccommodationDisplay';
import AccommodationDetails from './components/AccommodationDetails';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage        from './pages/LoginPage';
import SignupPage       from './pages/SignupPage';
import ProfilePage      from './pages/ProfilePage';
import AdminDashboard   from './pages/AdminDashboard';

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
 *   /             → HomePage             (public)
 *   /details/:id  → AccommodationDetails (public)
 *   /login        → LoginPage            (public, redirects if already logged in)
 *   /signup       → SignupPage           (public)
 *   /profile      → ProfilePage          (requires auth)
 *   /admin        → AdminDashboard       (requires admin role)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<HomePage />} />
      <Route path="/details/:id" element={<AccommodationDetails />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/signup"     element={<SignupPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
