const toNumeric = (value) => {
  const numeric = Number(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

export const parsePrice = (value) => {
  const numeric = toNumeric(value);
  return numeric && numeric > 0 ? numeric : null;
};

export const formatPrice = (value) => {
  const parsed = parsePrice(value);
  return parsed ? parsed.toLocaleString('en-PK') : 'Contact';
};

export const parseDiscountPercent = (value) => {
  const numeric = toNumeric(value);
  if (!numeric) return 0;
  return Math.min(90, Math.max(0, numeric));
};

export const getRoomPricing = (room) => {
  const basePrice = parsePrice(room?.price);
  const discountPercent = parseDiscountPercent(room?.discountPercent);
  const hasDiscount = Boolean(basePrice && discountPercent > 0);
  const discountedPrice = hasDiscount
    ? Math.max(0, Math.round(basePrice * (1 - discountPercent / 100)))
    : basePrice;

  return {
    basePrice,
    discountedPrice,
    discountPercent,
    hasDiscount,
    formattedBasePrice: formatPrice(basePrice),
    formattedDiscountedPrice: formatPrice(discountedPrice),
    discountNote: String(room?.discountNote || '').trim(),
  };
};