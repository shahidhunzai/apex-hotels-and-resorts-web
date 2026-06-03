import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './StickyBooking.css';
import { fetchCms } from '../../services/cmsApi';

const StickyBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultLocations = useMemo(() => ([
    { label: 'Islamabad', value: 'islamabad' },
    { label: 'Murree', value: 'murree' },
    { label: 'Naran Valley', value: 'naran-valley' },
    { label: 'Bata Kundi', value: 'bata-kundi' },
    { label: 'Lahore', value: 'lahore' },
  ]), []);

  const formatDate = (date) => date.toISOString().slice(0, 10);
  const today = useMemo(() => new Date(), []);
  const initialCheckIn = formatDate(today);
  const initialCheckOut = formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));

  const [locations, setLocations] = useState(defaultLocations);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocations[0]);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [rooms, setRooms] = useState(1);

  const routeDestinationSlug = useMemo(() => {
    const normalizedPath = String(location.pathname || '').toLowerCase();
    const destinationMatch = normalizedPath.match(/^\/destinations\/([^/]+)/);
    if (destinationMatch) return destinationMatch[1];

    const propertyMatch = normalizedPath.match(/^\/property\/([^/]+)/);
    if (propertyMatch) return propertyMatch[1].replace(/-\d+$/, '');

    return '';
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const loadLocations = async () => {
      try {
        const cms = await fetchCms();
        const destinationOptions = Array.isArray(cms?.destinations)
          ? cms.destinations
            .filter((item) => item?.name && item?.slug)
            .map((item) => ({ label: item.name, value: item.slug }))
          : [];

        if (!isMounted || destinationOptions.length === 0) return;

        setLocations(destinationOptions);
        const matchedLocation = destinationOptions.find((item) => item.value === routeDestinationSlug);
        setSelectedLocation(matchedLocation || destinationOptions[0]);
      } catch (_error) {
        if (!isMounted) return;
        setLocations(defaultLocations);
        const matchedLocation = defaultLocations.find((item) => item.value === routeDestinationSlug);
        setSelectedLocation(matchedLocation || defaultLocations[0]);
      }
    };

    loadLocations();

    return () => {
      isMounted = false;
    };
  }, [defaultLocations, routeDestinationSlug]);

  useEffect(() => {
    const currentDay = new Date();
    currentDay.setHours(0, 0, 0, 0);

    const parsedCheckIn = new Date(checkIn);
    const parsedCheckOut = new Date(checkOut);

    if (parsedCheckIn < currentDay) {
      setCheckIn(formatDate(currentDay));
      return;
    }

    if (parsedCheckOut <= parsedCheckIn) {
      const nextDay = new Date(parsedCheckIn.getTime() + 24 * 60 * 60 * 1000);
      setCheckOut(formatDate(nextDay));
    }
  }, [checkIn, checkOut]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    params.append('destination', selectedLocation.value);
    params.append('checkIn', checkIn);
    params.append('checkOut', checkOut);
    params.append('rooms', String(rooms));

    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="sticky-booking-bar">
      <form className="sticky-booking-content" onSubmit={handleSubmit}>
        <div className="sticky-booking-field">
          <label htmlFor="sticky-booking-location">Location</label>
          <select
            id="sticky-booking-location"
            className="sticky-booking-input"
            value={selectedLocation.value}
            onChange={(e) => {
              const nextLocation = locations.find((item) => item.value === e.target.value);
              if (nextLocation) setSelectedLocation(nextLocation);
            }}
          >
            {locations.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <div className="sticky-booking-field sticky-booking-dates">
          <label>Check In / Out</label>
          <div className="sticky-booking-date-row">
            <input
              className="sticky-booking-input"
              type="date"
              value={checkIn}
              min={formatDate(new Date())}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <input
              className="sticky-booking-input"
              type="date"
              value={checkOut}
              min={formatDate(new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000))}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>
        <div className="sticky-booking-field sticky-booking-rooms">
          <label htmlFor="sticky-booking-rooms">No. Of Rooms</label>
          <input
            id="sticky-booking-rooms"
            className="sticky-booking-input"
            type="number"
            min="1"
            max="10"
            value={rooms}
            onChange={(e) => setRooms(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
          />
        </div>
        <button type="submit" className="sticky-book-btn">BOOK NOW</button>
      </form>
    </div>
  );
};

export default StickyBooking;
