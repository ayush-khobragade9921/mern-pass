import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // employee/host
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  scheduledDate: Date,
  notes: String
}, { timestamps: true });

export default  mongoose.model('Appointment', appointmentSchema);
