const bcrypt = require('bcryptjs');
const CmsData = require('../models/CmsData');
const Booking = require('../models/Booking');
const AdminUser = require('../models/AdminUser');
const { readJsonArray, readJsonObject } = require('../utils/jsonStore');

const createBootstrapService = ({ adminUsername, adminPassword, bookingsFile, cmsFile, ensureDataDir }) => {
  const migrateJsonToMongoIfNeeded = async () => {
    ensureDataDir();

    const cmsCount = await CmsData.countDocuments();
    if (cmsCount === 0) {
      const cms = readJsonObject(cmsFile);
      if (cms) {
        await CmsData.create({
          key: 'main',
          destinations: Array.isArray(cms?.destinations) ? cms.destinations : [],
          homePage: cms?.homePage && typeof cms.homePage === 'object' ? cms.homePage : {},
          reviews: Array.isArray(cms?.reviews) ? cms.reviews : [],
          destinationsPage: cms?.destinationsPage && typeof cms.destinationsPage === 'object' ? cms.destinationsPage : {},
          listingsPage: cms?.listingsPage && typeof cms.listingsPage === 'object' ? cms.listingsPage : {},
          getawaysPage: cms?.getawaysPage && typeof cms.getawaysPage === 'object' ? cms.getawaysPage : {},
        });
      }
    }

    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      const bookings = readJsonArray(bookingsFile);
      if (Array.isArray(bookings) && bookings.length > 0) {
        const docs = bookings.map((item) => ({
          bookingId: item.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          fullName: item.fullName || '',
          email: item.email || '',
          mobile: item.mobile || '',
          dateFrom: item.dateFrom || '',
          dateTo: item.dateTo || '',
          persons: String(item.persons || ''),
          roomName: item.roomName || '',
          resortName: item.resortName || '',
          status: item.status || 'new',
          error: item.error || '',
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        }));
        await Booking.insertMany(docs, { ordered: false });
      }
    }
  };

  const ensureAdminUser = async () => {
    const existing = await AdminUser.findOne({ username: adminUsername });
    if (existing) {
      const isPasswordInSync = await bcrypt.compare(adminPassword, existing.passwordHash);
      if (!isPasswordInSync) {
        existing.passwordHash = await bcrypt.hash(adminPassword, 12);
        existing.isActive = true;
        await existing.save();
        console.log('Default admin password hash synced from environment.');
      }
      return existing;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const created = await AdminUser.create({
      username: adminUsername,
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    return created;
  };

  return {
    migrateJsonToMongoIfNeeded,
    ensureAdminUser,
  };
};

module.exports = {
  createBootstrapService,
};
