import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,  // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production'? 'true':'lax',  // CSRF protection
      maxAge: 24 * 60 * 60 * 1000  // 1 day in milliseconds
    });

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const logoutUser = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};
