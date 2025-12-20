import nodemailer from 'nodemailer';
import fs from 'fs';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send pass via email with PDF attachment
export const sendPassEmail = async (email, visitorName, pass, pdfPath) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Visitor Pass - Ready for Use',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .pass-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1976d2; }
            .qr-code { text-align: center; margin: 20px 0; }
            .qr-code img { max-width: 200px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 Your Visitor Pass is Ready!</h1>
            </div>
            
            <div class="content">
              <h2>Hello ${visitorName},</h2>
              <p>Your visitor pass has been generated successfully. Please find the details below:</p>
              
              <div class="pass-details">
                <h3>Pass Information</h3>
                <p><strong>Pass ID:</strong> ${pass._id}</p>
                <p><strong>Valid From:</strong> ${new Date(pass.validFrom).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
                <p><strong>Valid To:</strong> ${new Date(pass.validTo).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
              </div>

              ${pass.qrCode ? `
                <div class="qr-code">
                  <h3>Your QR Code</h3>
                  <img src="${pass.qrCode}" alt="QR Code" />
                  <p><em>Show this QR code at the security desk</em></p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <p><strong>📎 Your pass is attached as a PDF document</strong></p>
                <p>Please download and save it on your mobile device</p>
              </div>

              <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h4>📋 Important Instructions:</h4>
                <ul>
                  <li>Carry this pass (digital or printed) at all times during your visit</li>
                  <li>Present the pass at the security desk upon arrival</li>
                  <li>The QR code will be scanned for verification</li>
                  <li>Ensure you check out before leaving the premises</li>
                  <li>This pass is non-transferable</li>
                </ul>
              </div>

              <div style="background: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; margin: 20px 0;">
                <h4>ℹ️ What to Bring:</h4>
                <ul>
                  <li>Valid government-issued photo ID</li>
                  <li>This visitor pass (digital or printed)</li>
                  <li>Contact information of your host employee</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>If you have any questions, please contact the reception desk.</p>
              <p>&copy; ${new Date().getFullYear()} Visitor Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: []
    };

    // Attach PDF if available
    if (pdfPath && fs.existsSync(pdfPath)) {
      mailOptions.attachments.push({
        filename: `visitor-pass-${pass._id}.pdf`,
        path: pdfPath
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Pass email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send appointment status notification
export const sendAppointmentNotification = async (email, visitorName, appointment, status) => {
  try {
    const transporter = createTransporter();

    let subject, message, color;
    
    if (status === 'approved') {
      subject = '✅ Your Appointment has been Approved';
      message = 'Great news! Your appointment has been approved.';
      color = '#28a745';
    } else if (status === 'rejected') {
      subject = '❌ Your Appointment Status Update';
      message = 'We regret to inform you that your appointment request has been declined.';
      color = '#dc3545';
    } else {
      subject = '⏳ Your Appointment is Pending Review';
      message = 'Your appointment request is currently under review.';
      color = '#ffc107';
    }

    const mailOptions = {
      from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${color}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .appointment-details { background: white; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${subject}</h1>
            </div>
            
            <div class="content">
              <h2>Hello ${visitorName},</h2>
              <p>${message}</p>
              
              <div class="appointment-details">
                <h3>Appointment Details</h3>
                <p><strong>Date:</strong> ${new Date(appointment.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              </div>

              ${status === 'approved' ? `
                <p>Your visitor pass will be sent to you separately. Please check your email.</p>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Appointment notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send notification: ' + error.message);
  }
};

// Send check-in notification to host employee
export const sendCheckInNotification = async (hostEmail, visitorName, checkInTime) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
      to: hostEmail,
      subject: `🔔 Visitor Checked In - ${visitorName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚪 Visitor Checked In</h1>
            </div>
            
            <div class="content">
              <h2>Notification</h2>
              <p>Your visitor <strong>${visitorName}</strong> has checked in at the reception.</p>
              <p><strong>Check-in Time:</strong> ${new Date(checkInTime).toLocaleString()}</p>
              <p>Please be ready to receive your guest.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Check-in notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw error for notifications - they're non-critical
    return { success: false, error: error.message };
  }
};

// Send welcome email for new registration
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '👋 Welcome to Visitor Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome ${name}!</h1>
            </div>
            
            <div class="content">
              <h2>Registration Successful</h2>
              <p>Thank you for registering with our Visitor Management System.</p>
              <p>Your account has been created successfully. You can now request appointments and receive digital visitor passes.</p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};