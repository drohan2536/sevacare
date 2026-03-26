const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup: String,
  conditions: [String], // diabetes, hypertension, etc.
  allergies: [String],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    time: String
  }],
  doctorNotes: [{
    doctor: String,
    note: String,
    date: { type: Date, default: Date.now }
  }],
  emergencyInfo: {
    preferredHospital: String,
    insuranceId: String,
    primaryDoctor: String,
    primaryDoctorPhone: String
  },
  height: Number,
  weight: Number,
  age: Number,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
