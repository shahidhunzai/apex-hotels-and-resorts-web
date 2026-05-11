import React from 'react';
import { Link } from 'react-router-dom';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const availabilityClass = property.availability === 'available' ? 'available' : 'booked';
  const availabilityText = property.availability === 'available' ? 'Available' : 'Booked';

  return (
    <Link to={`/property/${property.id}`} className="property-card">
      <div className="property-image" style={{ backgroundImage: `url(${property.image})` }}>
        <div className="property-badge">{property.type}</div>
        <div className={`availability-badge ${availabilityClass}`}>
          {availabilityText}
        </div>
      </div>
      <div className="property-details">
        <h3 className="property-title">{property.title}</h3>
        <p className="property-location">📍 {property.location}</p>
        
        <div className="property-features">
          <span>🧑‍🤝‍🧑 {property.persons || 1} Persons</span>
          <span>🛏️ {property.beds} Bed</span>
          <span>📐 {property.area}</span>
        </div>

        <div className="property-footer">
          <div className="property-price">
            {property.hasDiscount && <span className="price-original">PKR {property.originalPrice}</span>}
            <span className="price-label">PKR</span>
            <span className="price-value">{property.price}</span>
            <span className="price-period">/day</span>
          </div>
          <button className="btn-details">View Details</button>
        </div>
        {property.hasDiscount && (
          <div className="property-discount-note">
            {property.discountNote || `${property.discountPercent}% off on this room`}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
