import React, { useState, useRef, useEffect } from 'react';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import RoomList from '../../components/RoomCard/RoomList';
import ActivityGalleryCarousel from '../../components/ActivityGalleryCarousel/ActivityGalleryCarousel';
import './DestinationDetail.css';
import StickyBooking from '../../components/StickyBooking/StickyBooking'; 
import Hero from '../../components/Hero/Hero'; 
const gallery = [
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=601',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=602',
];

const SkarduDetail = () => {
  // Add state for active slide
  const [activeSlide, setActiveSlide] = useState(0);
  const [showStickyBooking, setShowStickyBooking] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroRect = heroRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const heroHeight = heroRect.height;
      const scrolled = Math.max(0, -heroRect.top);
      if (scrolled > heroHeight * 0.4) {
        setShowStickyBooking(true);
      } else {
        setShowStickyBooking(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Define hero slides data
  const heroSlides = [
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
    // Add more slide URLs as needed
  ];

  return (
    <div className="destination-detail-container">
      {showStickyBooking && <StickyBooking />}
      <div ref={heroRef}>
        <Hero slides={heroSlides} activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
      </div>


    {/* <div className="destination-banner" style={{backgroundImage: `url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200')`}}>
      <h1 className="destination-banner-title">Pindi Point, Murree</h1>
    </div> */}
    <TouristPointTabs
      infoTitle="A Scenic Viewpoint in Skardu"
      infoDescription={
        <div className="tp-info-layout" style={{display: 'flex', gap: '24px'}}>
          <div className="tp-info-left">
            <p className="tp-info-desc">
              Skardu is a scenic city offering breathtaking views of the surrounding hills and valleys. It's ideal for families, couples, and solo travelers, featuring fresh mountain air, scenic views, and cozy moments under the stars. This peaceful spot provides the perfect setting to unwind and connect with nature.
            </p>
            <ul className="tp-info-bullets">
              <li>✔ Scenic & Comfortable Views</li>
              <li>✔ Hilltop Vantage</li>
              <li>✔ Nature Walks & Picnic Area</li>
              <li>✔ Local Food Stalls</li>
            </ul>
          </div>
          <div className="tp-info-gallery">
            <div className="tp-info-gallery-grid">
              {/* One tall image in left column, two single images stacked in right column */}
              <img src={gallery[0]} alt="Gallery Tall" className="tp-info-gallery-img double" />
              <img src={gallery[1]} alt="Gallery Single 1" className="tp-info-gallery-img single" />
              <img src={gallery[2]} alt="Gallery Single 2" className="tp-info-gallery-img single" />
            </div>
          </div>
        </div>
      }
      roomsContent={
        <RoomList
          rooms={[
            {
              image: gallery[0],
              title: 'Standard Nook',
              price: '8,000',
              amenities: [
                { icon: '🍳', label: 'Free Breakfast' },
                { icon: '☕', label: 'Tea Setup' },
                { icon: '📺', label: 'TV' },
                { icon: '📶', label: 'Free Wifi' },
                { icon: '🛁', label: 'Bathroom Amenities' },
                { icon: '🪟', label: 'Window' },
              ],
              onBook: () => alert('Book Standard Nook'),
              onGallery: () => alert('View Gallery'),
            },
            {
              image: gallery[1],
              title: 'Deluxe Escape',
              price: '10,000',
              amenities: [
                { icon: '🍳', label: 'Free Breakfast' },
                { icon: '☕', label: 'Tea Setup' },
                { icon: '📺', label: 'TV' },
                { icon: '📶', label: 'Free Wifi' },
                { icon: '🛁', label: 'Bathroom Amenities' },
                { icon: '🪟', label: 'Window' },
                { icon: '❄️', label: 'AC' },
              ],
              onBook: () => alert('Book Deluxe Escape'),
              onGallery: () => alert('View Gallery'),
            },
            {
              image: gallery[2],
              title: 'The Suite Spot',
              price: '12,000',
              amenities: [
                { icon: '🍳', label: 'Free Breakfast' },
                { icon: '☕', label: 'Tea Setup' },
                { icon: '📺', label: 'TV' },
                { icon: '📶', label: 'Free Wifi' },
                { icon: '🛁', label: 'Bathroom Amenities' },
                { icon: '🪟', label: 'Window' },
                { icon: '❄️', label: 'AC' },
              ],
              onBook: () => alert('Book The Suite Spot'),
              onGallery: () => alert('View Gallery'),
            },
          ]}
        />
      }
      activitiesContent={
        <div>
          <ActivityGalleryCarousel
            slides={[
              {
                title: '#WHAT YOU\'RE IN FOR',
                description: 'Go on an adventure experiencing the cable car system at Patriata experiencing the thick, lush green forests, or explore the popular Kashmir point, one of the highest viewpoints in Murree Hills. You can also go to Changla Gali which offers hiking trails and heavily forested hills for a much truer immersion into nature.',
                images: [
                  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=601',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=602',
                  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=603',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=604',
                ],
              },
              {
                title: 'Cable Car Adventure',
                description: 'Experience the thrill of the cable car system at Patriata, offering panoramic views and lush green forests.',
                images: [
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=605',
                  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=606',
                  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=607',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=608',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=609',
                ],
              },
              {
                title: 'Nature Walks & Hiking',
                description: 'Explore hiking trails and heavily forested hills for a true immersion into nature at Changla Gali.',
                images: [
                  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=610',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=611',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=612',
                  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=613',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=614',
                ],
              },
            ]}
          />
        </div>
      }
      galleryImages={gallery}
    />
  </div>
  );
};

export default SkarduDetail;
