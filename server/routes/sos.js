const express = require('express');
const router = express.Router();

// SOS alerts store
let sosAlerts = [];

// Trigger SOS
router.post('/trigger', (req, res) => {
  const { userId, location, message } = req.body;
  
  const alert = {
    _id: 'sos_' + Date.now(),
    userId: userId || req.headers['x-user-id'] || 'user1',
    location: location || { lat: 18.5204, lng: 73.8567 }, // Default Pune coords
    message: message || 'Emergency! Need immediate help!',
    status: 'active',
    timestamp: new Date().toISOString(),
    responders: [],
    notifiedContacts: [
      { name: 'Suresh Kumar', phone: '9876543211', notified: true, relation: 'Son' }
    ],
    nearbyHospitals: [
      { name: 'Sahyadri Hospital', distance: '1.2 km', phone: '020-30000000', ambulance: true },
      { name: 'Ruby Hall Clinic', distance: '2.5 km', phone: '020-26163391', ambulance: true },
      { name: 'KEM Hospital', distance: '3.1 km', phone: '020-24126000', ambulance: true }
    ]
  };
  
  sosAlerts.push(alert);
  
  res.status(201).json({ 
    success: true, 
    alert,
    message: 'Emergency alert sent! Help is on the way.',
    actions: [
      'Emergency contacts notified',
      'Nearest hospital alerted',
      'Location shared with responders'
    ]
  });
});

// Get SOS history
router.get('/history', (req, res) => {
  const userId = req.headers['x-user-id'] || 'user1';
  const userAlerts = sosAlerts.filter(a => a.userId === userId);
  res.json(userAlerts);
});

// Get all alerts (admin)
router.get('/all', (req, res) => {
  res.json(sosAlerts);
});

// Resolve SOS
router.put('/:id/resolve', (req, res) => {
  const { id } = req.params;
  const alertIndex = sosAlerts.findIndex(a => a._id === id);
  
  if (alertIndex === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  
  sosAlerts[alertIndex].status = 'resolved';
  sosAlerts[alertIndex].resolvedAt = new Date().toISOString();
  res.json({ success: true, alert: sosAlerts[alertIndex] });
});

module.exports = router;
