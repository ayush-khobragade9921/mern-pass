import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'security', 'employee', 'visitor'], default: 'employee' },
  phone: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  profilePhoto: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastLogin: Date
}, { timestamps: true });


userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
