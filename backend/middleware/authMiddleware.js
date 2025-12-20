import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  let token;

  
  token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
     
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      
      req.user = await User.findById(decoded.id);
      if (!req.user) throw new Error('User not found');

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized', error: err.message });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
