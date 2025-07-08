// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter using your env variable names
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Update the from address in emails
const mailOptions = {
  from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
  to,
  subject,
  html
};