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
      const url = await saveBase64Image({ image: req.body?.image, uploadsDir });
      const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
      const host = req.get('host');
      const absoluteUrl = /^(?:https?:\/\/|data:)/i.test(url) ? url : `${proto}://${host}${url}`;
      return res.json({ url: absoluteUrl });
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

  const updateAccount = async (req, res) => {
    const adminId = String(req.admin?.sub || '').trim();
    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const currentPassword = String(req.body?.currentPassword || '').trim();
    const newUsername = String(req.body?.newUsername || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required.' });
    }
    if (!newUsername && !newPassword) {
      return res.status(400).json({ error: 'Provide a new username or new password.' });
    }

    try {
      const admin = await AdminUser.findOne({ _id: adminId, isActive: true });
      if (!admin) {
        return res.status(404).json({ error: 'Admin user not found.' });
      }

      const matches = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!matches) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      if (newUsername && newUsername !== admin.username) {
        const exists = await AdminUser.findOne({ username: newUsername, _id: { $ne: admin._id } }).lean();
        if (exists) {
          return res.status(409).json({ error: 'Username is already in use.' });
        }
        admin.username = newUsername;
      }

      if (newPassword) {
        if (newPassword.length < 8) {
          return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }
        admin.passwordHash = await bcrypt.hash(newPassword, 12);
      }

      await admin.save();

      const token = issueAdminToken(admin, jwtExpiresIn);
      return res.json({
        success: true,
        token,
        username: admin.username,
        role: admin.role,
        message: 'Admin account updated successfully.',
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to update admin account.' });
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
    updateAccount,
  };
};

module.exports = {
  createAdminController,
};
