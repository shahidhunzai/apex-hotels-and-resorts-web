const helmet = require('helmet');

const createSecurityMiddleware = () => [
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
];

module.exports = {
  createSecurityMiddleware,
};
