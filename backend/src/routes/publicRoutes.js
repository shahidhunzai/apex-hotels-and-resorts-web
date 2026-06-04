const express = require('express');

const createPublicRoutes = ({ publicController }) => {
  const router = express.Router();

  router.get('/health', publicController.health);
  router.get('/cms', publicController.getCms);
  router.get('/google-reviews', publicController.getGoogleReviews);
  router.get('/bookings/availability', publicController.getBookingAvailability);
  router.post('/contact', publicController.contact);
  router.post('/bookings', publicController.createBooking);

  return router;
};

module.exports = {
  createPublicRoutes,
};
