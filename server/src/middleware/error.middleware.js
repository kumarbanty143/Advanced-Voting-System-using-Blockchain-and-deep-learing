// server/src/middleware/error.middleware.js
module.exports = (err, req, res, next) => {
    console.error(err.stack);
    
    // Database error handling
    if (err.code) {
      switch (err.code) {
        case '23505': // Unique violation
          return res.status(409).json({
            message: 'Duplicate entry found',
            error: err.detail
          });
        case '23503': // Foreign key violation
          return res.status(400).json({
            message: 'Referenced record does not exist',
            error: err.detail
          });
        // Add more specific error codes as needed
      }
    }
    
    // Default error response
    res.status(err.status || 500).json({
      message: err.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };