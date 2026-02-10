const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'alex@atxaisolutions.net',
    pass: 'tmsw fzrm bsgf ssnx'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email
async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: 'Alex <alex@atxaisolutions.net>',
      to: 'casianig@gmail.com',
      subject: 'Test from Project X',
      text: 'Email system is working!',
      html: '<h1>Test</h1><p>Email system working!</p>'
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}

module.exports = { transporter, testEmail };
