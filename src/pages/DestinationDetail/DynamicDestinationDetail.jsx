import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Hero from '../../components/Hero/Hero';
import StickyBooking from '../../components/StickyBooking/StickyBooking';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import RoomList from '../../components/RoomCard/RoomList';
import ActivityGalleryCarousel from '../../components/ActivityGalleryCarousel/ActivityGalleryCarousel';
import BookingFormModal from '../../components/BookingFormModal/BookingFormModal';
import { fetchCms, fetchRoomAvailability } from '../../services/cmsApi';
import './DestinationDetail.css';

const asLineList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split('\n');
  return [];
};

const cleanLineList = (value) => asLineList(value).map((line) => String(line || '').trim()).filter(Boolean);

const stripBulletPrefix = (value) =>
  String(value || '').replace(/^\s*(?:[•·●▪◦\-*]|✔|✓|☑|✅)+\s*/, '').trim();

const cleanBulletList = (value) => asLineList(value).map((line) => stripBulletPrefix(line)).filter(Boolean);
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

const hasContentValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean).length > 0;
  return String(value || '').trim().length > 0;
};

const extractGoogleMapsEmbedSrc = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
  const candidate = String(iframeMatch?.[1] || raw).trim();
  if (!candidate) return '';

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const isGoogleHost = host.includes('google.com') || host.includes('googleusercontent.com');
    const isMapsEmbed = path.includes('/maps/embed');
    return isGoogleHost && isMapsEmbed ? parsed.toString() : '';
  } catch (_error) {
    return '';
  }
};

const getDestinationContentState = (destination, pointTabs = {}) => {
  const initialized = Boolean(destination?.destinationContentInitialized);

  const resolveValue = (destinationValue, fallbackValue, emptyValue) => {
    if (initialized) return destinationValue ?? emptyValue;
    return hasContentValue(destinationValue) ? destinationValue : (fallbackValue ?? emptyValue);
  };

  return {
    infoTitle: initialized
      ? (destination?.destinationInfoTitle || destination?.name || '')
      : (destination?.destinationInfoTitle || destination?.name || pointTabs.infoTitle || ''),
    infoDescription: resolveValue(destination?.destinationInfoDescription, pointTabs.infoDescription, ''),
    mapEmbed: resolveValue(destination?.destinationMapEmbed, '', ''),
    infoBullets: resolveValue(destination?.destinationInfoBullets, pointTabs.infoBullets, []),
    infoGallery: resolveValue(destination?.destinationInfoGallery, pointTabs.infoGallery, []),
    rooms: resolveValue(destination?.destinationRooms, pointTabs.rooms, []),
    activities: resolveValue(destination?.destinationActivities, pointTabs.activities, []),
    famousPlaces: resolveValue(destination?.destinationFamousPlaces, pointTabs.famousPlaces, []),
    galleryTitle: resolveValue(destination?.destinationGalleryTitle, pointTabs.galleryTitle, ''),
    galleryDescription: resolveValue(destination?.destinationGalleryDescription, pointTabs.galleryDescription, ''),
    galleryImages: resolveValue(destination?.destinationGalleryImages, pointTabs.galleryImages, []),
  };
};

const DynamicDestinationDetail = () => {
  const { destinationSlug, pointSlug } = useParams();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const [cms, setCms] = useState({ destinations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [showStickyBooking, setShowStickyBooking] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [famousImageIndexes, setFamousImageIndexes] = useState({});
  const [unavailableBookings, setUnavailableBookings] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [famousPlaceIndex, setFamousPlaceIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCms();
        setCms(data);
      } catch (err) {
        setError(err.message || 'Unable to load destination content.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroRect = heroRef.current.getBoundingClientRect();
      const heroHeight = heroRect.height || 1;
      const scrolled = Math.max(0, -heroRect.top);
      setShowStickyBooking(scrolled > heroHeight * 0.4);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const destination = useMemo(() => {
    return (cms.destinations || []).find((item) => item.slug === destinationSlug);
  }, [cms, destinationSlug]);

  const selectedPoint = useMemo(() => {
    if (!destination) return null;
    if (pointSlug) {
      return (destination.points || []).find((point) => point.slug === pointSlug) || null;
    }
    return (destination.points || [])[0] || null;
  }, [destination, pointSlug]);

  useEffect(() => {
    if (!loading && destination && !pointSlug && selectedPoint) {
      navigate(`/destinations/${destination.slug}/${selectedPoint.slug}`, { replace: true });
    }
  }, [loading, destination, pointSlug, selectedPoint, navigate]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!destination?.name) {
        setUnavailableBookings([]);
        return;
      }

      try {
        const payload = await fetchRoomAvailability();
        const filteredUnavailable = payload?.unavailableRooms?.filter((item) =>
          hasResortMatch(item.resortName, destination.name)
        ) || [];
        setUnavailableBookings(filteredUnavailable);
      } catch (_error) {
        setUnavailableBookings([]);
      }
    };

    loadAvailability();
  }, [destination?.name]);

  const heroSlides = selectedPoint?.heroSlides?.length
    ? cleanLineList(selectedPoint.heroSlides)
    : cleanLineList(destination?.heroSlides);

  const tabs = selectedPoint?.tabs || {};
  const destinationContent = getDestinationContentState(destination, tabs);
  const infoBullets = cleanBulletList(tabs.infoBullets);
  const infoGallery = cleanLineList(tabs.infoGallery);
  const contentKeyBase = selectedPoint?.id || destination?.id || destinationSlug || 'destination';
  const resolvedInfoTitle = destinationContent.infoTitle || tabs.infoTitle || destination?.name || '';
  const resolvedInfoDescription = destinationContent.infoDescription || tabs.infoDescription || 'No description available.';
  const resolvedMapEmbedSrc = extractGoogleMapsEmbedSrc(destinationContent.mapEmbed);
  const resolvedInfoBullets = cleanBulletList(destinationContent.infoBullets).length > 0 ? cleanBulletList(destinationContent.infoBullets) : infoBullets;
  const resolvedInfoGallery = cleanLineList(destinationContent.infoGallery).length > 0 ? cleanLineList(destinationContent.infoGallery) : infoGallery;
  const resolvedFamousPlaces = (destinationContent.famousPlaces || []).map((place) => ({
    title: String(place?.title || '').trim(),
    description: String(place?.description || '').trim(),
    images: Array.isArray(place?.images) ? place.images.filter(Boolean) : [],
  })).filter((place) => place.title || place.description || place.images.length > 0);

  const roomCards = (destinationContent.rooms || []).map((room, idx) => {
    const bookedCount = unavailableBookings.filter((item) =>
      normalizeRoom(item.roomName) === normalizeRoom(room?.title) &&
      hasResortMatch(item.resortName, destination?.name)
    ).length;
    const isFullyBooked = bookedCount > 0;

    const isAvailable = !isFullyBooked;

    return {
      ...room,
      images: Array.isArray(room.images) ? room.images : (room.image ? [room.image] : []),
      isAvailable,
      onViewDetail: () => {
        const slug = destination?.slug || destinationSlug;
        navigate(`/property/${slug}-${idx}`);
      },
      onBook: () => {
        if (!isAvailable) return;
        setBookingRoom(room);
        setShowBookingForm(true);
      },
      onGallery: (imgs) => {
        const slides = (imgs || []).map((url) => ({ src: url })).filter((item) => Boolean(item.src));
        if (slides.length === 0) return;
        setLightboxImages(slides);
        setLightboxIndex(0);
        setLightboxOpen(true);
      },
    };
  });

  if (loading) {
    return <div className="destination-detail-container">Loading destination content...</div>;
  }

  if (error) {
    return <div className="destination-detail-container">{error}</div>;
  }

  if (!destination) {
    return <div className="destination-detail-container">Destination not found.</div>;
  }

  return (
    <div className="destination-detail-container">
      {showStickyBooking && <StickyBooking />}
      <div ref={heroRef}>
        <Hero slides={heroSlides} activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
      </div>

      <TouristPointTabs
        destinationContent={
          <div className="tp-info-layout" style={{ display: 'block' }}>
            {resolvedFamousPlaces.length === 0 && (
              <p className="tp-info-desc">No famous places added yet.</p>
            )}
            {resolvedFamousPlaces.length > 0 && (
              <div className="famous-places-carousel-container">
                {/* Current Famous Place */}
                {resolvedFamousPlaces.map((place, idx) => {
                  if (idx !== famousPlaceIndex) return null;
                  const currentIndex = famousImageIndexes[idx] ?? 0;
                  return (
                    <div key={`${contentKeyBase}-famous-${idx}`} className="famous-place-card">
                      <div className="famous-place-media-wrapper">
                        <div className="famous-place-card-badge">
                          {resolvedFamousPlaces.length > 1 && (
                            <button
                              type="button"
                              className="famous-place-badge-arrow"
                              onClick={() => setFamousPlaceIndex((prev) =>
                                (prev - 1 + resolvedFamousPlaces.length) % resolvedFamousPlaces.length
                              )}
                              aria-label="Previous famous place"
                            >
                              ←
                            </button>
                          )}
                          <span>{idx + 1} / {resolvedFamousPlaces.length}</span>
                          {resolvedFamousPlaces.length > 1 && (
                            <button
                              type="button"
                              className="famous-place-badge-arrow"
                              onClick={() => setFamousPlaceIndex((prev) =>
                                (prev + 1) % resolvedFamousPlaces.length
                              )}
                              aria-label="Next famous place"
                            >
                              →
                            </button>
                          )}
                        </div>
                        <div className="activity-gallery-carousel famous-place-gallery-carousel">
                          <div className="activity-gallery-columns famous-place-gallery-columns">
                            <div className="famous-place-media">
                              {place.images.length > 0 ? (
                                <div className="activity-gallery-image-panel famous-place-gallery-panel">
                                  {place.images.length > 1 && (
                                    <button
                                      type="button"
                                      className="activity-arrow activity-arrow-left"
                                      onClick={() => setFamousImageIndexes((prev) => ({
                                        ...prev,
                                        [idx]: ((prev[idx] ?? 0) - 1 + place.images.length) % place.images.length,
                                      }))}
                                      aria-label="Previous image"
                                    >
                                      ←
                                    </button>
                                  )}
                                  <img
                                    src={place.images[currentIndex] || place.images[0]}
                                    alt={place.title || `Famous Place ${idx + 1}`}
                                    className="activity-gallery-main-image famous-place-gallery-main-image"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                      setLightboxImages(place.images.map((url) => ({ src: url })));
                                      setLightboxIndex(currentIndex);
                                      setLightboxOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        setLightboxImages(place.images.map((url) => ({ src: url })));
                                        setLightboxIndex(currentIndex);
                                        setLightboxOpen(true);
                                      }
                                    }}
                                  />
                                  {place.images.length > 1 && (
                                    <button
                                      type="button"
                                      className="activity-arrow activity-arrow-right"
                                      onClick={() => setFamousImageIndexes((prev) => ({
                                        ...prev,
                                        [idx]: ((prev[idx] ?? 0) + 1) % place.images.length,
                                      }))}
                                      aria-label="Next image"
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="famous-place-empty">No image added</div>
                              )}
                            </div>
                            <div className="activity-gallery-info-panel famous-place-content">
                              {place.title && <h3 className="famous-place-title">{place.title}</h3>}
                              {place.description && <p className="famous-place-desc">{place.description}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Place indicators removed by design request */}
              </div>
            )}
          </div>
        }
        infoTitle={resolvedInfoTitle}
        infoDescription={
          <div className="tp-info-layout">
            <div className="tp-info-layout-row">
              <div className="tp-info-left">
                <h1 className="tp-info-title">{resolvedInfoTitle}</h1>
                <p className="tp-info-desc">{resolvedInfoDescription}</p>
                <ul className="tp-info-bullets">
                  {resolvedInfoBullets.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              {resolvedInfoGallery.length > 0 && (
                <div className="tp-info-gallery">
                  <div className="tp-info-gallery-grid">
                    {resolvedInfoGallery.slice(0, 3).map((image, idx) => (
                      <img
                        key={`${contentKeyBase}-info-${idx}`}
                        src={image}
                        alt={`${destination.name}-${idx + 1}`}
                        className={`tp-info-gallery-img ${idx === 0 ? 'double' : 'single'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        roomsContent={
          <>
            <RoomList rooms={roomCards} />
            {showBookingForm && (
              <BookingFormModal
                room={bookingRoom}
                resort={destination.name}
                onClose={() => {
                  setShowBookingForm(false);
                  setBookingRoom(null);
                }}
              />
            )}
          </>
        }
        activitiesContent={
          <ActivityGalleryCarousel
            slides={(destinationContent.activities || []).map((activity) => ({
              ...activity,
              images: cleanLineList(activity.images || []),
            }))}
          />
        }
        galleryTitle={destinationContent.galleryTitle || 'GALLERY & IMAGES'}
        galleryDescription={destinationContent.galleryDescription || 'Browse the best views and moments from our property and surroundings.'}
        galleryImages={destinationContent.galleryImages || []}
      />

      {resolvedMapEmbedSrc && (
        <section className="destination-map-section">
          <div className="tp-map-card">
            <div className="tp-map-card-copy">
              <h2 className="tp-map-card-title">Find Us On Map</h2>
              <p className="tp-map-card-desc">Use the interactive map to view the exact location of {destination.name}.</p>
            </div>
            <div className="tp-map-frame-shell">
              <iframe
                src={resolvedMapEmbedSrc}
                title={`${destination.name} map`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="tp-map-frame"
              />
            </div>
          </div>
        </section>
      )}

      {/* Shared Lightbox (Famous Places + Room Images) */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxImages}
        index={lightboxIndex}
        onChange={(newIndex) => setLightboxIndex(newIndex)}
      />
    </div>
  );
};

export default DynamicDestinationDetail;
