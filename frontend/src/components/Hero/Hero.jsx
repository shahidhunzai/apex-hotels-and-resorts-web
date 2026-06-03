import React, { useEffect } from 'react';
import BookingWidget from '../BookingWidget/BookingWidget';
import './Hero.css';

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M6.62 10.79a15.54 15.54 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.32.57 3.59.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.99a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.27.19 2.47.57 3.59a1 1 0 0 1-.25 1.01l-2.2 2.2Z" fill="currentColor" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.52 0 .2 5.31.2 11.86c0 2.09.55 4.14 1.58 5.95L0 24l6.39-1.67a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.87-5.31 11.87-11.86 0-3.17-1.24-6.14-3.43-8.44ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.83 9.83 0 0 1-1.51-5.26c0-5.44 4.43-9.87 9.89-9.87 2.64 0 5.12 1.03 6.99 2.89a9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.19.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.48a8.93 8.93 0 0 1-1.65-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.03 1-1.03 2.43s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 5 4.42.7.3 1.25.47 1.68.6.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" fill="currentColor" />
  </svg>
);

const Hero = ({ slides = [], activeSlide, setActiveSlide, title, phone, whatsapp }) => {
  useEffect(() => {
    if (slides.length <= 1 || typeof setActiveSlide !== 'function') return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => {
        const safeCurrent = Number.isFinite(current) && current > 0 ? current : 1;
        return safeCurrent >= slides.length ? 1 : safeCurrent + 1;
      });
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [slides.length, setActiveSlide]);

  const currentIndex = Math.max(0, Math.min(slides.length - 1, (activeSlide || 1) - 1));
  const currentImage = slides.length ? slides[currentIndex] : null;
  const heroTitle = title || 'CHECK IN TO THE\nTIME OF YOUR LIFE';
  const heroPhone = String(phone || '').trim();
  const heroWhatsapp = String(whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <section
      className="hero"
      style={currentImage ? { backgroundImage: `url(${currentImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className="hero-container">
        <div className="hero-left">
          <h1>{heroTitle.split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}</h1>
        </div>
        {/* Booking Widget - Right Side */}
        <BookingWidget />
      </div>

      {/* Carousel Navigation restored with numbers */}
      {slides.length > 1 && (
        <div className="carousel-nav">
          <div className="carousel-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot${currentIndex === idx ? ' active' : ''}`}
                onClick={() => setActiveSlide(idx + 1)}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="carousel-progress">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`progress-segment${currentIndex === idx ? ' active' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scroll Down Arrow */}
      <button className="scroll-down" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}></button>

      {/* Floating Action Buttons */}
      {(heroPhone || heroWhatsapp) && (
        <div className="floating-actions">
          {heroPhone && (
            <a href={`tel:${heroPhone}`} className="floating-btn phone-btn" aria-label="Call now">
              <PhoneIcon />
            </a>
          )}
          {heroWhatsapp && (
            <a href={`https://wa.me/${heroWhatsapp}`} className="floating-btn whatsapp-btn" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
              <WhatsAppIcon />
            </a>
          )}
        </div>
      )}
    </section>
  );
};

export default Hero;
