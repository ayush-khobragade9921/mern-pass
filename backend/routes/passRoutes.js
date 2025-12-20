import express from 'express';
import { generatePass, getPass } from '../controllers/passController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all passes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const Pass = (await import('../models/Pass.js')).default;
    const passes = await Pass.find()
      .populate('visitor', 'name email phone')
      .populate('appointment', 'scheduledDate purpose')
      .populate('issuedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(passes);
  } catch (err) {
    console.error('Get passes error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Generate pass
router.post('/', authMiddleware, generatePass);

// Also support /generate endpoint for backwards compatibility
router.post('/generate', authMiddleware, generatePass);

// Get single pass
router.get('/:id', authMiddleware, getPass);

export default router;