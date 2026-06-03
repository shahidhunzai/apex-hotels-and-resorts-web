
import React from 'react';
import './AppSection.css';

const AppSection = ({ data }) => {
  const title = data?.title || 'FAST CHECK IN APP';
  const description = data?.description || 'A Three-Step Feature For A Contactless And Hassle-Free Check-In Process.\nDownload Our App & Book A Room Now!';

  return (
    <section className="app-section fast-checkin-section">
      <div className="fast-checkin-content">
        <div className="fast-checkin-images">
          <img src="/app-section/phone1.png" alt="Phone Mockup" className="phone-img-single" />
        </div>
        <div className="fast-checkin-text">
          <h2>{title}</h2>
          <p className="fast-checkin-desc">
            {description.split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}
          </p>
          <div className="fast-checkin-badges">
            <a href="#google" className="store-badge">
              <img src="/app-section/google-play.png" alt="Google Play" />
            </a>
            <a href="#apple" className="store-badge">
              <img src="/app-section/app-store.png" alt="App Store" />
            </a>
          </div>
          <img src="/app-section/arrow.png" alt="Arrow" className="fast-checkin-arrow" />
        </div>
      </div>
    </section>
  );
};

export default AppSection;
