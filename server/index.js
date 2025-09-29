const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/captcha', require('./routes/captchaRoutes'));
app.use('/api/halls', require('./routes/hallRoutes'));
app.use('/api/bookings', require('./routes/bookRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/', paymentRoutes);
const statsRoutes = require('./routes/statsRoutes');
app.use('/api/stats', statsRoutes);

app.get('/health-check-polling', (req, res) => {
  res.status(200).send('OK');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));