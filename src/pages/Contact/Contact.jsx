import React, { useEffect, useState } from 'react';
import './Contact.css';
import Hero from '../../components/Hero/Hero';
import ContactSection from '../../components/ContactSection/ContactSection';
import { fetchCms } from '../../services/cmsApi';

const Contact = () => {
  const [cmsPages, setCmsPages] = useState({ homePage: {}, getawaysPage: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSlide, setActiveSlide] = useState(1);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const cms = await fetchCms();
        setCmsPages({ homePage: cms?.homePage || {}, getawaysPage: cms?.getawaysPage || {} });
      } catch (err) {
        setError(err.message || 'Unable to load contact settings.');
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  const heroSlides = Array.isArray(cmsPages.getawaysPage?.heroSlides) && cmsPages.getawaysPage.heroSlides.length
    ? cmsPages.getawaysPage.heroSlides
    : (Array.isArray(cmsPages.homePage?.hero?.slides) ? cmsPages.homePage.hero.slides : []);
  const heroTitle = cmsPages.getawaysPage?.heroTitle || 'PLAN YOUR\nTRIP / TOUR';
  const heroPhone = cmsPages.homePage?.hero?.phone || undefined;
  const heroWhatsapp = cmsPages.homePage?.hero?.whatsapp || undefined;

  return (
    <div className="contact-page">
      <Hero
        slides={heroSlides}
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        title={heroTitle}
        phone={heroPhone}
        whatsapp={heroWhatsapp}
      />

      {loading ? (
        <div className="container"><p>Loading contact details...</p></div>
      ) : error ? (
        <div className="container"><p>{error}</p></div>
      ) : (
        <ContactSection data={cmsPages.homePage?.contact} />
      )}
    </div>
  );
};

export default Contact;
