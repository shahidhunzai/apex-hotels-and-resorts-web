import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import { fetchCms } from '../../services/cmsApi';
import { fetchRoomAvailability } from '../../services/cmsApi';
import './Listings.css';
import { getRoomPricing } from '../../utils/roomPricing';

const toSlug = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '-');

const normalizeBookingValue = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');
const normalizeResort = (name) => normalizeBookingValue(name).replace(/\s+resort\s*$/i, '').trim();
const normalizeRoom = (name) => normalizeBookingValue(name).replace(/\s+room\s*$/i, '').trim();
const getRoomKey = (roomTitle, resortName) => `${normalizeRoom(roomTitle)}::${normalizeResort(resortName)}`;
const hasResortMatch = (bookingResort, destinationResort) => {
  const a = normalizeResort(bookingResort);
  const b = normalizeResort(destinationResort);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
};

const cleanLines = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const Listings = () => {
  const [searchParams] = useSearchParams();
  const rawDestinationParam = searchParams.get('destination') || searchParams.get('city') || '';
  const [filters, setFilters] = useState({
    destination: rawDestinationParam || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    facility: '',
    sortBy: 'newest',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    availability: 'all' // 'all', 'available', 'booked'
  });
  const [cmsDestinations, setCmsDestinations] = useState([]);
  const [cmsPages, setCmsPages] = useState({ homePage: {}, listingsPage: {} });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(1);
  const ROOMS_PER_PAGE = 6;

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const [cms, availability] = await Promise.all([
          fetchCms(),
          fetchRoomAvailability()
        ]);
        if (!isMounted) return;
        setCmsDestinations(Array.isArray(cms?.destinations) ? cms.destinations : []);
        setCmsPages({ homePage: cms?.homePage || {}, listingsPage: cms?.listingsPage || {} });
        setBookings(availability?.unavailableRooms || []);
        console.log('Unavailable rooms from API:', availability?.unavailableRooms);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.message || 'Failed to load listings.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadListings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Date validation effect
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Ensure check-in is not in the past
    if (filters.checkIn && filters.checkIn < today) {
      setFilters(prev => ({ ...prev, checkIn: today }));
    }
    
    // Ensure check-out is after check-in
    if (filters.checkIn && filters.checkOut && filters.checkOut <= filters.checkIn) {
      const nextDay = new Date(filters.checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setFilters(prev => ({ ...prev, checkOut: nextDay.toISOString().split('T')[0] }));
    }
    
    // Ensure check-out is not in the past
    if (filters.checkOut && filters.checkOut < today) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFilters(prev => ({ ...prev, checkOut: tomorrow.toISOString().split('T')[0] }));
    }
  }, [filters.checkIn, filters.checkOut]);

  const resolveRooms = (destination) => {
    if (Array.isArray(destination?.destinationRooms) && destination.destinationRooms.length > 0) {
      return destination.destinationRooms;
    }

    const fallbackTabs = destination?.points?.[0]?.tabs;
    if (Array.isArray(fallbackTabs?.rooms) && fallbackTabs.rooms.length > 0) {
      return fallbackTabs.rooms;
    }

    return [];
  };

  const allProperties = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    return cmsDestinations.flatMap((destination) => {
      const destinationName = destination?.name || 'Unknown Destination';
      const destinationSlug = destination?.slug || toSlug(destinationName);
      const rooms = resolveRooms(destination);

      return rooms.map((room, index) => {
        const amenities = Array.isArray(room?.amenities)
          ? room.amenities.map((a) => String(a?.label || '').trim()).filter(Boolean)
          : [];
        const roomImages = Array.isArray(room?.images) ? room.images.filter(Boolean) : [];
        const image = roomImages[0] || destination?.cardImage || destination?.heroSlides?.[0] || '';
        const quantity = Number.parseInt(room?.quantity, 10);
        const pricing = getRoomPricing(room);

        const roomKey = getRoomKey(room?.title, destinationName);
        const hasActiveBooking = bookings.some((booking) => {
          if (normalizeRoom(booking.roomName) !== normalizeRoom(room?.title)) return false;
          if (!hasResortMatch(booking.resortName, destinationName)) return false;
          if (!booking.dateFrom || !booking.dateTo) return false;
          const bookingTo = new Date(booking.dateTo);
          if (Number.isNaN(bookingTo.getTime())) return false;
          return bookingTo >= new Date(today);
        });

        console.log('Room:', room?.title, 'Destination:', destinationName, 'Room key:', roomKey, 'Has active booking:', hasActiveBooking);

        return {
          id: `${destinationSlug}-${index}`,
          roomTitle: room?.title || `${destinationName} Hotel Room`,
          roomKey,
          title: room?.title || `${destinationName} Hotel Room`,
          location: destinationName,
          price: pricing.formattedDiscountedPrice,
          originalPrice: pricing.formattedBasePrice,
          priceValue: pricing.discountedPrice,
          hasDiscount: pricing.hasDiscount,
          discountPercent: pricing.discountPercent,
          discountNote: pricing.discountNote,
          type: 'Hotel',
          beds: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          persons: Number.parseInt(room?.persons, 10) || 1,
          baths: 1,
          area: String(room?.area || '').trim() || amenities.slice(0, 2).join(' • ') || 'Hotel Room',
          image,
          destination: destinationSlug,
          facilities: amenities,
          availability: hasActiveBooking ? 'booked' : 'available'
        };
      });
    });
  }, [cmsDestinations, bookings]);

  const destinationOptions = useMemo(() => {
    const map = new Map();
    allProperties.forEach((property) => {
      if (!property.destination) return;
      if (!map.has(property.destination)) {
        map.set(property.destination, property.location);
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allProperties]);

  useEffect(() => {
    if (!rawDestinationParam || destinationOptions.length === 0) return;

    const normalizedParam = rawDestinationParam.trim().toLowerCase();
    const matched = destinationOptions.find((option) =>
      option.value === normalizedParam ||
      option.label.toLowerCase() === normalizedParam ||
      toSlug(option.label) === normalizedParam
    );

    if (matched && filters.destination !== matched.value) {
      setFilters((prev) => ({ ...prev, destination: matched.value }));
    }
  }, [rawDestinationParam, destinationOptions, filters.destination]);

  const facilityOptions = useMemo(() => {
    const set = new Set();
    allProperties.forEach((property) => {
      (property.facilities || []).forEach((facility) => {
        if (facility) set.add(facility);
      });
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allProperties]);

  const filteredProperties = useMemo(() => {
    const minPrice = Number(filters.minPrice || 0);
    const maxPrice = Number(filters.maxPrice || 0);

    let results = [...allProperties];

    if (filters.destination) {
      results = results.filter((property) => property.destination === filters.destination);
    }

    if (filters.facility) {
      const selectedFacility = filters.facility.toLowerCase();
      results = results.filter((property) =>
        (property.facilities || []).some((facility) => facility.toLowerCase() === selectedFacility)
      );
    }

    if (minPrice > 0) {
      results = results.filter((property) => property.priceValue !== null && property.priceValue >= minPrice);
    }

    if (maxPrice > 0) {
      results = results.filter((property) => property.priceValue !== null && property.priceValue <= maxPrice);
    }

    // Filter by availability status
    if (filters.availability !== 'all') {
      results = results.filter((property) => property.availability === filters.availability);
    }

    // Filter by date availability if dates are selected
    if (filters.checkIn && filters.checkOut) {
      results = results.filter((property) => {
        if (!property.roomKey) return true;

        const checkIn = new Date(filters.checkIn);
        const checkOut = new Date(filters.checkOut);

        const isBookedForDates = bookings.some((booking) => {
          if (normalizeRoom(booking.roomName) !== normalizeRoom(property.title)) return false;
          if (!hasResortMatch(booking.resortName, property.location)) return false;
          if (!booking.dateFrom || !booking.dateTo) return false;

          const bookingFrom = new Date(booking.dateFrom);
          const bookingTo = new Date(booking.dateTo);
          return checkIn < bookingTo && checkOut > bookingFrom;
        });

        return !isBookedForDates;
      });
    }

    if (filters.sortBy === 'price-low') {
      results.sort((a, b) => (a.priceValue ?? Number.MAX_SAFE_INTEGER) - (b.priceValue ?? Number.MAX_SAFE_INTEGER));
    } else if (filters.sortBy === 'price-high') {
      results.sort((a, b) => (b.priceValue ?? 0) - (a.priceValue ?? 0));
    }

    return results;
  }, [allProperties, filters, cmsDestinations, bookings]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ROOMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProperties = useMemo(() => {
    const start = (safePage - 1) * ROOMS_PER_PAGE;
    return filteredProperties.slice(start, start + ROOMS_PER_PAGE);
  }, [filteredProperties, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      destination: '',
      minPrice: '',
      maxPrice: '',
      facility: '',
      sortBy: 'newest',
      checkIn: '',
      checkOut: '',
      availability: 'all'
    });
  };

  const heroSlides = cleanLines(cmsPages.listingsPage?.heroSlides || []).length
    ? cleanLines(cmsPages.listingsPage.heroSlides)
    : cleanLines(cmsPages.homePage?.hero?.slides || []);
  const heroTitle = cmsPages.listingsPage?.heroTitle || 'FIND YOUR\nPERFECT HOTEL';
  const heroPhone = cmsPages.homePage?.hero?.phone || undefined;
  const heroWhatsapp = cmsPages.homePage?.hero?.whatsapp || undefined;

  return (
    <div className="listings-page">
      <Hero
        slides={heroSlides}
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        title={heroTitle}
        phone={heroPhone}
        whatsapp={heroWhatsapp}
      />
      <div className="container">
        <div className="listings-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-filters">Clear All</button>
            </div>

            <div className="filter-group">
              <label>Destination Name</label>
              <select name="destination" value={filters.destination} onChange={handleFilterChange}>
                <option value="">All Destinations</option>
                {destinationOptions.map((destination) => (
                  <option key={destination.value} value={destination.value}>{destination.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Check-in Date</label>
              <input
                type="date"
                name="checkIn"
                value={filters.checkIn}
                onChange={handleFilterChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="filter-group">
              <label>Check-out Date</label>
              <input
                type="date"
                name="checkOut"
                value={filters.checkOut}
                onChange={handleFilterChange}
                min={filters.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="filter-group">
              <label>Availability Status</label>
              <select name="availability" value={filters.availability} onChange={handleFilterChange}>
                <option value="all">All Rooms</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Facility</label>
              <select name="facility" value={filters.facility} onChange={handleFilterChange}>
                <option value="">All Facilities</option>
                {facilityOptions.map((facility) => (
                  <option key={facility} value={facility}>{facility}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range (PKR)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
                <span>-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </aside>

          {/* Properties Grid */}
          <div className="listings-content">
            {loading ? (
              <div className="no-results">
                <h3>Loading hotels...</h3>
              </div>
            ) : loadError ? (
              <div className="no-results">
                <h3>Unable to load hotels</h3>
                <p>{loadError}</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <>
                <div className="properties-grid">
                  {pagedProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="listings-pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={safePage <= 1}
                    >
                      Prev
                    </button>
                    <span className="pagination-info">Page {safePage} of {totalPages}</span>
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={safePage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <h3>No hotels found</h3>
                <p>Try adjusting destination, facility, or price range filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listings;
