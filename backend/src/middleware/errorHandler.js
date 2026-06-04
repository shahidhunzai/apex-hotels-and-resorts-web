const errorHandler = (err, _req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Total upload is too large. Each image must be 4 MB or smaller - please reduce image sizes and try again.',
    });
  }
  return next(err);
};

module.exports = {
  errorHandler,
};
