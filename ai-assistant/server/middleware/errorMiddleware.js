/**
 * Centralized error handling middleware
 * Sanitizes internal server and API errors to avoid exposing sensitive keys or stack traces
 */
const errorHandler = (err, req, res, next) => {
  console.error('[AI Assistant Server Error]:', err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: 'AI service is temporarily unavailable. Please try again in a moment.',
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found - ${req.originalUrl}`,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
