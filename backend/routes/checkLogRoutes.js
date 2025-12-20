import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayCheckIns,
  getAllCheckLogs,
  getCheckLogById,
  getVisitorHistory,
  getCheckInStats
} from '../controllers/checkLogController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isSecurityOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Check-in - Security only
router.post('/checkin', 
  authMiddleware, 
  isSecurityOrAdmin, 
  checkIn
);

// Check-out - Security only
router.post('/checkout', 
  authMiddleware, 
  isSecurityOrAdmin, 
  checkOut
);

// Get today's check-ins - Security and Admin
router.get('/today', 
  authMiddleware, 
  isSecurityOrAdmin, 
  getTodayCheckIns
);

// Get all check logs with filters - Admin only
router.get('/', 
  authMiddleware, 
  isSecurityOrAdmin, 
  getAllCheckLogs
);

// Get check-in statistics - Admin only
router.get('/stats', 
  authMiddleware, 
  isSecurityOrAdmin, 
  getCheckInStats
);

// Get visitor history - Security and Admin
router.get('/visitor/:visitorId', 
  authMiddleware, 
  isSecurityOrAdmin, 
  getVisitorHistory
);

// Get single check log
router.get('/:id', 
  authMiddleware, 
  isSecurityOrAdmin, 
  getCheckLogById
);

export default router;