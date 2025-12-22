import express from 'express';
import { createAppointment, getAppointments, approveAppointment, rejectAppointment } from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.post('/', authMiddleware, createAppointment); // host creates
router.get('/', authMiddleware, getAppointments);   // all appointments
router.patch('/:id/approve', authMiddleware, authorizeRoles('admin','employee'), approveAppointment);
router.patch('/:id/reject', authMiddleware, authorizeRoles('admin','employee'), rejectAppointment);

export default router;