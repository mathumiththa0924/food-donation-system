const nodemailer = require('nodemailer');
const path = require('path');

let transporter;
let transporterMeta = { isTest: false, previewUrl: null };

const createTransporter = async () => {
  if (transporter) return transporter;

  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    try {
      await transporter.verify();
      transporterMeta.isTest = false;
      console.log('SMTP is configured and verified. Using real email delivery.');
      return transporter;
    } catch (error) {
      transporter = null;
      console.error('SMTP verification failed. Please fix SMTP env values to send real email.', error);
      throw new Error('SMTP configuration invalid or unreachable. Real email delivery failed.');
    }
  }

  const account = await new Promise((resolve, reject) => {
    nodemailer.createTestAccount((err, account) => {
      if (err) return reject(err);
      resolve(account);
    });
  });

  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });

  transporterMeta.isTest = true;
  console.log('Using Ethereal test account. Preview emails with nodemailer.getTestMessageUrl.');

  return transporter;
};

const sendFoodAlertEmail = async (ngoEmail, ngoName, foodDetails) => {
  const transport = await createTransporter();
  if (!transport) return;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"MealBridge Admin" <adminmealbridge@gmail.com>',
    to: ngoEmail,
    subject: `🚨 New Food Donation Alert: ${foodDetails.foodName}`,
    text: `Hello ${ngoName},\n\nA new donation of ${foodDetails.quantity} ${foodDetails.unit} of ${foodDetails.foodName} has been posted in ${foodDetails.location}.\n\nLog in to MealBridge to request it before it expires at ${new Date(foodDetails.expiryTime).toLocaleString()}.\n\nThank you!`,
    html: `
      <h2>Hello ${ngoName},</h2>
      <p>A new food donation is available in your area!</p>
      <ul>
        <li><strong>Food:</strong> ${foodDetails.foodName}</li>
        <li><strong>Quantity:</strong> ${foodDetails.quantity} ${foodDetails.unit}</li>
        <li><strong>Location:</strong> ${foodDetails.location}</li>
        <li><strong>Expires At:</strong> ${new Date(foodDetails.expiryTime).toLocaleString()}</li>
      </ul>
      <p>Please log in to MealBridge to request it now.</p>
    `
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`Email sent to ${ngoEmail}. Preview URL: %s`, nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Error sending email to ${ngoEmail}:`, error);
  }
};

const sendPasswordResetEmail = async (toEmail, toName, resetCode) => {
  const transport = await createTransporter();
  if (!transport) return { previewUrl: null };

  const mailOptions = {
    from: process.env.SMTP_FROM || '"MealBridge Admin" <adminmealbridge@gmail.com>',
    to: toEmail,
    subject: 'MealBridge Password Reset Code',
    text: `Hello ${toName || 'User'},\n\nYou requested a password reset for your MealBridge account. Use the code below to reset your password:\n\n${resetCode}\n\nThis code expires in 20 minutes. If you did not request this, please ignore this email.\n\nThank you!`,
    html: `
      <h2>Hello ${toName || 'User'},</h2>
      <p>You requested a password reset for your MealBridge account.</p>
      <p><strong>Your reset code is:</strong></p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${resetCode}</p>
      <p>This code expires in 20 minutes. If you did not request this, please ignore this email.</p>
    `
  };

  const info = await transport.sendMail(mailOptions);
  const previewUrl = transporterMeta.isTest ? nodemailer.getTestMessageUrl(info) : null;
  console.log(`Password reset email sent to ${toEmail}. Preview URL: %s`, previewUrl);
  return { previewUrl };
};

const sendTwoFactorCodeEmail = async (toEmail, toName, verificationCode) => {
  const transport = await createTransporter();
  if (!transport) return { previewUrl: null };

  const mailOptions = {
    from: process.env.SMTP_FROM || '"MealBridge Admin" <adminmealbridge@gmail.com>',
    to: toEmail,
    subject: 'MealBridge Login Verification Code',
    text: `Hello ${toName || 'User'},\n\nYour MealBridge verification code is:\n\n${verificationCode}\n\nThis code expires in 5 minutes. If you did not try to sign in, please ignore this email.\n\nThank you!`,
    html: `
      <h2>Hello ${toName || 'User'},</h2>
      <p>Your MealBridge verification code is:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${verificationCode}</p>
      <p>This code expires in 5 minutes. If you did not try to sign in, please ignore this email.</p>
    `
  };

  const info = await transport.sendMail(mailOptions);
  const previewUrl = transporterMeta.isTest ? nodemailer.getTestMessageUrl(info) : null;
  console.log(`2FA email sent to ${toEmail}. Preview URL: %s`, previewUrl);
  return { previewUrl };
};

const sendVerificationEmail = async (toEmail, toName, verificationCode) => {
  const transport = await createTransporter();
  if (!transport) return { previewUrl: null };

  const mailOptions = {
    from: process.env.SMTP_FROM || '"MealBridge Admin" <adminmealbridge@gmail.com>',
    to: toEmail,
    subject: 'MealBridge Email Verification Code',
    text: `Hello ${toName || 'User'},\n\nPlease verify your email address for your MealBridge account. Use the code below:\n\n${verificationCode}\n\nThis code expires in 20 minutes.\n\nThank you!`,
    html: `
      <h2>Hello ${toName || 'User'},</h2>
      <p>Please verify your email address for your MealBridge account.</p>
      <p><strong>Your verification code is:</strong></p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${verificationCode}</p>
      <p>This code expires in 20 minutes.</p>
    `
  };

  const info = await transport.sendMail(mailOptions);
  const previewUrl = transporterMeta.isTest ? nodemailer.getTestMessageUrl(info) : null;
  console.log(`Verification email sent to ${toEmail}. Preview URL: %s`, previewUrl);
  return { previewUrl };
};

const sendReceiptEmail = async (toEmail, toName, receiptPath, subject = 'Your MealBridge Donation Receipt') => {
  const transport = await createTransporter();
  if (!transport) return;

  const absolutePath = path.join(__dirname, '..', receiptPath.replace(/^\//, ''));

  const mailOptions = {
    from: process.env.SMTP_FROM || '"MealBridge Receipts" <receipts@mealbridge.com>',
    to: toEmail,
    subject,
    text: `Hello ${toName},\n\nThank you for your donation. Please find your official receipt attached for tax purposes.\n\nBest regards,\nMealBridge`,
    attachments: [
      {
        filename: path.basename(absolutePath),
        path: absolutePath
      }
    ]
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`Receipt emailed to ${toEmail}. Preview: %s`, nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Error sending receipt to ${toEmail}:`, error);
  }
};

const sendApprovalEmail = async (toEmail, toName) => {
  const transport = await createTransporter();
  if (!transport) return;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"MealBridge Admin" <adminmealbridge@gmail.com>',
    to: toEmail,
    subject: 'Your MealBridge Account is Approved!',
    text: `Hello ${toName},\n\nGreat news! Your MealBridge account has been successfully approved by the admin. You can now log in and start using the platform.\n\nThank you!`,
    html: `
      <h2>Hello ${toName},</h2>
      <p>Great news! Your MealBridge account has been successfully approved by the admin.</p>
      <p>You can now log in and start using the platform.</p>
      <p>Thank you!</p>
    `
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`Approval email sent to ${toEmail}. Preview URL: %s`, nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Error sending approval email to ${toEmail}:`, error);
  }
};

module.exports = { sendFoodAlertEmail, sendPasswordResetEmail, sendReceiptEmail, sendVerificationEmail, sendApprovalEmail, sendTwoFactorCodeEmail };
