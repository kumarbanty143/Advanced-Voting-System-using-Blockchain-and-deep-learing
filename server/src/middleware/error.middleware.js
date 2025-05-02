// server/src/middleware/error.middleware.js
/**
 * Central error handling middleware
 * This catches errors from routes and controllers
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error encountered:', err);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Check for specific error types
  
  // MySQL/Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Duplicate entry found. This record already exists.';
  }
  
  // MySQL unique constraint violation
  if (err.code === 'ER_DUP_KEY') {
    statusCode = 400;
    message = 'A record with this information already exists.';
  }
  
  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_ROW_IS_REFERENCED') {
    statusCode = 400;
    message = 'Cannot modify or delete this record due to existing references.';
  }
  
  // Path parameter parsing error
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }
  
  // Route parameter error
  if (err instanceof TypeError && err.message.includes('argument handler must be a function')) {
    statusCode = 500;
    message = 'Server configuration error: Invalid route handler';
    console.error('Route handler error - check your route definitions');
  }
  
  // Path-to-regexp error (missing parameter name)
  if (err instanceof TypeError && err.message.includes('Missing parameter name')) {
    statusCode = 500;
    message = 'Server configuration error: Invalid route parameter definition';
    console.error('Route parameter error - check your route path parameters');
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }
  
  // Blockchain service errors
  if (err.message && err.message.includes('blockchain')) {
    statusCode = 503;
    message = 'Blockchain service temporarily unavailable. Please try again later.';
  }
  
  // Face recognition errors
  if (err.message && err.message.includes('face')) {
    statusCode = 400;
    message = err.message || 'Face recognition error. Please try again.';
  }
  
  // Response with appropriate format
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;