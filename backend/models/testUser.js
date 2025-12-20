import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import mongoose from 'mongoose';
import User from './User.js';

console.log('Mongo URI:', process.env.MONGO_URI); 

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    
    await User.deleteOne({ email: 'test@example.com' });

    let newUser = new User({
      email: 'test@example.com',
      password: 'ayushjfo'
    });

    await newUser.save();
    console.log('User saved:', newUser);

    const savedUser = await User.findOne({ email: 'test@example.com' }).select('+password');
    console.log('Stored password:', savedUser.password);

    console.log('Password match?', await savedUser.comparePassword('mySecret123'));
    console.log('Wrong password match?', await savedUser.comparePassword('wrongPassword'));

    console.log('User JSON:', savedUser.toJSON());

  } catch (err) {
    console.log(err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
