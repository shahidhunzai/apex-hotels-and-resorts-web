const createRouteRegistry = ({ app, publicController, adminController, authorizeAdmin, rateLimiters }) => {
  const { createPublicRoutes } = require('./publicRoutes');
  const { createAdminRoutes } = require('./adminRoutes');
  const { notFoundHandler } = require('../middleware/notFound');

  app.get('/', publicController.root);
  app.use('/api', createPublicRoutes({ publicController }));
  app.use('/api', createAdminRoutes({ authorizeAdmin, adminController, rateLimiters }));
  
  // 404 handler - must be last
  app.use(notFoundHandler);
};

module.exports = {
  createRouteRegistry,
};
