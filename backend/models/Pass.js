import mongoose from 'mongoose';

const passSchema = new mongoose.Schema({
  visitor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Visitor',
    required: true
  },
  appointment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  qrCode: {
    type: String,
    required: true
  },
  pdfPath: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Pass', passSchema);