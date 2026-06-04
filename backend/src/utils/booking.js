const normalizeBookingValue = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const normalizeResort = (name) => normalizeBookingValue(name).replace(/\s+resort\s*$/i, '').trim();
const normalizeRoom = (name) => normalizeBookingValue(name).replace(/\s+room\s*$/i, '').trim();
const getBookingRoomKey = (roomName, resortName) => `${normalizeRoom(roomName)}::${normalizeResort(resortName)}`;

const normalizeIsoDate = (value) => {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch (_error) {
    return null;
  }
};

const getTodayIsoDate = () => normalizeIsoDate(new Date());

const isActiveBooking = (item) => {
  if (!item?.dateFrom || !item?.dateTo) return false;
  const today = new Date();
  const bookingTo = new Date(item.dateTo);
  if (Number.isNaN(bookingTo.getTime())) return false;
  return bookingTo >= today;
};

module.exports = {
  normalizeBookingValue,
  getBookingRoomKey,
  normalizeIsoDate,
  getTodayIsoDate,
  isActiveBooking,
};
