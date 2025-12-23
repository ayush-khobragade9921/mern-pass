import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';  // ← ADDED FOR PDF SERVING
import { fileURLToPath } from 'url';  // ← ADDED FOR PDF SERVING

dotenv.config();   

import mongoose from 'mongoose';

import userRoutes from './routes/userRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import passRoutes from './routes/passRoutes.js';
import checkLogRoutes from './routes/checkLogRoutes.js';

import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// ← ADDED FOR PDF SERVING
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100 
// });
// app.use(limiter);

app.use(
cors({
origin: (origin, callback) => {
// Allow requests with no origin (like mobile apps or curl requests)
if (!origin) return callback(null, true);


  const allowedOrigins = [
    "[localhost:5173](http://localhost:5173)",
    "[localhost:3000](http://localhost:3000)",
    "[localhost:5174](http://localhost:5174)",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    // For development, allow [localhost](http://localhost) with any port
    if (
      origin.startsWith("[localhost](http://localhost):") ||
      origin.startsWith("[localhost](https://localhost):")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
},
credentials: true,
})
);

app.use(express.json());

app.use(cookieParser());

// ← ADDED: Serve static files from uploads folder (for PDF downloads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('Visitor Pass Backend Running...'));

app.use('/api/users', userRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/checklogs', checkLogRoutes);

app.use(errorHandler);

 
console.log("JWT Loaded:", process.env.JWT_SECRET);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));