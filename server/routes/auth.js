const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory store for demo (when MongoDB is not available)
let users = [
  {
    _id: 'admin1',
    name: 'Admin',
    phone: '9999999999',
    role: 'admin',
    language: 'en',
    emergencyContacts: [],
    address: { street: 'Admin Office', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }
  },
  {
    _id: 'user1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    role: 'elderly',
    language: 'hi',
    emergencyContacts: [
      { name: 'Suresh Kumar', phone: '9876543211', relation: 'Son' }
    ],
    address: { street: '42 MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' }
  },
  {
    _id: 'caregiver1',
    name: 'Suresh Kumar',
    phone: '9876543211',
    role: 'caregiver',
    language: 'en',
    emergencyContacts: [],
    linkedElderlyIds: ['user1'],
    address: { street: '42 MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' }
  }
];

let otpStore = {};

// Send OTP (simulated)
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  
  // Simulated OTP - always 1234 for demo
  const otp = '1234';
  otpStore[phone] = { otp, expiry: Date.now() + 5 * 60 * 1000 };
  
  res.json({ 
    success: true, 
    message: 'OTP sent successfully (Demo: use 1234)',
    demo_otp: otp 
  });
});

// Verify OTP & Login
router.post('/verify-otp', (req, res) => {
  const { phone, otp, name, role } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const stored = otpStore[phone];
  if (!stored || stored.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  if (Date.now() > stored.expiry) {
    return res.status(400).json({ error: 'OTP expired' });
  }

  delete otpStore[phone];

  // Find or create user
  let user = users.find(u => u.phone === phone);
  if (!user) {
    user = {
      _id: 'user_' + Date.now(),
      name: name || 'User',
      phone,
      role: role || 'elderly',
      language: 'en',
      emergencyContacts: [],
      address: {}
    };
    users.push(user);
  }

  const token = jwt.sign(
    { id: user._id, phone: user.phone, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'sevacare_secret_key_2024',
    { expiresIn: '30d' }
  );

  res.json({ success: true, token, user });
});

// Get current user profile
router.get('/me', (req, res) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sevacare_secret_key_2024');
    const user = users.find(u => u._id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update profile
router.put('/profile', (req, res) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sevacare_secret_key_2024');
    const userIndex = users.findIndex(u => u._id === decoded.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    const updates = req.body;
    users[userIndex] = { ...users[userIndex], ...updates };
    res.json({ success: true, user: users[userIndex] });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
