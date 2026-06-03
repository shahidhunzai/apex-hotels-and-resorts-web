import React, { useEffect, useState } from 'react';
import './ActivityGalleryCarousel.css';

const ActivityGalleryCarousel = ({ slides }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  const normalizedSlides = (slides || []).filter(Boolean).map((slide) => ({
    ...slide,
    images: (slide.images || []).filter(Boolean),
  }));
  const totalSlides = normalizedSlides.length;
  const slide = normalizedSlides[slideIndex] || null;
  const images = slide?.images || [];
  const visibleImages = images.slice(0, 5);
  const totalImages = images.length;

  useEffect(() => {
    if (slideIndex >= totalSlides) setSlideIndex(0);
  }, [slideIndex, totalSlides]);

  useEffect(() => {
    setImgIndex(0);
  }, [slideIndex]);

  if (!slide) {
    return null;
  }

  // When there are multiple slides (activities), arrows change slides + content.
  // When there is only one slide (gallery), arrows change only the image.
  const multiSlide = totalSlides > 1;

  const handlePrev = () => {
    if (multiSlide) {
      setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    } else {
      if (!totalImages) return;
      setImgIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };
  const handleNext = () => {
    if (multiSlide) {
      setSlideIndex((prev) => (prev + 1) % totalSlides);
    } else {
      if (!totalImages) return;
      setImgIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const currentImage = multiSlide ? '' : (images[imgIndex] || '');
  const showArrows = multiSlide ? totalSlides > 1 : totalImages > 1;
  const { title, description } = slide;

  return (
    <div className="activity-gallery-carousel">
      <div className="activity-gallery-columns">
        <div className="activity-gallery-image-panel">
          {multiSlide ? (
            <>
              {showArrows && (
                <button className="activity-arrow activity-arrow-left" onClick={handlePrev} aria-label="Previous">
                  &larr;
                </button>
              )}
              {visibleImages.length ? (
                <div className="activity-gallery-grid">
                  {visibleImages.map((imageUrl, index) => (
                    <img
                      key={`${imageUrl}-${index}`}
                      src={imageUrl}
                      alt={`${title || 'Activity'} ${index + 1}`}
                      className={`activity-gallery-grid-image ${index === 2 ? 'feature' : ''}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="activity-gallery-empty">No images yet.</div>
              )}
              {showArrows && (
                <button className="activity-arrow activity-arrow-right" onClick={handleNext} aria-label="Next">
                  &rarr;
                </button>
              )}
            </>
          ) : currentImage ? (
            <>
              {showArrows && (
                <button className="activity-arrow activity-arrow-left" onClick={handlePrev} aria-label="Previous">
                  &larr;
                </button>
              )}
              <img src={currentImage} alt={title || 'Gallery'} className="activity-gallery-main-image" />
              {showArrows && (
                <button className="activity-arrow activity-arrow-right" onClick={handleNext} aria-label="Next">
                  &rarr;
                </button>
              )}
            </>
          ) : (
            <div className="activity-gallery-empty">No images yet.</div>
          )}
        </div>
        <div className="activity-gallery-info-panel">
          <h2 className="activity-gallery-title">{title}</h2>
          <p className="activity-gallery-desc">{description}</p>
          {multiSlide && totalSlides > 1 && (
            <div className="activity-gallery-count">
              {slideIndex + 1} / {totalSlides}
            </div>
          )}
          {!multiSlide && totalImages > 1 && (
            <div className="activity-gallery-count">
              {imgIndex + 1} / {totalImages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityGalleryCarousel;
