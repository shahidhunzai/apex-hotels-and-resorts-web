const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { env, logOptionalEnvWarnings, validateCriticalEnv } = require('./config/env');
const { uploadsDir, bookingsFile, cmsFile, ensureUploadsDir, ensureDataDir } = require('./config/paths');
const { createAuthMiddleware } = require('./middleware/auth');
const { createRateLimiters } = require('./middleware/rateLimit');
const { createSecurityMiddleware } = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const { createBootstrapService } = require('./services/bootstrapService');
const { createMailerService } = require('./services/mailerService');
const { createCmsService } = require('./services/cmsService');
const { createBookingService } = require('./services/bookingService');
const { createAdminController } = require('./controllers/adminController');
const { createPublicController } = require('./controllers/publicController');
const { createRouteRegistry } = require('./routes');

validateCriticalEnv();
logOptionalEnvWarnings();
ensureUploadsDir();

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(...createSecurityMiddleware());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));

const { authorizeAdmin, issueAdminToken } = createAuthMiddleware({
  adminApiKey: env.adminApiKey,
  jwtSecret: env.jwtSecret,
});
const rateLimiters = createRateLimiters();

const bootstrapService = createBootstrapService({
  adminUsername: env.adminUsername,
  adminPassword: env.adminPassword,
  bookingsFile,
  cmsFile,
  ensureDataDir,
});

const mailerService = createMailerService({
  smtpHost: env.smtpHost,
  smtpPort: env.smtpPort,
  smtpSecure: env.smtpSecure,
  smtpUser: env.smtpUser,
  smtpPass: env.smtpPass,
  fromEmail: env.fromEmail,
  adminEmail: env.adminEmail,
});

const cmsService = createCmsService({
  cmsFile,
  ensureDataDir,
});

const bookingService = createBookingService({
  mailerService,
});

const adminController = createAdminController({
  issueAdminToken,
  jwtExpiresIn: env.jwtExpiresIn,
  cmsService,
  bookingService,
  uploadsDir,
});

const publicController = createPublicController({
  cmsService,
  bookingService,
  mailerService,
  googlePlacesApiKey: env.googlePlacesApiKey,
});

createRouteRegistry({
  app,
  publicController,
  adminController,
  authorizeAdmin,
  rateLimiters,
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB.');
    await bootstrapService.migrateJsonToMongoIfNeeded();
    await bootstrapService.ensureAdminUser();

    app.listen(env.port, () => {
      console.log(`SMTP backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

module.exports = {
  app,
  startServer,
};
