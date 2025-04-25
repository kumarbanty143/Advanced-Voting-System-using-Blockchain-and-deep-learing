// server/src/middleware/auth.middleware.js
// Admin role check middleware
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  };
  
  // Verified voter check middleware
  exports.isVerifiedVoter = (req, res, next) => {
    if (req.user && req.user.role === 'voter' && req.user.is_verified) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Verified voter status required.' });
  };