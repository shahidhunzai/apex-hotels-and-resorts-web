const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const { saveBase64Image } = require('../services/uploadService');

const createAdminController = ({
  issueAdminToken,
  jwtExpiresIn,
  cmsService,
  bookingService,
  uploadsDir,
}) => {
  const login = async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required.' });
    }

    const admin = await AdminUser.findOne({ username, isActive: true });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const matched = await bcrypt.compare(password, admin.passwordHash);
    if (!matched) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = issueAdminToken(admin, jwtExpiresIn);
    return res.json({ token, username: admin.username, role: admin.role });
  };

  const upload = async (req, res) => {
    try {
      const url = saveBase64Image({ image: req.body?.image, uploadsDir });
      return res.json({ url });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message || 'Failed to save image file.' });
    }
  };

  const updateCms = async (req, res) => {
    try {
      await cmsService.updateCms(req.body);
      return res.json({ success: true });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message || 'Failed to save CMS data.' });
    }
  };

  const seedCms = async (_req, res) => {
    try {
      await cmsService.seedCmsFromFile();
      return res.json({ success: true, message: 'CMS seeded from backend/data/cms.json' });
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message || 'Failed to seed CMS data.',
        ...(error.payload || {}),
      });
    }
  };

  const getBookings = async (_req, res) => {
    try {
      const bookings = await bookingService.listAdminBookings();
      return res.json({ bookings });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
  };

  const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const status = String(req.body?.status || '').trim().toLowerCase();
    const resendNotifications = req.body?.resendNotifications === true || req.body?.resendNotifications === 'true';

    if (!status) {
      return res.status(400).json({ error: 'status is required.' });
    }

    try {
      const result = await bookingService.updateBookingStatus({ id, status, resendNotifications });
      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message || 'Failed to update booking status.' });
    }
  };

  const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { dateFrom, dateTo, persons } = req.body || {};

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ error: 'dateFrom and dateTo are required.' });
    }

    try {
      const result = await bookingService.updateBookingDetails({ id, dateFrom, dateTo, persons });
      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message || 'Failed to update booking.' });
    }
  };

  return {
    login,
    upload,
    updateCms,
    seedCms,
    getBookings,
    updateBookingStatus,
    updateBooking,
  };
};

module.exports = {
  createAdminController,
};
