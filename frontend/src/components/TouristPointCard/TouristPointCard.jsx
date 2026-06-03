import React from 'react';
import './TouristPointCard.css';

const TouristPointCard = ({ name, image, description, onClick }) => (
  <div className="tourist-point-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <img src={image} alt={name} className="tourist-point-img" />
    <div className="tourist-point-info">
      <h3 className="tourist-point-name">{name}</h3>
      <p className="tourist-point-desc">{description}</p>
    </div>
  </div>
);

export default TouristPointCard;
