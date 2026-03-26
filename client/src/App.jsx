import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import { useLanguage } from './i18n/LanguageContext.jsx';
import { useState, useEffect, useRef, useCallback } from 'react';
import VoiceInput from './components/VoiceInput.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DietFood from './pages/DietFood.jsx';
import Massage from './pages/Massage.jsx';
import Medicine from './pages/Medicine.jsx';
import Cleaning from './pages/Cleaning.jsx';
import Doctor from './pages/Doctor.jsx';
import SOS from './pages/SOS.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import HealthProfile from './pages/HealthProfile.jsx';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { path: '/', icon: '🏠', label: t('common.home') },
    { path: '/orders', icon: '📋', label: t('common.orders') },
    { path: '/health', icon: '❤️', label: t('health.title') },
    { path: '/profile', icon: '👤', label: t('common.profile') },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(tab => (
        <button
          key={tab.path}
          className={`bottom-nav-item ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
          aria-label={tab.label}
          aria-current={location.pathname === tab.path ? 'page' : undefined}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function SOSFloatingButton() {
  const navigate = useNavigate();

  return (
    <button
      className="sos-floating"
      onClick={() => navigate('/sos')}
      aria-label="Emergency SOS"
      id="sos-floating-btn"
    >
      SOS
    </button>
  );
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { language, t } = useLanguage();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        type: 'bot',
        text: t('greeting') + '! ' + (language === 'en'
          ? "I'm your SevaCare health assistant. How can I help you today?"
          : t('tagline'))
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: msg }]);

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, language })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: t('common.error')
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!isOpen) {
    return (
      <button className="chatbot-toggle" onClick={() => setIsOpen(true)} aria-label="Open health chat" id="chatbot-toggle">
        💬
      </button>
    );
  }

  return (
    <div className="chatbot-window" role="dialog" aria-label="Health Assistant Chat">
      <div className="chatbot-header">
        <h3>🤖 {t('common.chat')}</h3>
        <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>
      </div>
      <div className="chatbot-messages" id="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.type}`}>{msg.text}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input-wrapper">
        <input
          className="chatbot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'en' ? 'Type or speak your question...' : 'बोलें या लिखें...'}
          id="chatbot-input"
        />
        <VoiceInput onResult={(text) => {
          setInput(text);
          sendMessage(text);
        }} />
        <button className="chatbot-send" onClick={() => sendMessage()} aria-label="Send message">➤</button>
      </div>
    </div>
  );
}

import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from './config.js';

let SpeechRecognitionPlugin = null;
if (Capacitor.isNativePlatform()) {
  import('@capacitor-community/speech-recognition').then((mod) => {
    SpeechRecognitionPlugin = mod.SpeechRecognition;
  });
}

function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();
  const { language, speechCode, t } = useLanguage();
  const isNative = Capacitor.isNativePlatform();

  const handleCommand = (text) => {
    setTranscript(text);
    const commands = {
      doctor: ['doctor', 'डॉक्टर', 'డాక్టర్', 'டாக்டர்', 'ডাক্তার', 'ડૉક્ટર', 'ವೈದ್ಯ', 'डॉक्टर'],
      medicine: ['medicine', 'दवाई', 'औषध', 'మందు', 'மருந்து', 'ওষুধ', 'દવા', 'ಔಷಧಿ'],
      food: ['food', 'खाना', 'diet', 'जेवण', 'భోజనం', 'உணவு', 'খাবার', 'ભોજન', 'ಊಟ'],
      massage: ['massage', 'मसाज', 'మసాజ్', 'மசாஜ்', 'ম্যাসেজ', 'મસાજ', 'ಮಸಾಜ್'],
      cleaning: ['clean', 'सफाई', 'स्वच्छता', 'శుభ్రత', 'சுத்தம்', 'পরিষ্কার', 'સફાઈ', 'ಸ್ವಚ್ಛ'],
      sos: ['emergency', 'sos', 'इमरजेंसी', 'आणीबाणी', 'అత్యవసర', 'அவசர', 'জরুরি', 'ઇમર્જન્સી', 'ತುರ್ತು'],
      orders: ['order', 'ऑर्डर', 'ఆర్డర్', 'ஆர்டர்', 'অர্ডার', 'ઓર્ડર', 'ಆರ್ಡರ್'],
      home: ['home', 'होम', 'मुख्यपृष्ठ', 'హోమ్', 'முகப்பு', 'হোম', 'હોમ', 'ಹೋಮ್']
    };

    const routes = { doctor: '/doctor', medicine: '/medicine', food: '/diet-food', massage: '/massage', cleaning: '/cleaning', sos: '/sos', orders: '/orders', home: '/' };

    for (const [key, words] of Object.entries(commands)) {
      if (words.some(w => text.includes(w))) {
        navigate(routes[key]);
        break;
      }
    }
    setTimeout(() => setTranscript(''), 3000);
  };

  const startListening = async () => {
    // ---- NATIVE (Capacitor) ----
    if (isNative && SpeechRecognitionPlugin) {
      try {
        const permStatus = await SpeechRecognitionPlugin.checkPermissions();
        if (permStatus.speechRecognition !== 'granted') {
          const newPerm = await SpeechRecognitionPlugin.requestPermissions();
          if (newPerm.speechRecognition !== 'granted') return;
        }

        setListening(true);
        await SpeechRecognitionPlugin.removeAllListeners();

        // Promise-based: start() returns { matches: string[] }
        const result = await SpeechRecognitionPlugin.start({
          language: speechCode,
          maxResults: 5,
          prompt: language === 'en' ? 'Say a command...' : 'बोलें...',
          partialResults: false,
          popup: true,
        });

        if (result && result.matches && result.matches.length > 0) {
          handleCommand(result.matches[0].toLowerCase());
        }
      } catch (e) {
        console.error('Native voice assistant error:', e);
      } finally {
        setListening(false);
        try { await SpeechRecognitionPlugin.stop(); } catch(e) {}
      }
      return;
    }

    // ---- WEB BROWSER ----
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.lang = speechCode;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => handleCommand(event.results[0][0].transcript.toLowerCase());
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    try { recognition.start(); } catch(e) { setListening(false); }
  };

  return (
    <>
      <button
        className={`voice-btn ${listening ? 'listening' : ''}`}
        onClick={startListening}
        aria-label={listening ? 'Listening...' : 'Voice commands'}
        id="voice-btn"
      >
        🎙️
      </button>
      {(listening || transcript) && (
        <div className="voice-indicator">
          {listening ? `🎙️ ${t('common.loading').replace('...', '')}...` : `"${transcript}"`}
        </div>
      )}
    </>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <Login />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/diet-food" element={<DietFood />} />
        <Route path="/massage" element={<Massage />} />
        <Route path="/medicine" element={<Medicine />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/health" element={<HealthProfile />} />
        <Route path="/profile" element={<HealthProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <SOSFloatingButton />
      <ChatBot />
      <VoiceAssistant />
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
