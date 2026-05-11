import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCms, fetchRoomAvailability } from '../../services/cmsApi';
import BookingFormModal from '../../components/BookingFormModal/BookingFormModal';
import BannerSection from '../../components/BannerSection/BannerSection';
import { getRoomPricing } from '../../utils/roomPricing';
import './PropertyDetail.css';

const toSlug = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '-');

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

const getRoomImages = (room) => {
  const imageList = Array.isArray(room?.images) ? room.images : (room?.image ? [room.image] : []);
  return imageList
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [cmsDestinations, setCmsDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCms = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const cms = await fetchCms();
        if (!isMounted) return;
        setCmsDestinations(Array.isArray(cms?.destinations) ? cms.destinations : []);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.message || 'Failed to load property details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCms();
    return () => {
      isMounted = false;
    };
  }, []);

  const property = useMemo(() => {
    if (!id) return null;

    const idMatch = String(id).match(/-(\d+)$/);
    if (!idMatch) return null;

    const roomIndex = Number.parseInt(idMatch[1], 10);
    const destinationSlug = String(id).replace(/-\d+$/, '');
    if (!Number.isInteger(roomIndex) || roomIndex < 0 || !destinationSlug) return null;

    const destination = cmsDestinations.find((item) => {
      const slug = item?.slug || toSlug(item?.name);
      return slug === destinationSlug;
    });

    if (!destination) return null;

    const rooms = resolveRooms(destination);
    const room = rooms[roomIndex];
    if (!room) return null;

    const amenities = Array.isArray(room?.amenities)
      ? room.amenities.map((a) => String(a?.label || '').trim()).filter(Boolean)
      : [];
    const roomImages = getRoomImages(room);
    const fallbackImage = destination?.cardImage || destination?.heroSlides?.[0] || '';
    const quantity = Number.parseInt(room?.quantity, 10);
    const pricing = getRoomPricing(room);

    return {
      id,
      title: room?.title || `${destination?.name || 'Hotel'} Room`,
      location: destination?.name || 'Unknown Destination',
      price: pricing.formattedDiscountedPrice,
      originalPrice: pricing.formattedBasePrice,
      hasDiscount: pricing.hasDiscount,
      discountPercent: pricing.discountPercent,
      discountNote: pricing.discountNote,
      type: 'Hotel',
      beds: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      persons: Number.parseInt(room?.persons, 10) || 1,
      baths: 1,
      area: String(room?.area || '').trim() || amenities.slice(0, 2).join(' • ') || 'Hotel Room',
      images: roomImages.length > 0 ? roomImages : [fallbackImage].filter(Boolean),
      description:
        room?.description ||
        destination?.metaDescription ||
        destination?.shortDescription ||
        'Enjoy a comfortable stay with scenic surroundings and quality hospitality.',
      features: amenities,
      activities: (destination?.destinationActivities || destination?.points?.[0]?.tabs?.activities || [])
        .map((activity) => ({
          title: String(activity?.title || '').trim(),
          description: String(activity?.description || '').trim(),
        }))
        .filter((activity) => activity.title || activity.description),
      famousPlaces: (destination?.destinationFamousPlaces || [])
        .map((place) => ({
          title: String(place?.title || '').trim(),
          description: String(place?.description || '').trim(),
        }))
        .filter((place) => place.title || place.description),
    };
  }, [cmsDestinations, id]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!property) return;
      const normalizeBookingValue = (value) => String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
      const normalizeResort = (name) => normalizeBookingValue(name).replace(/\s+resort\s*$/i, '').trim();
      const normalizeRoom = (name) => normalizeBookingValue(name).replace(/\s+room\s*$/i, '').trim();
      const hasResortMatch = (bookingResort, destinationResort) => {
        const a = normalizeResort(bookingResort);
        const b = normalizeResort(destinationResort);
        if (!a || !b) return false;
        return a === b || a.includes(b) || b.includes(a);
      };

      try {
        const payload = await fetchRoomAvailability();
        const unavailable = payload?.unavailableRooms || [];
        const destinationName = property.location || '';
        const matched = unavailable.find((b) =>
          normalizeRoom(b.roomName) === normalizeRoom(property.title) &&
          hasResortMatch(b.resortName, destinationName)
        );
        setIsAvailable(!Boolean(matched));
      } catch (_err) {
        setIsAvailable(true);
      }
    };

    loadAvailability();
  }, [property]);

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  if (loading) {
    return (
      <div className="property-detail-page">
        <BannerSection title="Hotel Room Details" subtitle="Loading data from CMS" />
        <div className="container property-detail-feedback">
          <h2>Loading property details...</h2>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="property-detail-page">
        <BannerSection title="Hotel Room Details" subtitle="Unable to fetch CMS data" />
        <div className="container property-detail-feedback">
          <h2>Unable to load property</h2>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-detail-page">
        <BannerSection title="Hotel Room Details" subtitle="Property was not found" />
        <div className="container property-detail-feedback">
          <h2>Property not found</h2>
          <p>The requested room is not available in CMS data.</p>
        </div>
      </div>
    );
  }

  const selectedImage = property.images[activeImage] || property.images[0] || '';

  return (
    <div className="property-detail-page">
      <BannerSection title={property.title} subtitle={property.location} />

      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/listings">Properties</Link>
          <span>/</span>
          <span>{property.title}</span>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={selectedImage} alt={property.title} />
          </div>
          {property.images.length > 1 && (
            <div className="thumbnail-images">
              {property.images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`View ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-content detail-content--full">
          <div className="property-header">
            <div>
              <span className="property-type-badge">{property.type}</span>
              <h1>{property.title}</h1>
              <p className="location">📍 {property.location}</p>
            </div>
            <div className="price-section">
                {property.hasDiscount && <div className="price-original">PKR {property.originalPrice}/day</div>}
                <div className="price">PKR {property.price}<span>/day</span></div>
                {property.hasDiscount && <div className="price-discount-note">{property.discountNote || `${property.discountPercent}% room discount applied`}</div>}
                {isAvailable ? (
                  <button className="btn primary" onClick={() => setShowBookingForm(true)}>Book</button>
                ) : (
                  <button className="btn disabled" disabled>Booked</button>
                )}
            </div>
          </div>

          <div className="property-stats">
            <div className="stat">
              <span className="stat-icon">🛏️</span>
              <div>
                <div className="stat-value">{property.beds}</div>
                <div className="stat-label">Bedroom</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">🧑‍🤝‍🧑</span>
              <div>
                <div className="stat-value">{property.persons}</div>
                <div className="stat-label">Persons</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">🚿</span>
              <div>
                <div className="stat-value">{property.baths}</div>
                <div className="stat-label">Bathroom</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">📐</span>
              <div>
                <div className="stat-value">{property.area}</div>
                <div className="stat-label">Highlights</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Description</h2>
            <p>{property.description}</p>
          </div>

          {property.activities.length > 0 && (
            <div className="detail-section">
              <h2>Nearby Activities</h2>
              <div className="features-list">
                {property.activities.slice(0, 6).map((activity, index) => (
                  <div key={index} className="feature-item">
                    <span className="checkmark">•</span>
                    <span>{activity.title || activity.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.famousPlaces.length > 0 && (
            <div className="detail-section">
              <h2>Famous Places Nearby</h2>
              <div className="features-list">
                {property.famousPlaces.slice(0, 6).map((place, index) => (
                  <div key={index} className="feature-item">
                    <span className="checkmark">•</span>
                    <span>{place.title || place.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.features.length > 0 && (
            <div className="detail-section">
              <h2>Features</h2>
              <div className="features-list">
                {property.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="checkmark">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}
          {showBookingForm && (
            <BookingFormModal
              room={{ title: property.title }}
              resort={property.location}
              onClose={() => setShowBookingForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
