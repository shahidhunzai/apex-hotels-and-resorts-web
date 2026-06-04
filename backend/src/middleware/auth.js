const jwt = require('jsonwebtoken');

const createAuthMiddleware = ({ adminApiKey, jwtSecret }) => {
  const authorizeAdmin = (req, res, next) => {
    const legacyKey = req.headers['x-admin-key'];
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (adminApiKey && legacyKey === adminApiKey) {
      return next();
    }

    if (bearerToken) {
      try {
        const payload = jwt.verify(bearerToken, jwtSecret);
        if (payload && payload.role === 'admin') {
          req.admin = payload;
          return next();
        }
      } catch (_error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    if (!bearerToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    return res.status(401).json({ error: 'Unauthorized' });
  };

  const issueAdminToken = (admin, jwtExpiresIn) =>
    jwt.sign(
      {
        sub: String(admin._id),
        username: admin.username,
        role: admin.role,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

  return {
    authorizeAdmin,
    issueAdminToken,
  };
};

module.exports = {
  createAuthMiddleware,
};
