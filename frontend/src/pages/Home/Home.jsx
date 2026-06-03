import React, { useState, useEffect } from 'react';
import './Home.css';
import Travel from '../../components/Travel/Travel';
import DineIn from '../../components/DineIn/DineIn';
import Locations from '../../components/Locations/Locations';
import OffersBanner from '../../components/OffersBanner/OffersBanner';
import AppSection from '../../components/AppSection/AppSection';
import ContactSection from '../../components/ContactSection/ContactSection';
import StickyBooking from '../../components/StickyBooking/StickyBooking';
import Hero from '../../components/Hero/Hero';
import { fetchCms } from '../../services/cmsApi';

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(1);
  const [showStickyBooking, setShowStickyBooking] = useState(false);
  const [hp, setHp] = useState(null); // homePage from CMS

  useEffect(() => {
    fetchCms()
      .then((cms) => setHp(cms?.homePage || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowStickyBooking(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroSlides = hp?.hero?.slides?.length ? hp.hero.slides : [];
  const heroTitle = hp?.hero?.title || undefined;
  const heroPhone = hp?.hero?.phone || undefined;
  const heroWhatsapp = hp?.hero?.whatsapp || undefined;

  const diningItems = hp?.dining?.length ? hp.dining : [];
  const locations = hp?.locations?.length ? hp.locations : [];

  return (
    <div className="home">
      {showStickyBooking && <StickyBooking />}

      <Hero slides={heroSlides} activeSlide={activeSlide} setActiveSlide={setActiveSlide}
        title={heroTitle} phone={heroPhone} whatsapp={heroWhatsapp} />

      <Travel data={hp?.travel} />

      {locations.length > 0 && <Locations data={locations} />}

      {diningItems.length > 0 && <DineIn items={diningItems} />}

      <OffersBanner data={hp?.offersBanner} />

      <AppSection data={hp?.appSection} />

      <ContactSection data={hp?.contact} />
    </div>
  );
};

export default Home;
