const express = require('express');
const router = express.Router();

// Health profiles store
let healthProfiles = {
  'user1': {
    userId: 'user1',
    bloodGroup: 'B+',
    age: 68,
    height: 170,
    weight: 72,
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    allergies: ['Penicillin'],
    currentMedications: [
      { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', time: '8:00 AM, 8:00 PM' },
      { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', time: '9:00 AM' }
    ],
    doctorNotes: [
      { doctor: 'Dr. Anita Deshmukh', note: 'Blood sugar levels improving. Continue current medication.', date: new Date(Date.now() - 604800000).toISOString() }
    ],
    emergencyInfo: {
      preferredHospital: 'Sahyadri Hospital',
      insuranceId: 'HEALTH-2024-001',
      primaryDoctor: 'Dr. Anita Deshmukh',
      primaryDoctorPhone: '9800000010'
    }
  }
};

// Get health profile
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const profile = healthProfiles[userId];
  if (!profile) {
    return res.json({
      userId,
      bloodGroup: '',
      age: null,
      height: null,
      weight: null,
      conditions: [],
      allergies: [],
      currentMedications: [],
      doctorNotes: [],
      emergencyInfo: {}
    });
  }
  res.json(profile);
});

// Create/Update health profile
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  healthProfiles[userId] = { ...healthProfiles[userId], ...req.body, userId };
  res.json({ success: true, profile: healthProfiles[userId] });
});

// Add medication reminder
router.post('/:userId/medication', (req, res) => {
  const { userId } = req.params;
  const { name, dosage, frequency, time } = req.body;
  
  if (!healthProfiles[userId]) {
    healthProfiles[userId] = { userId, conditions: [], allergies: [], currentMedications: [], doctorNotes: [], emergencyInfo: {} };
  }
  
  healthProfiles[userId].currentMedications.push({ name, dosage, frequency, time });
  res.json({ success: true, profile: healthProfiles[userId] });
});

module.exports = router;
