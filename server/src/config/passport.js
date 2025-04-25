// server/src/config/passport.js
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pool = require('./database');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [jwt_payload.id]);
        
        if (users.length > 0) {
          return done(null, users[0]);
        }
        return done(null, false);
      } catch (error) {
        console.error('Error in JWT strategy:', error);
        return done(error, false);
      }
    })
  );
};