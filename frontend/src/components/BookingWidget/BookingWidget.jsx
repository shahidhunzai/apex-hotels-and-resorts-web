import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingWidget.css';
import { fetchCms } from '../../services/cmsApi';

const BookingWidget = ({ onSearch }) => {
  const navigate = useNavigate();
  const defaultLocations = [
    { label: 'Islamabad', value: 'islamabad' },
    { label: 'Murree', value: 'murree' },
    { label: 'Naran Valley', value: 'naran-valley' },
    { label: 'Bata Kundi', value: 'bata-kundi' },
    { label: 'Lahore', value: 'lahore' },
  ];
  const [locations, setLocations] = useState(defaultLocations);

  const formatDate = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [selectedLocation, setSelectedLocation] = useState(defaultLocations[0]);
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(tomorrow));
  const [rooms, setRooms] = useState(1);

  // Controls to reveal individual inputs when label clicked
  const [showLocation, setShowLocation] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [showRooms, setShowRooms] = useState(false);

  // Fetch locations from CMS
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const cms = await fetchCms();
        if (cms?.destinations && Array.isArray(cms.destinations) && cms.destinations.length > 0) {
          const destinationOptions = cms.destinations
            .filter((d) => d?.name && d?.slug)
            .map((d) => ({ label: d.name, value: d.slug }));
          if (destinationOptions.length > 0) {
            setLocations(destinationOptions);
            setSelectedLocation(destinationOptions[0]);
          }
        }
      } catch (error) {
        console.warn('Failed to load destinations from CMS:', error);
        // Keep default locations on error
      }
    };

    loadLocations();
  }, []);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Ensure check-in is not in the past
    if (new Date(checkIn) < today) {
      setCheckIn(formatDate(today));
    }
    
    // Ensure check-out is after check-in
    if (new Date(checkOut) <= new Date(checkIn)) {
      const next = new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000);
      setCheckOut(formatDate(next));
    }
  }, [checkIn, checkOut]);

  const incrementRooms = () => setRooms((r) => Math.min(10, r + 1));
  const decrementRooms = () => setRooms((r) => Math.max(1, r - 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      location: selectedLocation.label,
      destination: selectedLocation.value,
      checkIn,
      checkOut,
      rooms,
    };
    if (onSearch) onSearch(payload);
    
    const params = new URLSearchParams();
    params.append('destination', selectedLocation.value);
    params.append('checkIn', checkIn);
    params.append('checkOut', checkOut);
    params.append('rooms', rooms);
    
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="booking-widget card">
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="booking-field card-field" onClick={() => setShowLocation(true)}>
          <label>Location</label>
          {!showLocation ? (
            <div className="card-value">{selectedLocation.label}</div>
          ) : (
            <select
              value={selectedLocation.value}
              onChange={(e) => {
                const nextLocation = locations.find((loc) => loc.value === e.target.value);
                if (nextLocation) setSelectedLocation(nextLocation);
              }}
              onBlur={() => setShowLocation(false)}
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="booking-field card-field" onClick={() => setShowDates(true)}>
          <label>Check In / Out</label>
          {!showDates ? (
            <div className="card-value">{checkIn} — {checkOut}</div>
          ) : (
            <div className="date-row">
              <input type="date" value={checkIn} min={formatDate(today)} onChange={(e) => setCheckIn(e.target.value)} />
              <span className="date-sep">—</span>
              <input type="date" value={checkOut} min={formatDate(new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000))} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          )}
        </div>

        <div className="booking-field card-field" onClick={() => setShowRooms(true)}>
          <label>No. Of Rooms</label>
          {!showRooms ? (
            <div className="card-value">{rooms} Room{rooms > 1 ? 's' : ''}</div>
          ) : (
            <div className="rooms-counter">
              <button type="button" className="rooms-btn" onClick={decrementRooms}>−</button>
              <div className="rooms-value">{rooms}</div>
              <button type="button" className="rooms-btn" onClick={incrementRooms}>+</button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <button type="submit" className="btn-check-availability">
            <span>CHECK AVAILABILITY</span>
            <span className="search-icon">🔍</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingWidget;
