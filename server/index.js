require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://127.0.0.1:5174'], // <-- Change these from 5173 to 5174
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const sosRoutes = require('./routes/sos');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/health', healthRoutes);

// Health check
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', message: 'SevaCare API is running', timestamp: new Date().toISOString() });
});

// Chatbot endpoint
app.post('/api/chatbot', (req, res) => {
  const { message, language } = req.body;
  const msg = (message || '').toLowerCase();

  const responses = {
    en: {
      greeting: "Hello! I'm your SevaCare health assistant. How can I help you today?",
      bp: "For high blood pressure: Take your medicines on time, reduce salt intake, exercise regularly, and check BP daily. If BP is above 180/120, seek emergency help immediately.",
      sugar: "For diabetes management: Monitor blood sugar levels, take insulin/medicines on time, avoid sweets, eat fiber-rich foods, and walk for 30 minutes daily.",
      pain: "For pain relief: Try gentle stretching, warm compress, or prescribed painkillers. If pain is severe or sudden, please use the SOS button or consult a doctor.",
      medicine: "You can order your medicines through the Medicine Delivery section. Upload your prescription and we'll deliver them to your doorstep.",
      food: "Check our Diet Food section for doctor-recommended meals. We have options for diabetic, heart-healthy, and high-protein diets.",
      emergency: "For emergencies, press the red SOS button. It will alert your emergency contacts and the nearest hospital immediately.",
      default: "I can help with health queries, medicine reminders, diet advice, and emergency guidance. What would you like to know?"
    },
    hi: {
      greeting: "नमस्ते! मैं आपका सेवाकेयर स्वास्थ्य सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?",
      bp: "उच्च रक्तचाप के लिए: समय पर दवाई लें, नमक कम खाएं, नियमित व्यायाम करें, और रोज़ाना BP चेक करें। अगर BP 180/120 से ऊपर है, तो तुरंत इमरजेंसी सहायता लें।",
      sugar: "मधुमेह प्रबंधन: ब्लड शुगर की निगरानी करें, समय पर इंसुलिन/दवाई लें, मिठाई से बचें, फाइबर युक्त भोजन खाएं, और रोज़ 30 मिनट चलें।",
      pain: "दर्द के लिए: हल्की स्ट्रेचिंग करें, गर्म सेक लगाएं, या डॉक्टर की दवाई लें। अगर दर्द तेज़ है, तो SOS बटन दबाएं या डॉक्टर से संपर्क करें।",
      medicine: "आप दवाई डिलीवरी सेक्शन से दवाइयां ऑर्डर कर सकते हैं। अपना प्रिस्क्रिप्शन अपलोड करें।",
      food: "डाइट फूड सेक्शन में डॉक्टर-अनुशंसित भोजन देखें। डायबिटिक, हृदय-स्वस्थ, और हाई-प्रोटीन विकल्प उपलब्ध हैं।",
      emergency: "इमरजेंसी में लाल SOS बटन दबाएं। यह आपके इमरजेंसी संपर्कों और नज़दीकी अस्पताल को तुरंत सूचित करेगा।",
      default: "मैं स्वास्थ्य प्रश्नों, दवाई रिमाइंडर, डाइट सलाह, और इमरजेंसी मार्गदर्शन में मदद कर सकता हूं। आप क्या जानना चाहेंगे?"
    }
  };

  const lang = language === 'hi' ? 'hi' : 'en';
  let response;

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('namaste') || msg.includes('नमस्ते')) {
    response = responses[lang].greeting;
  } else if (msg.includes('bp') || msg.includes('blood pressure') || msg.includes('रक्तचाप')) {
    response = responses[lang].bp;
  } else if (msg.includes('sugar') || msg.includes('diabetes') || msg.includes('मधुमेह') || msg.includes('शुगर')) {
    response = responses[lang].sugar;
  } else if (msg.includes('pain') || msg.includes('hurt') || msg.includes('दर्द')) {
    response = responses[lang].pain;
  } else if (msg.includes('medicine') || msg.includes('दवाई') || msg.includes('tablet')) {
    response = responses[lang].medicine;
  } else if (msg.includes('food') || msg.includes('diet') || msg.includes('खाना') || msg.includes('भोजन')) {
    response = responses[lang].food;
  } else if (msg.includes('emergency') || msg.includes('sos') || msg.includes('help') || msg.includes('इमरजेंसी')) {
    response = responses[lang].emergency;
  } else {
    response = responses[lang].default;
  }

  res.json({ response, timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SevaCare API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health-check`);
});
