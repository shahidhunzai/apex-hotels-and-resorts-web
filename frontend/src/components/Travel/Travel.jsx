import React from 'react';
import './Travel.css';

const Travel = ({ data }) => {
  const title = data?.title || 'TRAVEL LIKE\nNEVER BEFORE';
  const description = data?.description || "At Roomy Hotels, we believe hotels should be more than just a place to rest your head at night. We're passionate about creating experiences that reimagine hospitality, the authentic that values experience as absolute.";
  const buttonText = data?.buttonText || 'TRY THE APP';
  const image = data?.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';

  return (
    <section className="travel-section">
      <div className="container-custom">
        <div className="travel-content">
          <div className="travel-image">
            <img src={image} alt="Travel" />
          </div>
          <div className="travel-text">
            <h2>{title.split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}</h2>
            <p>{description}</p>
            <button className="btn-cta">{buttonText}</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Travel;
