const createRouteRegistry = ({ app, publicController, adminController, authorizeAdmin, rateLimiters }) => {
  const { createPublicRoutes } = require('./publicRoutes');
  const { createAdminRoutes } = require('./adminRoutes');

  app.get('/', publicController.root);
  app.use('/api', createPublicRoutes({ publicController }));
  app.use('/api', createAdminRoutes({ authorizeAdmin, adminController, rateLimiters }));
};

module.exports = {
  createRouteRegistry,
};
