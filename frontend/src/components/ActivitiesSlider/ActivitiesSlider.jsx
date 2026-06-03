import React, { useRef } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './ActivitiesSlider.css';

const ActivitiesSlider = ({ slides }) => {
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // keep false so we use custom arrows
    adaptiveHeight: true,
  };

  return (
    <div className="activities-slider-container">
      <h2 className="activities-main-title">#WHAT YOU'RE IN FOR</h2>
      <Slider ref={sliderRef} {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx} className="activities-slide">
            <div className="activities-slide-row">
              <div className="activities-slide-info">
                {
                <div className="activities-slide-arrows">
                  <button
                    type="button"
                    className="activities-arrow"
                    onClick={() => sliderRef.current?.slickPrev()}
                    aria-label="Previous slide"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="activities-arrow active"
                    onClick={() => sliderRef.current?.slickNext()}
                    aria-label="Next slide"
                  >
                    →
                  </button>
                </div>
                }
                <h3 className="activities-slide-title">{slide.title}</h3>
                <p className="activities-slide-desc">{slide.description}</p>
              </div>
              <div className="activities-slide-gallery">
                <div className="activities-slide-gallery-grid">
                  <div className="activities-col">
                    <img src={slide.images[0]} alt="Activity 1" className="activities-slide-img small" />
                    <img src={slide.images[1]} alt="Activity 2" className="activities-slide-img small" />
                  </div>
                  <img src={slide.images[2]} alt="Activity Middle" className="activities-slide-img tall" />
                  <div className="activities-col">
                    <img src={slide.images[3]} alt="Activity 4" className="activities-slide-img small" />
                    <img src={slide.images[4]} alt="Activity 5" className="activities-slide-img small" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ActivitiesSlider;
