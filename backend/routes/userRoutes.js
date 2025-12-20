import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getMe, logoutUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'security', 'employee', 'visitor']).withMessage('Invalid role')
], registerUser);  // signup
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], loginUser);        // login
router.get('/me', authMiddleware, getMe); 
router.post('/logout', authMiddleware, logoutUser);

export default router;
