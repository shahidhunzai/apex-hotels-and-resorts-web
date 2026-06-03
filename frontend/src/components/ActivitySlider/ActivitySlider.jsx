import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './ActivitySlider.css';

const ActivitySlider = ({ slides }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="activity-slider-container">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx} className="activity-slide">
            <div className="activity-slide-row">
              <div className="activity-slide-info">
                <h2 className="activity-slide-title">{slide.title}</h2>
                <p className="activity-slide-desc">{slide.description}</p>
              </div>
              <div className="activity-slide-gallery">
                <div className="activity-slide-gallery-row">
                  <img src={slide.images[0]} alt="Activity 1" className="activity-slide-img small" />
                  <img src={slide.images[1]} alt="Activity 2" className="activity-slide-img small" />
                  <img src={slide.images[2]} alt="Activity Middle" className="activity-slide-img big" />
                  <img src={slide.images[3]} alt="Activity 4" className="activity-slide-img small" />
                  <img src={slide.images[4]} alt="Activity 5" className="activity-slide-img small" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ActivitySlider;
