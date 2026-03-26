const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['elderly', 'caregiver', 'admin'], default: 'elderly' },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String
  }],
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedElderlyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  otp: String,
  otpExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
