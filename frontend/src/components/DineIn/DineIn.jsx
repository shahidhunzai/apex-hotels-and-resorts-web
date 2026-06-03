import React, { useRef, useState, useEffect } from 'react';
import './DineIn.css';

const DineIn = ({ items: initialItems = [] }) => {
  const sliderRef = useRef(null);
  const trackRef = useRef(null);
  const [items, setItems] = useState(initialItems);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 992 : true);

  useEffect(() => setItems(initialItems), [initialItems]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const check = () => {
      setCanPrev(el.scrollLeft > 10);
      setCanNext(el.scrollLeft + el.clientWidth + 10 < el.scrollWidth);
    };
    check();
    el.addEventListener('scroll', check);
    const onResize = () => {
      check();
      setIsDesktop(window.innerWidth >= 992);
    };
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const rotateNext = () => setItems(prev => prev.length ? [...prev.slice(1), prev[0]] : prev);
  const rotatePrev = () => setItems(prev => prev.length ? [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)] : prev);

  const handleTransitionEnd = () => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = 'none';
    trackRef.current.style.transform = 'none';
    setIsAnimating(false);
  };

  useEffect(() => {
    const tr = trackRef.current;
    if (!tr) return;
    tr.addEventListener('transitionend', handleTransitionEnd);
    return () => tr.removeEventListener('transitionend', handleTransitionEnd);
  }, []);

  const animateRotate = (direction = 1) => {
    if (isAnimating) return;
    const tr = trackRef.current;
    if (!tr) return;
    const firstCard = tr.querySelector('.dine-card');
    if (!firstCard) return;
    const gap = parseFloat(getComputedStyle(tr).gap || 0);
    const distance = firstCard.offsetWidth + gap;
    setIsAnimating(true);
    tr.style.transition = 'transform 420ms ease';
    tr.style.transform = `translateX(${direction * -distance}px)`;
    const onDone = () => {
      tr.removeEventListener('transitionend', onDone);
      if (direction > 0) rotateNext(); else rotatePrev();
    };
    tr.addEventListener('transitionend', onDone);
  };

  const scrollByAmount = (direction = 1) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 992) {
      animateRotate(direction);
      return;
    }
    const el = sliderRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8) * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="dinein-section">
      <div className="container-custom">
        <div className="dinein-header">
          <div className="dinein-title-area">
            <h2 className="section-title">DINE-IN</h2>
            <p className="section-subtitle">Guess what? We have cafes and restaurants too</p>
          </div>
        </div>

        <div className="dinein-grid" ref={sliderRef}>
          <div className="dinein-track" ref={trackRef}>
            {items.map(item => (
              <div key={item.id} className={`dine-card`}>
                <div className="dine-image" style={{ backgroundImage: `url(${item.image})` }}>
                  <div className="dine-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* overlay arrows positioned on left/right center of the image area */}
          <button
            className="dinein-arrow prev"
            onClick={() => scrollByAmount(-1)}
            disabled={!canPrev && !isDesktop}
            aria-label="Previous"
          >←</button>
          <button
            className="dinein-arrow next"
            onClick={() => scrollByAmount(1)}
            disabled={!canNext && !isDesktop}
            aria-label="Next"
          >→</button>
        </div>
      </div>
    </section>
  );
};

export default DineIn;
