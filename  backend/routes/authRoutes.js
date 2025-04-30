/*const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff'
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for user email
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;*/


const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.use((req, res, next) => {
    console.log(`✅ Request Hit authRoutes.js: ${req.method} ${req.url}`);
    next();
  });
  

// Debugging: Verify User model is loaded
console.log('✅ User Model Loaded:', User);

// Generate JWT
const generateToken = (id) => {
  console.log(`🔑 Generating JWT for User ID: ${id}`);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Debugging: Check if Routes Are Registered
console.log('🔄 Registering Auth Routes...');

// @route   GET /api/auth/test
// @desc    Test if route is accessible
// @access  Public
/*router.get('/test', (req, res) => {
  console.log('🚀 Test Route Hit in authRoutes.js');
  res.json({ message: 'Auth Route is working!' });
});*/
router.get('/test', (req, res) => {
    console.log('🚀 Test Route Hit in authRoutes.js');
    return res.json({ message: 'Auth Route is working!' });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
/*router.post('/register', async (req, res) => {
  try {
    console.log('📩 Received POST /register request');
    console.log('🔍 Request Body:', req.body);

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      console.log('❌ Missing Fields:', req.body);
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    console.log('🔎 User Exists Check:', userExists);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('🔐 Hashed Password:', hashedPassword);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
    });

    console.log('✅ User Created:', user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('❌ Error in /register:', error);
    res.status(500).json({ message: 'Server error' });
  }
});*/


/*router.post('/register', async (req, res) => {
    try {
      console.log('📩 Received POST /register request');
      console.log('🔍 Request Body:', req.body);
  
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password) {
        console.log('❌ Missing Fields:', req.body);
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
  
      console.log('🛠 Creating test user (ignoring existence check)...');
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      console.log('🔐 Hashed Password:', hashedPassword);
  
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'staff',
      });
  
      console.log('✅ Test User Created:', user);
  
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error('❌ Error in /register:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });*/


  router.post('/register', async (req, res) => {
    try {
      console.log('📩 Received POST /register request');
      console.log('🔍 Request Body:', req.body);
  
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password) {
        console.log('❌ Missing Fields:', req.body);
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
  
      console.log('🛠 Checking if user already exists...');
      const userExists = await User.findOne({ email });
      console.log('🔎 User Exists Check:', userExists);
  
      if (userExists) {
        console.log('⚠️ User already exists!');
        return res.status(400).json({ message: 'User already exists' });
      }
  
      console.log('🛠 Generating password salt...');
      const salt = await bcrypt.genSalt(10);
      console.log('✅ Salt Generated:', salt);
  
      console.log('🛠 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('🔐 Hashed Password:', hashedPassword);
  
      console.log('🛠 Creating new user...');
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'staff',
      });
  
      console.log('✅ User Created:', user);
  
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
  
    } catch (error) {
      console.error('❌ Error in /register:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
  
  
  
  
  
  
  
  
  
 
  
  
  
  

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('📩 Received POST /login request');
    console.log('🔍 Request Body:', req.body);

    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    console.log('🔎 User Found:', user);

    if (user && (await bcrypt.compare(password, user.password))) {
      console.log('✅ Login Successful for:', user.email);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      console.log('❌ Invalid Login Attempt for:', email);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('❌ Error in /login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('✅ Auth Routes Registered');

module.exports = router;
