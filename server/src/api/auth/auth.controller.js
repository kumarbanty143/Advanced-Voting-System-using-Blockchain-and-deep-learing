// server/src/api/auth/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../../config/database');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, voterId, aadhaarId } = req.body;
    
    // Check if user already exists
    const [userCheck] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR voter_id = ? OR aadhaar_id = ?',
      [email, voterId, aadhaarId]
    );
    
    if (userCheck.length > 0) {
      return res.status(400).json({ 
        message: 'User already exists with this email, Voter ID, or Aadhaar number' 
      });
    }
    
    // Determine constituency based on Voter ID (simplified for demo)
    // In a real application, this would involve a lookup against electoral database
    const constituency = 'East Delhi';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, voter_id, aadhaar_id, constituency) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, voterId, aadhaarId, constituency]
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertId
    });
    
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.is_verified === 1, // Convert to boolean (MySQL stores as 0/1)
      constituency: user.constituency
    };
    
    // Sign token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: payload
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify token and return user
exports.verify = async (req, res, next) => {
  try {
    // User is already attached to req by passport middleware
    const user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.is_verified === 1, // Convert to boolean
      constituency: req.user.constituency
    };
    
    res.status(200).json({
      success: true,
      user
    });
    
  } catch (error) {
    next(error);
  }
};