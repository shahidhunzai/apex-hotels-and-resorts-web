const Booking = require('../models/Booking');
const {
  normalizeBookingValue,
  getBookingRoomKey,
  normalizeIsoDate,
  getTodayIsoDate,
  isActiveBooking,
} = require('../utils/booking');

const toBookingDto = (item) => ({
  id: item.bookingId,
  bookingId: item.bookingId,
  fullName: item.fullName,
  email: item.email,
  mobile: item.mobile,
  dateFrom: item.dateFrom,
  dateTo: item.dateTo,
  persons: item.persons,
  roomName: item.roomName,
  resortName: item.resortName,
  status: item.status,
  error: item.error,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const createBookingService = ({ mailerService }) => {
  const listAdminBookings = async () => {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    return bookings.map(toBookingDto);
  };

  const updateBookingStatus = async ({ id, status, resendNotifications }) => {
    const existing = await Booking.findOne({ bookingId: id }).lean();
    if (!existing) {
      const error = new Error('Booking not found.');
      error.status = 404;
      throw error;
    }

    const updated = await Booking.findOneAndUpdate(
      { bookingId: id },
      { $set: { status } },
      { returnDocument: 'after' }
    ).lean();

    let notifications = {
      confirmationEmailSent: false,
    };

    if (updated && updated.status === 'confirmed' && (existing.status !== 'confirmed' || resendNotifications)) {
      try {
        await mailerService.sendConfirmedBookingEmail(updated);
        notifications.confirmationEmailSent = true;
      } catch (emailError) {
        console.error(`Failed to send booking confirmation email for ${updated.bookingId}:`, emailError);
        notifications = {
          confirmationEmailSent: false,
          emailError: emailError?.message || 'Failed to send confirmation email.',
        };
      }
    }

    return {
      booking: toBookingDto(updated),
      notifications,
    };
  };

  const updateBookingDetails = async ({ id, dateFrom, dateTo, persons }) => {
    const normFrom = normalizeIsoDate(dateFrom);
    const normTo = normalizeIsoDate(dateTo);

    if (!normFrom || !normTo) {
      const error = new Error('Invalid date format for dateFrom or dateTo.');
      error.status = 400;
      throw error;
    }

    const todayIso = getTodayIsoDate();
    if (todayIso && normFrom < todayIso) {
      const error = new Error('dateFrom cannot be in the past.');
      error.status = 400;
      throw error;
    }

    if (new Date(normTo) <= new Date(normFrom)) {
      const error = new Error('dateTo must be at least one day after dateFrom.');
      error.status = 400;
      throw error;
    }

    const updated = await Booking.findOneAndUpdate(
      { bookingId: id },
      { $set: { dateFrom: normFrom, dateTo: normTo, persons: persons || undefined } },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) {
      const error = new Error('Booking not found.');
      error.status = 404;
      throw error;
    }

    return {
      booking: toBookingDto(updated),
    };
  };

  const getAvailability = async ({ resortName }) => {
    const resortQuery = normalizeBookingValue(resortName || '');
    const confirmed = await Booking.find({ status: { $regex: /^confirmed$/i } }).lean();

    const unavailableRooms = confirmed
      .filter((item) => {
        if (!isActiveBooking(item)) return false;
        if (!resortQuery) return true;
        return normalizeBookingValue(item.resortName) === resortQuery;
      })
      .map((item) => ({
        id: item.bookingId,
        roomName: item.roomName,
        resortName: item.resortName,
        dateFrom: normalizeIsoDate(item.dateFrom) || String(item.dateFrom || ''),
        dateTo: normalizeIsoDate(item.dateTo) || String(item.dateTo || ''),
        key: getBookingRoomKey(item.roomName, item.resortName),
      }));

    return { unavailableRooms };
  };

  const createBooking = async ({ fullName, email, mobile, dateFrom, dateTo, persons, roomName, resortName }) => {
    const normFrom = normalizeIsoDate(dateFrom);
    const normTo = normalizeIsoDate(dateTo);

    if (!normFrom || !normTo) {
      const error = new Error('Invalid date format for dateFrom or dateTo.');
      error.status = 400;
      throw error;
    }

    const todayIso = getTodayIsoDate();
    if (todayIso && normFrom < todayIso) {
      const error = new Error('dateFrom cannot be in the past.');
      error.status = 400;
      throw error;
    }

    if (new Date(normTo) <= new Date(normFrom)) {
      const error = new Error('dateTo must be at least one day after dateFrom.');
      error.status = 400;
      throw error;
    }

    const bookingRecord = {
      bookingId: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      fullName,
      email,
      mobile,
      dateFrom: normFrom,
      dateTo: normTo,
      persons,
      roomName,
      resortName,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const roomKey = getBookingRoomKey(roomName, resortName);
    const confirmedRooms = await Booking.find({ status: { $regex: /^confirmed$/i } }).lean();
    const checkIn = new Date(normFrom);
    const checkOut = new Date(normTo);

    const conflictingBooking = confirmedRooms.find((row) => {
      if (getBookingRoomKey(row.roomName, row.resortName) !== roomKey) return false;
      if (!row.dateFrom || !row.dateTo) return false;
      const bookingFrom = new Date(row.dateFrom);
      const bookingTo = new Date(row.dateTo);
      return checkIn < bookingTo && checkOut > bookingFrom;
    });

    if (conflictingBooking) {
      const error = new Error('This room is already confirmed for the selected dates and not available right now.');
      error.status = 409;
      throw error;
    }

    try {
      await mailerService.sendBookingEmails({
        fullName,
        email,
        mobile,
        dateFrom,
        dateTo,
        persons,
        roomName,
        resortName,
      });

      await Booking.create({ ...bookingRecord, status: 'new' });
      return { success: true };
    } catch (error) {
      await Booking.create({
        ...bookingRecord,
        status: 'email_failed',
        error: error?.message || 'Unknown SMTP error',
      });
      const sendError = new Error('Failed to send booking emails.');
      sendError.status = 500;
      throw sendError;
    }
  };

  return {
    listAdminBookings,
    updateBookingStatus,
    updateBookingDetails,
    getAvailability,
    createBooking,
  };
};

module.exports = {
  createBookingService,
};
