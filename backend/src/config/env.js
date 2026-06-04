const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = {
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roomy_cms',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  adminApiKey: process.env.ADMIN_API_KEY || '',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpSecure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  adminEmail: process.env.ADMIN_EMAIL,
  fromEmail: process.env.FROM_EMAIL,
  googlePlacesApiKey: String(process.env.GOOGLE_PLACES_API_KEY || '').trim(),
};

const logOptionalEnvWarnings = () => {
  const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL', 'FROM_EMAIL'];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  if (missingEnv.length > 0) {
    console.warn(`Missing SMTP env vars: ${missingEnv.join(', ')}`);
  }

  if (!env.adminApiKey) {
    console.warn('ADMIN_API_KEY is not set. Admin API key fallback is disabled; JWT auth is still required.');
  }
};

const validateCriticalEnv = () => {
  if (!env.adminPassword) {
    throw new Error('ADMIN_PASSWORD is required in backend/.env');
  }
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required in backend/.env');
  }
};

module.exports = {
  env,
  logOptionalEnvWarnings,
  validateCriticalEnv,
};
