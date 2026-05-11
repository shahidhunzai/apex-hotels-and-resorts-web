import React from 'react';
import './RoomCard.css';
import { getRoomPricing } from '../../utils/roomPricing';

const RoomCard = ({
  image,
  images,
  title,
  price,
  discountPercent,
  discountNote,
  amenities = [],
  onBook,
  onViewDetail,
  onGallery,
  isAvailable = true,
}) => {
  const imgList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
  const mainImg = imgList[0] || '';
  const pricing = getRoomPricing({ price, discountPercent, discountNote });

  const statusLabel = isAvailable ? 'Available' : 'Not Available';

  return (
    <div className={`room-card${!isAvailable ? ' room-card--unavailable' : ''}`}>
      <div className="room-card-img-wrap">
        {mainImg && <img src={mainImg} alt={title} className="room-card-img" />}
        {pricing.hasDiscount && (
          <div className="room-card-discount-ribbon">
            <span>{pricing.discountPercent}% off</span>
          </div>
        )}
        {imgList.length > 0 && (
          <button className="room-card-gallery-btn" onClick={() => onGallery && onGallery(imgList)}>
            <span role="img" aria-label="gallery">🖼️</span> View Images {imgList.length > 1 && `(${imgList.length})`}
          </button>
        )}
        {!isAvailable && (
          <div className="room-card-unavailable-overlay">
            <div className="room-card-unavailable-badge">
              <span className="room-card-unavailable-icon">🔒</span>
              <span>{statusLabel}</span>
            </div>
          </div>
        )}
        <div className="room-card-price">
          {pricing.hasDiscount ? (
            <>
              <span className="room-card-price-original">PKR {pricing.formattedBasePrice}</span>
              <span className="room-card-price-current">PKR {pricing.formattedDiscountedPrice}</span>
            </>
          ) : (
            <span className="room-card-price-current">Starts From PKR {pricing.formattedBasePrice}</span>
          )}
        </div>
      </div>
      <div className="room-card-title-row">
        <div className="room-card-title">{title}</div>
        <div className={`room-card-status-badge${isAvailable ? ' available' : ' unavailable'}`}>
          {statusLabel}
        </div>
      </div>
      <div className="room-card-amenities">
        {amenities.map((item, idx) => (
          <span key={idx} className="room-card-amenity">{item.icon} {item.label}</span>
        ))}
      </div>
      <div className="room-card-actions">
        {typeof onViewDetail === 'function' && (
          <button
            className="room-card-view-btn"
            onClick={onViewDetail}
          >
            View Details
          </button>
        )}
        {isAvailable && (
          <button
            className="room-card-book-btn"
            onClick={onBook}
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
