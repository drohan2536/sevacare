const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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
    },
    documents: [
      { title: 'Recent Blood Test', type: 'Blood Test', fileUrl: '', fileName: 'blood_test_mock.pdf', date: new Date(Date.now() - 86400000).toISOString() }
    ]
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
      emergencyInfo: {},
      documents: []
    });
  }
  if (!profile.documents) profile.documents = [];
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

// Upload Document
router.post('/:userId/document', upload.single('document'), (req, res) => {
  const { userId } = req.params;
  const { title, type } = req.body;

  if (!healthProfiles[userId]) {
    healthProfiles[userId] = { userId, conditions: [], allergies: [], currentMedications: [], doctorNotes: [], emergencyInfo: {}, documents: [] };
  }
  if (!healthProfiles[userId].documents) {
    healthProfiles[userId].documents = [];
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const newDoc = {
    title: title || req.file.originalname,
    type: type || 'Other',
    fileUrl: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
    date: new Date().toISOString()
  };

  healthProfiles[userId].documents.push(newDoc);
  res.json({ success: true, document: newDoc, profile: healthProfiles[userId] });
});

// Delete Document
router.delete('/:userId/document/:fileName', (req, res) => {
  const { userId, fileName } = req.params;
  if (healthProfiles[userId] && healthProfiles[userId].documents) {
    healthProfiles[userId].documents = healthProfiles[userId].documents.filter(d => d.fileName !== fileName);
  }
  res.json({ success: true, profile: healthProfiles[userId] });
});

module.exports = router;
