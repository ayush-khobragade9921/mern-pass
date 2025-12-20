import Appointment from '../models/Appointment.js';
import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({ 
      ...req.body, 
      host: req.user._id 
    });
    await appointment.save();
    
    // Populate for response
    await appointment.populate('visitor', 'name email phone');
    await appointment.populate('host', 'name email');
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all appointments with filters
export const getAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date
    if (date) {
      query.scheduledDate = { $gte: new Date(date) };
    }

    const appointments = await Appointment.find(query)
      .populate('visitor', 'name email phone')
      .populate('host', 'name email')
      .sort({ scheduledDate: -1 });
      
    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Approve appointment
export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor', 'name email')
      .populate('host', 'name email');
      
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update status
    appointment.status = 'approved';
    await appointment.save();

    // Send email notification (if email is configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: appointment.visitor.email,
          subject: 'Appointment Approved',
          html: `
            <h2>Appointment Approved</h2>
            <p>Dear ${appointment.visitor.name},</p>
            <p>Your appointment scheduled for ${new Date(appointment.scheduledDate).toLocaleDateString()} has been approved.</p>
            <p>Host: ${appointment.host.name}</p>
            <p>Please arrive on time.</p>
          `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Email error:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        // Don't fail the request if email fails
      }
    }

    res.json({
      message: 'Appointment approved successfully',
      appointment
    });
  } catch (err) {
    console.error('Approve appointment error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get single appointment
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor', 'name email phone')
      .populate('host', 'name email');
      
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reject appointment
export const rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'rejected';
    await appointment.save();

    res.json({
      message: 'Appointment rejected',
      appointment
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};