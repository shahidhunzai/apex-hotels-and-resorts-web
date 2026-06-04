const rateLimit = require('express-rate-limit');

const createRateLimiters = () => {
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again later.' },
  });

  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many admin requests. Please slow down and try again.' },
  });

  return {
    loginLimiter,
    adminLimiter,
  };
};

module.exports = {
  createRateLimiters,
};
