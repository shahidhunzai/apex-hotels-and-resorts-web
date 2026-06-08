import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-illustration">⚠️</div>
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-description">
          Sorry, the page you are looking for doesn't exist. It might have been removed, moved, or the URL might be incorrect.
        </p>

        <div className="error-suggestions">
          <h3>What you can do:</h3>
          <ul>
            <li>Check the URL and try again</li>
            <li>Return to the homepage</li>
            <li>Browse our destinations</li>
            <li>Contact our support team for help</li>
          </ul>
        </div>

        <div className="error-buttons">
          <Link to="/" className="btn btn-primary">Go to Homepage</Link>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
