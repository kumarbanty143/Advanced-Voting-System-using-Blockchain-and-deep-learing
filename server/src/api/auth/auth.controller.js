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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Extensive logging for debugging
    console.log('Login Request Details:', {
      email,
      passwordLength: password ? password.length : 'No password provided',
      passwordType: typeof password
    });
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email with more detailed error handling
    let users;
    try {
      [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return res.status(500).json({ 
        message: 'Database error during user lookup',
        details: queryError.message
      });
    }
    
    // Check if user exists
    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Detailed user logging (be careful in production)
    console.log('User Found:', { 
      id: user.id, 
      email: user.email, 
      passwordHashLength: user.password ? user.password.length : 'No password in DB',
      passwordHashStart: user.password ? user.password.substring(0, 10) + '...' : 'N/A'
    });
    
    // Password comparison with extensive error handling
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      console.error('Bcrypt comparison error:', compareError);
      return res.status(500).json({ 
        message: 'Authentication error',
        details: compareError.message
      });
    }
    
    // Check password match
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.is_verified === 1, // Convert to boolean
      constituency: user.constituency
    };
    
    // Sign token with more robust error handling
    let token;
    try {
      token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1d' }
      );
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ 
        message: 'Token generation failed',
        details: tokenError.message
      });
    }
    
    // Successful login response
    console.log('Login successful for user:', email);
    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: payload
    });
    
  } catch (error) {
    console.error('Unexpected login error:', error);
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