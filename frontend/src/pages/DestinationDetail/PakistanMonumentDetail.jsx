import React from 'react';
import './DestinationDetail.css';

const pakistanMonumentGallery = [
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600',
];

const PakistanMonumentDetail = () => {
  return (
    <div className="destination-detail-container">
      <div className="destination-banner" style={{backgroundImage: `url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200')`}}>
        <h1 className="destination-banner-title">Pakistan Monument</h1>
      </div>
      <div className="tourist-point-gallery-section">
        <h2 className="tourist-points-title">Gallery</h2>
        <div className="tourist-point-gallery-grid">
          {pakistanMonumentGallery.map((img, idx) => (
            <img key={idx} src={img} alt="Pakistan Monument" className="tourist-point-gallery-img" />
          ))}
        </div>
      </div>
      <div className="tourist-point-desc-section">
        <h2 className="tourist-points-title">About Pakistan Monument</h2>
        <p className="tourist-point-desc">
          The Pakistan Monument is a national monument representing the four provinces of Pakistan. Its unique design and cultural significance make it a must-visit landmark in Islamabad.
        </p>
      </div>
    </div>
  );
};

export default PakistanMonumentDetail;
