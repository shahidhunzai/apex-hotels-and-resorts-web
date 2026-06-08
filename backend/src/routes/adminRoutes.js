const express = require('express');

const createAdminRoutes = ({ authorizeAdmin, adminController, rateLimiters }) => {
  const router = express.Router();
  const { loginLimiter, adminLimiter } = rateLimiters;

  router.post('/admin/login', loginLimiter, adminController.login);
  router.post('/admin/upload', adminLimiter, authorizeAdmin, adminController.upload);
  router.put('/admin/cms', adminLimiter, authorizeAdmin, adminController.updateCms);
  router.post('/admin/seed', adminLimiter, authorizeAdmin, adminController.seedCms);
  router.get('/admin/bookings', adminLimiter, authorizeAdmin, adminController.getBookings);
  router.patch('/admin/bookings/:id/status', adminLimiter, authorizeAdmin, adminController.updateBookingStatus);
  router.patch('/admin/bookings/:id', adminLimiter, authorizeAdmin, adminController.updateBooking);
  router.patch('/admin/account', adminLimiter, authorizeAdmin, adminController.updateAccount);

  return router;
};

module.exports = {
  createAdminRoutes,
};
