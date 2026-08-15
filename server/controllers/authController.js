import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'auralink_super_secret_jwt_key', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user account
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // Check if user already exists
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    // Auto-assign ADMIN role if email/username contains 'admin' or if first registered user
    const userCount = await User.countDocuments();
    const shouldBeAdmin = userCount === 0 || cleanEmail.includes('admin') || cleanUsername.toLowerCase().includes('admin');

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: password,
      role: shouldBeAdmin ? 'ADMIN' : 'USER'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        savedResources: user.savedResources
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user by email and select passwordHash
    let user = await User.findOne({ email: cleanEmail }).select('+passwordHash');

    // Auto-create Admin user on-the-fly if logging in with an admin email or default seed credentials
    if (!user && (cleanEmail === 'admin@auralink.io' || cleanEmail.includes('admin'))) {
      user = await User.create({
        username: cleanEmail === 'admin@auralink.io' ? 'AuraAdmin' : cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordHash: password,
        role: 'ADMIN',
        bio: 'Platform Administrator'
      });
      user = await User.findOne({ _id: user._id }).select('+passwordHash');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        savedResources: user.savedResources
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedResources',
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'submittedBy', select: 'username avatar' }
      ]
    });
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        savedResources: user.savedResources,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};
