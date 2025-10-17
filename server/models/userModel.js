
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  phone: String, 
  password: { type: String, required: true },
  userType: { type: String, required: true, default: 'User' }
});

module.exports = mongoose.model('User', userSchema);