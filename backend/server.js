const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const { env, logOptionalEnvWarnings, validateCriticalEnv } = require('./src/config/env');
const { uploadsDir, bookingsFile, cmsFile, ensureUploadsDir, ensureDataDir } = require('./src/config/paths');
const { createAuthMiddleware } = require('./src/middleware/auth');
const { createRateLimiters } = require('./src/middleware/rateLimit');
const { createBootstrapService } = require('./src/services/bootstrapService');
const { createMailerService } = require('./src/services/mailerService');
const { createCmsService } = require('./src/services/cmsService');
const { createBookingService } = require('./src/services/bookingService');
const { createAdminController } = require('./src/controllers/adminController');
const { createPublicController } = require('./src/controllers/publicController');
const { createRouteRegistry } = require('./src/routes');

const app = express();
const PORT = env.port || 5001;
const MAX_DB_ATTEMPTS = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const validateEnvAtStartup = () => {
	validateCriticalEnv();

	const required = ['MONGODB_URI', 'FRONTEND_ORIGIN'];
	const missing = required.filter((key) => !String(process.env[key] || '').trim());
	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
};

const getCorsOrigins = () => String(env.frontendOrigin || '')
	.split(',')
	.map((item) => item.trim())
	.filter(Boolean);

const allowedOrigins = getCorsOrigins();

const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or curl)
		if (!origin) return callback(null, true);
		// Allow Vercel preview deployments (contains .vercel.app)
		if (origin.includes('.vercel.app')) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error('CORS origin not allowed'));
	},
	credentials: true,
};

// Ensure uploads directory exists before any upload attempt.
ensureUploadsDir();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());
app.use(cookieParser());
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

const cmsService = createCmsService({
	cmsFile,
	ensureDataDir,
});

const backendPublicBaseUrl = String(process.env.PUBLIC_BASE_URL || '').trim() || 
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);

const mailerService = createMailerService({
	smtpHost: env.smtpHost,
	smtpPort: env.smtpPort,
	smtpSecure: env.smtpSecure,
	smtpUser: env.smtpUser,
	smtpPass: env.smtpPass,
	fromEmail: env.fromEmail,
	adminEmail: env.adminEmail,
	logoPath: env.emailLogoPath,
	logoUrl: env.emailLogoUrl,
	publicBaseUrl: backendPublicBaseUrl,
	getBrandLogo: async () => {
		const cms = await cmsService.getCms();
		return cms?.homePage?.brandLogo || '';
	},
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

app.get('/', (_req, res) => {
	res.json({
		status: 'ok',
		service: 'roomy-backend',
		message: 'Backend is running. Use /api/vercel-health for health status.',
	});
});

// Health check endpoint for Vercel
app.get('/api/vercel-health', (req, res) => {
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
		vercel: !!process.env.VERCEL,
		mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
	});
});

app.use((req, res) => {
	res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
	if (res.headersSent) return;

	if (err?.type === 'entity.too.large') {
		res.status(413).json({
			error: 'Total upload is too large. Each image must be 4 MB or smaller - please reduce image sizes and try again.',
		});
		return;
	}

	const statusCode = Number(err?.status) || 500;
	const message = statusCode >= 500 ? 'Internal server error' : (err?.message || 'Request failed');

	if (statusCode >= 500) {
		console.error('Unhandled server error:', err);
	}

	res.status(statusCode).json({ error: message });
});

const connectToMongoWithRetry = async (attempt = 1) => {
	try {
		await mongoose.connect(env.mongoUri, { 
			serverSelectionTimeoutMS: 8000,
			// Add these for serverless environments
			maxPoolSize: 10,
			minPoolSize: 2
		});
		console.log('Connected to MongoDB.');
	} catch (error) {
		if (attempt >= MAX_DB_ATTEMPTS) {
			throw new Error(`MongoDB connection failed after ${MAX_DB_ATTEMPTS} attempts: ${error.message}`);
		}

		console.warn(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
		await sleep(2000);
		await connectToMongoWithRetry(attempt + 1);
	}
};

let server;

const startServer = async () => {
	try {
		validateEnvAtStartup();
		logOptionalEnvWarnings();

		await connectToMongoWithRetry();
		
		// Skip file-based migrations on Vercel (use MongoDB only)
		if (!process.env.VERCEL) {
			await bootstrapService.migrateJsonToMongoIfNeeded();
		}
		await bootstrapService.ensureAdminUser();

		// Only start listening if not on Vercel (Vercel handles this)
		if (!process.env.VERCEL) {
			server = app.listen(PORT, () => {
				console.log(`API backend running on ${backendPublicBaseUrl}`);
			});
		} else {
			console.log(`API backend ready on Vercel: ${backendPublicBaseUrl}`);
		}
	} catch (error) {
		console.error('Failed to start backend:', error.message);
		if (!process.env.VERCEL) {
			process.exit(1);
		} else {
			throw error; // Let Vercel handle the error
		}
	}
};

const gracefulShutdown = async (signal) => {
	console.log(`Received ${signal}. Starting graceful shutdown...`);

	try {
		if (server) {
			await new Promise((resolve, reject) => {
				server.close((error) => {
					if (error) return reject(error);
					return resolve();
				});
			});
		}

		await mongoose.connection.close(false);
		console.log('Graceful shutdown complete.');
		process.exit(0);
	} catch (error) {
		console.error('Error during graceful shutdown:', error.message);
		process.exit(1);
	}
};

// Only add shutdown handlers in non-serverless environment
if (!process.env.VERCEL) {
	process.on('SIGTERM', () => {
		gracefulShutdown('SIGTERM');
	});

	process.on('SIGINT', () => {
		gracefulShutdown('SIGINT');
	});
}

// For Vercel serverless deployment
if (process.env.VERCEL) {
	// Initialize on first request
	let initializationPromise = null;
	
	const initialize = async () => {
		if (!initializationPromise) {
			initializationPromise = startServer();
		}
		return initializationPromise;
	};
	
	// Wrap the app for Vercel
	module.exports = async (req, res) => {
		try {
			await initialize();
			app(req, res);
		} catch (error) {
			console.error('Vercel function error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	};
} else {
	startServer();
	module.exports = { app, startServer };
}