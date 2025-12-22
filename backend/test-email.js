// Test Email Configuration
// File: backend/test-email.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set (hidden)' : '❌ Not set');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_USER or EMAIL_PASS not found in .env file!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: '🧪 Test Email from Visitor Management System',
  html: `
    <h2>✅ Email Configuration Working!</h2>
    <p>If you receive this email, your configuration is correct.</p>
    <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
  `
};

console.log('Sending test email...');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ EMAIL FAILED!');
    console.log('Error:', error.message);
    console.log('Full error:', error);
  } else {
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Response:', info.response);
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox:', process.env.EMAIL_USER);
  }
  process.exit(error ? 1 : 0);
});