import React from 'react';
import './ActivitiesGallery.css';

const ActivitiesGallery = ({ title, description, images, onPrev, onNext }) => (
  <div className="activities-main-container">
    <div className="activities-left">
      <h2 className="activities-title">{title}</h2>
      <p className="activities-desc">{description}</p>
      <div className="activities-arrows">
        <button className="activities-arrow" onClick={onPrev}>&larr;</button>
        <button className="activities-arrow" onClick={onNext}>&rarr;</button>
      </div>
    </div>
    <div className="activities-right">
      <div className="activities-images-row">
        <img src={images[0]} alt="Activity 1" className="activities-img small" />
        <img src={images[1]} alt="Activity 2" className="activities-img small" />
        <img src={images[2]} alt="Activity Middle" className="activities-img big" />
        <img src={images[3]} alt="Activity 4" className="activities-img small" />
        <img src={images[4]} alt="Activity 5" className="activities-img small" />
      </div>
    </div>
  </div>
);

export default ActivitiesGallery;
