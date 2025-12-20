// seed.js - Demo data seeder
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Visitor from './models/Visitor.js';
import Appointment from './models/Appointment.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    
    await User.deleteMany();
    await Visitor.deleteMany();
    await Appointment.deleteMany();

    
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
      { name: 'Security User', email: 'security@example.com', password: 'password123', role: 'security' },
      { name: 'Employee User', email: 'employee@example.com', password: 'password123', role: 'employee' }
    ]);

    const visitors = await Visitor.insertMany([
      { name: 'John Visitor', email: 'johnv@example.com', phone: '1234567890', createdBy: users[0]._id },
      { name: 'Jane Visitor', email: 'janev@example.com', phone: '0987654321', createdBy: users[2]._id }
    ]);

    
    await Appointment.insertMany([
      { visitor: visitors[0]._id, host: users[2]._id, scheduledDate: new Date(), notes: 'Meeting' },
      { visitor: visitors[1]._id, host: users[2]._id, scheduledDate: new Date(), status: 'approved', notes: 'Interview' }
    ]);

    console.log('Demo data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();