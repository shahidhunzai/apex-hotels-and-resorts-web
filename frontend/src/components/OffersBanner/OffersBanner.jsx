import React from 'react';
import './OffersBanner.css';

const OffersBanner = ({ data }) => {
  const title = data?.title || 'See the\noffers & deals';
  const description = data?.description || 'Get exclusive offers on stays & deals to make new memories with us';
  const buttonText = data?.buttonText || 'Premium Deal';

  const titleParts = title.split('\n');
  return (
    <section className="offers-banner">
      <div className="offers-content">
        <div className="offers-text">
          <h3>{titleParts[0]}<br/><span className="highlight">{titleParts.slice(1).join(' ') || ''}</span></h3>
          <p>{description}</p>
        </div>
        <button className="btn-premium">{buttonText}</button>
      </div>
    </section>
  );
};

export default OffersBanner;
