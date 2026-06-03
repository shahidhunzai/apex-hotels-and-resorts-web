const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    dateFrom: { type: String, required: true },
    dateTo: { type: String, required: true },
    persons: { type: String, required: true },
    roomName: { type: String, required: true, trim: true },
    resortName: { type: String, required: true, trim: true },
    status: { type: String, default: 'new' },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
