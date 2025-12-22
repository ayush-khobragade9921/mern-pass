import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  
  photo: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
}, { timestamps: true });

export default mongoose.model('Visitor', visitorSchema);