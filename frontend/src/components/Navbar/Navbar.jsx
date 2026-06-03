import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCms } from '../../services/cmsApi';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [brandLogo, setBrandLogo] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetchCms()
      .then((cms) => {
        if (!isMounted) return;
        setBrandLogo(cms?.homePage?.brandLogo || '');
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        <Link to="/" className="logo">
          {brandLogo ? (
            <img src={brandLogo} alt="Brand logo" className="logo-image" />
          ) : (
            <div className="logo-icon"></div>
          )}
         
        </Link>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>HOME</Link>
          <Link to="/destinations" onClick={() => setIsMenuOpen(false)}>DESTINATIONS</Link>
          <Link to="/listings" onClick={() => setIsMenuOpen(false)}>HOTELS</Link>
          {/* <Link to="/about" onClick={() => setIsMenuOpen(false)}>EVENTS</Link> */}
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>CONTACT</Link>
        </div>

        <div className="nav-actions">
          <button className="btn-login"><span className="user-icon">👤</span> SIGN IN</button>
          <button type="button" className="btn-trip" onClick={() => setIsMenuOpen(false)}>
            PLAN YOUR TRIP / TOUR
          </button>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
