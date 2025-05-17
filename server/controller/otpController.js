const sgMail = require('@sendgrid/mail');
const Otp = require('../models/otpModel');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
      html: `<strong>Your OTP code is ${otp}</strong>`,
    };

    await sgMail.send(msg);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

  const record = await Otp.findOne({ email });
  if (!record) return res.status(400).json({ message: 'OTP not found' });
  if (record.expiresAt < Date.now()) {
    await Otp.deleteOne({ email });
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  await Otp.deleteOne({ email });
  res.status(200).json({ message: 'OTP verified' });
};

module.exports = { sendOtp, verifyOtp };