import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';
import { fetchCms, fetchGooglePlaceReviews } from '../../services/cmsApi';

const normalizeReviewItems = (cms) => {
  const reviewSource = Array.isArray(cms?.homePage?.footerReviews)
    ? cms.homePage.footerReviews
    : (Array.isArray(cms?.reviews)
      ? cms.reviews
      : (Array.isArray(cms?.homePage?.reviews) ? cms.homePage.reviews : []));

  return reviewSource
    .map((item, index) => {
      const hasPublishState = item?.published !== undefined
        || item?.isPublished !== undefined
        || item?.status !== undefined;
      const published = !hasPublishState
        || item?.published === true
        || item?.isPublished === true
        || String(item?.status || '').toLowerCase() === 'published';
      const archived = item?.archived === true
        || item?.archive === true
        || item?.archieve === true
        || String(item?.status || '').toLowerCase() === 'archived';
      const stars = Number(item?.stars || item?.rating || item?.reviewStars || 5);

      return {
        id: item?.id || item?._id || `review-${index}`,
        published,
        archived,
        hotelSlug: String(item?.hotelSlug || item?.destinationSlug || item?.pointSlug || item?.propertySlug || item?.hotel || '').trim().toLowerCase(),
        name: String(item?.name || item?.author || item?.reviewerName || 'Guest').trim(),
        avatar: String(item?.avatar || item?.avatarUrl || item?.image || '').trim(),
        review: String(item?.description || item?.review || item?.text || item?.comment || item?.content || '').trim(),
        stars: Math.max(1, Math.min(5, Number.isFinite(stars) ? stars : 5)),
      };
    })
    .filter((item) => item.published && !item.archived && item.review);
};

const getRouteHotelSlugs = (pathname) => {
  const normalizedPath = String(pathname || '').toLowerCase();
  const destinationMatch = normalizedPath.match(/^\/destinations\/([^/]+)(?:\/([^/]+))?$/);
  if (destinationMatch) {
    return [destinationMatch[2], destinationMatch[1]].filter(Boolean);
  }

  const propertyMatch = normalizedPath.match(/^\/property\/([^/]+)$/);
  if (propertyMatch) {
    return [propertyMatch[1].replace(/-\d+$/, '')].filter(Boolean);
  }

  return [];
};

const getGooglePlaceIdForRoute = (pathname, cms) => {
  const normalizedPath = String(pathname || '').toLowerCase();
  const destinations = Array.isArray(cms?.destinations) ? cms.destinations : [];

  const destinationMatch = normalizedPath.match(/^\/destinations\/([^/]+)(?:\/([^/]+))?$/);
  if (destinationMatch) {
    const destination = destinations.find((item) => String(item?.slug || '').toLowerCase() === destinationMatch[1]);
    if (!destination) return '';

    if (destinationMatch[2]) {
      const point = (destination.points || []).find((item) => String(item?.slug || '').toLowerCase() === destinationMatch[2]);
      return String(point?.googlePlaceId || destination?.googlePlaceId || '').trim();
    }

    return String(destination?.googlePlaceId || '').trim();
  }

  const propertyMatch = normalizedPath.match(/^\/property\/([^/]+)$/);
  if (propertyMatch) {
    const destinationSlug = propertyMatch[1].replace(/-\d+$/, '');
    const destination = destinations.find((item) => String(item?.slug || '').toLowerCase() === destinationSlug);
    return String(destination?.googlePlaceId || '').trim();
  }

  return '';
};

const normalizeGoogleReviews = (payload) => {
  const reviews = Array.isArray(payload?.reviews) ? payload.reviews : [];
  return reviews.map((item, index) => ({
    id: item?.id || `google-review-${index}`,
    name: String(item?.name || 'Google User').trim(),
    avatar: String(item?.avatar || '').trim(),
    review: String(item?.review || '').trim(),
    stars: Math.max(1, Math.min(5, Number(item?.rating) || 5)),
    relativeTime: String(item?.relativeTime || '').trim(),
    source: 'google',
  })).filter((item) => item.review);
};

const SocialIcon = ({ type }) => {
  if (type === 'twitter') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M18.901 2H22.58l-8.036 9.184L24 22h-7.406l-5.8-6.594L5.026 22H1.345l8.596-9.824L0 2h7.594l5.243 5.966L18.901 2Zm-1.298 17.786h2.045L6.483 4.098H4.29L17.603 19.786Z" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.52 0 .2 5.31.2 11.86c0 2.09.55 4.14 1.58 5.95L0 24l6.39-1.67a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.87-5.31 11.87-11.86 0-3.17-1.24-6.14-3.43-8.44ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.83 9.83 0 0 1-1.51-5.26c0-5.44 4.43-9.87 9.89-9.87 2.64 0 5.12 1.03 6.99 2.89a9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.19.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.48a8.93 8.93 0 0 1-1.65-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.03 1-1.03 2.43s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 5 4.42.7.3 1.25.47 1.68.6.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.97 1.35a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16ZM12 6.86A5.14 5.14 0 1 1 6.86 12 5.15 5.15 0 0 1 12 6.86Zm0 1.8A3.34 3.34 0 1 0 15.34 12 3.34 3.34 0 0 0 12 8.66Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.56c0-.93.26-1.56 1.6-1.56h1.71V4.14c-.83-.09-1.66-.14-2.5-.14-2.47 0-4.16 1.51-4.16 4.28v2.32H7.36v3.2h2.79V22h3.35Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4.98 3.5A1.98 1.98 0 1 1 5 7.46a1.98 1.98 0 0 1-.02-3.96ZM3.5 8.75h3V20h-3V8.75Zm4.88 0h2.88v1.54h.04c.4-.76 1.39-1.56 2.87-1.56 3.07 0 3.63 2.02 3.63 4.65V20h-3v-5.88c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V20h-3V8.75Z" fill="currentColor" />
      </svg>
    );
  }

  return null;
};

const customerReviews = [
  {
    name: 'Umair Jaswal',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    review: "Can't wait to revisit this beautiful lodge in Batakundi upper Naran. Thank you for your hospitality.",
    stars: 5,
  },
  {
    name: 'Humna Raza',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    review: 'Surrounding Roomy Mountain Top Resort are these beautiful view spots & there is a river flowing too; I wanted to stop and take a picture at every spot but also didn’t want to be that annoying person.',
    stars: 5,
  },
  {
    name: 'Eva Zu Beck',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    review: 'Slept here btw. Actually one of the few modern, pretty and affordable hotels in Islamabad.',
    stars: 5,
  },
];

const defaultFooterMenuItems = [
  { id: 'footer-home', label: 'HOME', href: '/' },
  { id: 'footer-hotels', label: 'HOTELS', href: '/destinations' },
  { id: 'footer-destinations', label: 'DESTINATIONS', href: '/listings' },
  { id: 'footer-contact', label: 'CONTACT', href: '/contact' },
];

const partnerLogos = [
  { src: 'https://assets.roomy.pk/images/locations_5/homepage/unilever_desktop.png', alt: 'Unilever' },
  { src: 'https://assets.roomy.pk/images/locations_5/homepage/hum_desktop.png', alt: 'HUM' },
  { src: 'https://assets.roomy.pk/images/locations_5/homepage/nando_desktop.png', alt: "Nando's" },
  { src: 'https://assets.roomy.pk/images/locations_5/homepage/kfc_desktop.png', alt: 'KFC' },
  { src: 'https://assets.roomy.pk/images/locations_5/homepage/giz_desktop.png', alt: 'giz' },
  { src: 'https://assets.roomy.pk/images/locations_5/homepage/abacus_desktop.png', alt: 'ABACUS' },
];

const paymentLogos = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png', alt: 'Mastercard' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', alt: 'Visa' },
  { src: 'https://seeklogo.com/images/H/hbl-pay-logo-6B1B2B7B2A-seeklogo.com.png', alt: 'HBL Pay' },
];

const normalizeFooterMenuItems = (cms) => {
  const menuSource = Array.isArray(cms?.homePage?.footerMenu) ? cms.homePage.footerMenu : [];
  const normalized = defaultFooterMenuItems.map((defaultItem, index) => {
    const source = menuSource[index] || {};
    const href = String(source?.href || source?.url || source?.link || defaultItem.href).trim();

    return {
      id: defaultItem.id,
      label: defaultItem.label,
      href: href || defaultItem.href,
    };
  });

  return normalized;
};

const isExternalHref = (href) => /^https?:\/\//i.test(String(href || '').trim());

const Footer = () => {
  const location = useLocation();
  const [activeReview, setActiveReview] = useState(0);
  const [socialLinks, setSocialLinks] = useState([]);
  const [cmsReviews, setCmsReviews] = useState(customerReviews);
  const [footerMenuItems, setFooterMenuItems] = useState(defaultFooterMenuItems);
  const [partnerLogosState, setPartnerLogosState] = useState(partnerLogos);
  const [googleReviews, setGoogleReviews] = useState([]);
  const [cmsPayload, setCmsPayload] = useState({ destinations: [] });

  useEffect(() => {
    let isMounted = true;

    const loadSocialLinks = async () => {
      try {
        const cms = await fetchCms();
        const social = cms?.homePage?.contact?.social || {};
        const nextLinks = [
          { key: 'twitter', href: social.twitter, color: '#111111', label: 'X / Twitter' },
          { key: 'whatsapp', href: social.whatsapp, color: '#25d366', label: 'WhatsApp' },
          { key: 'instagram', href: social.instagram, color: '#e1306c', label: 'Instagram' },
          { key: 'facebook', href: social.facebook, color: '#1877f3', label: 'Facebook' },
          { key: 'linkedin', href: social.linkedin, color: '#0077b5', label: 'LinkedIn' },
        ].filter((item) => item.href && item.href.trim());

        if (isMounted) {
          setCmsPayload(cms || { destinations: [] });
          setSocialLinks(nextLinks);
          const nextReviews = normalizeReviewItems(cms);
          setCmsReviews(nextReviews.length > 0 ? nextReviews : customerReviews);
          setFooterMenuItems(normalizeFooterMenuItems(cms));
          
          // Fetch partner logos from CMS
          const partnersFromCms = cms?.partnerLogos;
          if (Array.isArray(partnersFromCms) && partnersFromCms.length > 0) {
            setPartnerLogosState(partnersFromCms);
          }
        }
      } catch {
        if (isMounted) {
          setSocialLinks([]);
          setCmsPayload({ destinations: [] });
          setCmsReviews(customerReviews);
          setFooterMenuItems(defaultFooterMenuItems);
          setPartnerLogosState(partnerLogos);
        }
      }
    };

    loadSocialLinks();

    return () => {
      isMounted = false;
    };
  }, []);

  const footerReviews = useMemo(() => {
    const reviewSource = googleReviews.length > 0 ? googleReviews : cmsReviews;
    const routeSlugs = getRouteHotelSlugs(location.pathname);
    if (routeSlugs.length === 0) {
      return reviewSource;
    }

    const matchingReviews = reviewSource.filter((item) => item?.hotelSlug && routeSlugs.includes(item.hotelSlug));
    return matchingReviews.length > 0 ? matchingReviews : reviewSource;
  }, [cmsReviews, googleReviews, location.pathname]);

  useEffect(() => {
    let isMounted = true;
    const placeId = getGooglePlaceIdForRoute(location.pathname, cmsPayload);

    const loadGoogleReviews = async () => {
      if (!placeId) {
        if (isMounted) {
          setGoogleReviews([]);
        }
        return;
      }

      try {
        const payload = await fetchGooglePlaceReviews(placeId);
        if (!isMounted) return;
        const nextReviews = normalizeGoogleReviews(payload);
        setGoogleReviews(nextReviews);
      } catch (_error) {
        if (!isMounted) return;
        setGoogleReviews([]);
      }
    };

    loadGoogleReviews();

    return () => {
      isMounted = false;
    };
  }, [cmsPayload, location.pathname]);

  useEffect(() => {
    setActiveReview((current) => (footerReviews.length === 0 ? 0 : Math.min(current, footerReviews.length - 1)));
  }, [footerReviews]);

  useEffect(() => {
    if (footerReviews.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveReview((current) => (current + 1) % footerReviews.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [footerReviews.length]);

  const activeReviewItem = footerReviews[activeReview] || customerReviews[0];

  return (
    <footer className="footer-v2">
      <div className="footer-main">
        <div className="footer-col reviews-col">
          <h3>CUSTOMER REVIEWS</h3>
          <div className="reviews-list">
            <div className="review-item">
              <img className="review-avatar" src={activeReviewItem.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt={activeReviewItem.name} />
              <div className="review-body">
                <div className="review-heading-row">
                  <div className="reviewer-name">{activeReviewItem.name}</div>
                  <div className="review-stars" aria-label={`${activeReviewItem.stars || 5} star review`}>
                    {Array.from({ length: 5 }, (_, idx) => (
                      <span key={idx} className={`review-star${idx < (activeReviewItem.stars || 5) ? ' filled' : ''}`}>★</span>
                    ))}
                  </div>
                </div>
                <div className="review-text">{activeReviewItem.review}</div>
              </div>
            </div>
          </div>
          <div className="reviews-dots">
            {footerReviews.map((_, idx) => (
              <span
                key={footerReviews[idx].id || idx}
                className={`dot${activeReview === idx ? ' active' : ''}`}
                onClick={() => setActiveReview(idx)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
        <div className="footer-col menu-col">
          <h3>MENU</h3>
          <ul>
            {footerMenuItems.map((item) => (
              <li key={item.id}>
                {isExternalHref(item.href) ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
                ) : (
                  <Link to={item.href}>{item.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col host-col">
          <div className="footer-host-brand">
            <div className="footer-host-logo">
              <svg width="46" height="46" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="48" height="48" rx="8" fill="#2d3e50"/>
                <text x="30" y="38" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fff">Apex</text>
              </svg>
              <span className="footer-host-logo-text">Hotel & Resorts</span>
            </div>
          </div>
          <h3>WE ALSO HOST</h3>
          <div className="host-logos">
            {partnerLogosState.map((p, i) => (
              <img className="host-logo" src={p.src} alt={p.alt} key={i} />
            ))}
          </div>
          {socialLinks.length > 0 && (
            <div className="host-social-block">
              <span>FOLLOW US</span>
              <div className="footer-social-icons">
                {socialLinks.map((socialLink) => (
                  <a
                    href={socialLink.href}
                    key={socialLink.key}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: socialLink.color }}
                    aria-label={socialLink.label}
                  >
                    <SocialIcon type={socialLink.key} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="footer-social-row">
        <div className="footer-payments">
          {paymentLogos.map((p, i) => (
            <img className="payment-logo" src={p.src} alt={p.alt} key={i} />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
