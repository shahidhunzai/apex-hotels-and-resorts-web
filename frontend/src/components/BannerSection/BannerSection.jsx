import React from 'react';
import './BannerSection.css';

const BannerSection = ({ title, subtitle, children }) => (
  <div className="banner-section">
    <div className="container">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  </div>
);

export default BannerSection;
