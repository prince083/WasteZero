const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../utils/emailService');

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

async function register(req, res) {
  try {
    const { name, email, password, role, skills, bio, location, address, securityCode } = req.body;
    if (!name || !email || !password || !role || !address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (role === 'admin') {
      if (!securityCode || securityCode !== process.env.ADMIN_SECURITY_CODE) {
        return res.status(403).json({ message: "Security code didn't match. You can't register as admin." });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      skills,
      bio,
      location,
      address,
      otp,
      otpExpires,
      isVerified: false
    });

    try {
      await sendVerificationEmail(email, otp, 'Your Registration OTP');
      return res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.', email: email });
    } catch (emailError) {
      // If email fails, user exists but can't verify. Maybe delete user or just return error?
      // For simplicity, returning error but user is created. They can try login (which will resend OTP).
      return res.status(500).json({ message: 'Registration successful but failed to send OTP email.' });
    }

  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate and send OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
      await sendVerificationEmail(email, otp, 'Your Login OTP');

      return res.status(200).json({ message: 'OTP sent to your email.', email: email });
    } catch (emailError) {
      return res.status(500).json({ message: 'Failed to send OTP email.' });
    }

  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // OTP is valid
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });

    const out = user.toJSON ? user.toJSON() : user;
    return res.json({ message: 'Verification successful', token, user: out });

  } catch (err) {
    console.error('verifyOTP error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function verifyAdminCode(req, res) {
  try {
    const { securityCode } = req.body;
    if (!securityCode || securityCode !== process.env.ADMIN_SECURITY_CODE) {
      return res.status(403).json({ success: false, message: "Security code didn't match." });
    }
    return res.status(200).json({ success: true, message: "Security code verified." });
  } catch (err) {
    console.error('verifyAdminCode error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { register, login, verifyOTP, verifyAdminCode };
