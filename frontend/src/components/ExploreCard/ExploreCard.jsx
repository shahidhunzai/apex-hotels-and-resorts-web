import React, { useMemo, useState } from 'react';
import './ExploreCard.css';

const ExploreCard = ({ title, image, hotels = [], onExplore }) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 2;
  const hasCardImage = Boolean(String(image || '').trim());

  const visibleHotels = useMemo(() => {
    if (!hotels.length) return [];
    const count = Math.min(visibleCount, hotels.length);
    return Array.from({ length: count }, (_, index) => hotels[(startIndex + index) % hotels.length]);
  }, [hotels, startIndex]);

  const handleHotelClick = (hotel) => {
    if (hotel.onClick) {
      hotel.onClick();
      return;
    }
    if (hotel.link) {
      window.location.href = hotel.link;
    }
  };

  return (
    <div className="explore-card" style={{ position: 'relative' }}>
      <div
        className="explore-card-gradient-bg"
        style={{
          backgroundImage: hasCardImage
            ? `linear-gradient(180deg, rgba(45, 48, 56, 0.3) 0%, rgba(0, 0, 0, 0.9) 100%), url(${image})`
            : 'linear-gradient(180deg, rgba(45, 48, 56, 0.45) 0%, rgba(0, 0, 0, 0.9) 100%)',
        }}
      />
      <div className="explore-card-overlay">
        <div className="explore-card-title-center">
          <h2 className="explore-card-title">{title}</h2>
        </div>
        <div className="explore-card-btn-center">
          <button className="explore-card-btn" onClick={onExplore}>EXPLORE</button>
        </div>
        <div className="explore-card-hotels-wrapper">
          {/* {hasMultiple && (
            <button type="button" className="explore-mini-nav left" onClick={handlePrev} aria-label="Previous small cards">
              &#8592;
            </button>
          )} */}
          <div className="explore-card-hotels-row">
            {visibleHotels.map((hotel, idx) => (
              <button
                key={`${hotel.name}-${idx}`}
                type="button"
                className="explore-card-hotel-outer"
                onClick={() => handleHotelClick(hotel)}
              >
                <div className="explore-card-hotel">
                  {String(hotel.image || '').trim() && (
                    <img src={hotel.image} alt={hotel.name} className="explore-card-hotel-img" />
                  )}
                  <div className="explore-card-hotel-name">{hotel.name}</div>
                </div>
              </button>
            ))}
          </div>
          {/* {hasMultiple && (
            <button type="button" className="explore-mini-nav right" onClick={handleNext} aria-label="Next small cards">
              &#8594;
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default ExploreCard;
