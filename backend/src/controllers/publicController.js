const { fetchGoogleReviews } = require('../services/googleReviewsService');

const createPublicController = ({ cmsService, bookingService, mailerService, googlePlacesApiKey }) => {
  const root = (_req, res) => {
    res.status(200).json({
      ok: true,
      message: 'Roomy backend is running. Frontend is available at http://localhost:3000',
      health: '/api/health',
      cms: '/api/cms',
    });
  };

  const health = (_req, res) => {
    res.json({ ok: true });
  };

  const getCms = async (_req, res) => {
    try {
      const cms = await cmsService.getCms();
      return res.json(cms);
    } catch (_error) {
      return res.status(500).json({ error: 'Failed to load CMS data.' });
    }
  };

  const getGoogleReviews = async (req, res) => {
    const placeId = String(req.query?.placeId || '').trim();
    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required.' });
    }

    if (!googlePlacesApiKey) {
      return res.status(503).json({ error: 'Google Places API is not configured.' });
    }

    try {
      const payload = await fetchGoogleReviews({ placeId, apiKey: googlePlacesApiKey });
      return res.json(payload);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch Google reviews.' });
    }
  };

  const getBookingAvailability = async (req, res) => {
    try {
      const payload = await bookingService.getAvailability({ resortName: req.query?.resortName || '' });
      return res.json(payload);
    } catch (_error) {
      return res.status(500).json({ error: 'Failed to fetch booking availability.' });
    }
  };

  const contact = async (req, res) => {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: 'Missing required contact fields.' });
    }

    try {
      await mailerService.sendContactEmails({ name, email, phone, subject, message });
      return res.status(200).json({ success: true });
    } catch (_error) {
      return res.status(500).json({ error: 'Failed to send contact email. Please try again later.' });
    }
  };

  const createBooking = async (req, res) => {
    const { fullName, email, mobile, dateFrom, dateTo, persons, roomName, resortName } = req.body || {};

    if (!fullName || !email || !mobile || !dateFrom || !dateTo || !persons || !roomName || !resortName) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    try {
      const payload = await bookingService.createBooking({ fullName, email, mobile, dateFrom, dateTo, persons, roomName, resortName });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message || 'Failed to send booking emails.' });
    }
  };

  return {
    root,
    health,
    getCms,
    getGoogleReviews,
    getBookingAvailability,
    contact,
    createBooking,
  };
};

module.exports = {
  createPublicController,
};
