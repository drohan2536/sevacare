import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Transport() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    setStep(2);
  };

  const handleSearch = () => {
    if (!fromLocation.trim() || !toLocation.trim()) {
      alert(language === 'hi' ? 'कृपया दोनों स्थान दर्ज करें' : 'Please enter both locations');
      return;
    }
    setStep(3);
  };

  const handleBook = (item) => {
    alert(language === 'hi' ? `${item.name} बुकिंग जल्द ही उपलब्ध होगी` : `${item.name} booking will be available soon`);
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else navigate('/');
  };

  const MODES = [
    { id: 'flight', name_en: 'Flight Booking', name_hi: 'उड़ान बुकिंग', icon: '✈️', color: '#e0f2fe' },
    { id: 'train', name_en: 'Train Booking', name_hi: 'ट्रेन बुकिंग', icon: '🚆', color: '#dcfce7' },
    { id: 'bus', name_en: 'Bus Booking', name_hi: 'बस बुकिंग', icon: '🚌', color: '#ffedd5' },
    { id: 'short', name_en: 'Short Distance Journey', name_hi: 'कम दूरी की यात्रा', icon: '🚕', color: '#fef08a' }
  ];

  const DATA = {
    flight: [
      { id: 1, name: 'Air India', time: '10:00 AM - 12:30 PM', price: '₹4,500', icon: '✈️' },
      { id: 2, name: 'IndiGo', time: '02:15 PM - 04:45 PM', price: '₹3,800', icon: '✈️' },
      { id: 3, name: 'Vistara', time: '06:00 PM - 08:30 PM', price: '₹5,200', icon: '✈️' }
    ],
    train: [
      { id: 1, name: 'Vande Bharat Exp', time: '06:00 AM - 11:30 AM', price: '₹1,200', icon: '🚆' },
      { id: 2, name: 'Rajdhani Exp', time: '04:00 PM - 10:00 PM', price: '₹1,800', icon: '🚆' },
      { id: 3, name: 'Shatabdi Exp', time: '06:30 AM - 12:00 PM', price: '₹950', icon: '🚆' }
    ],
    bus: [
      { id: 1, name: 'Volvo AC Sleeper', time: '10:00 PM - 06:00 AM', price: '₹1,200', icon: '🚌' },
      { id: 2, name: 'Non-AC Seater', time: '09:00 AM - 05:00 PM', price: '₹600', icon: '🚌' },
      { id: 3, name: 'Scania Multi-Axle', time: '11:00 PM - 07:00 AM', price: '₹1,500', icon: '🚌' }
    ],
    short: [
      { id: 1, name: 'Auto Rickshaw', time: 'ETA: 5 mins', price: '₹80', icon: '🛺' },
      { id: 2, name: 'Mini Cab', time: 'ETA: 8 mins', price: '₹150', icon: '🚕' },
      { id: 3, name: 'Sedan Cab', time: 'ETA: 10 mins', price: '₹220', icon: '🚘' }
    ]
  };

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={handleBack}>
          ← {step === 1 ? (t('services.transport') || 'Transportation') : (language === 'hi' ? 'वापस जाएं' : 'Back')}
        </button>
      </nav>

      <div style={{ padding: '0 20px', marginTop: '20px' }}>
        
        {step === 1 && (
          <>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
              {language === 'hi' ? 'परिवहन का प्रकार चुनें' : 'Select Transportation Mode'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {MODES.map(m => (
                <div 
                  key={m.id}
                  onClick={() => handleModeSelection(m.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 16px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                  }}
                >
                  <div style={{ fontSize: '40px', backgroundColor: m.color, width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '12px' }}>
                    {m.icon}
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                    {language === 'hi' ? m.name_hi : m.name_en}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
              {language === 'hi' ? 'अपनी यात्रा का विवरण दर्ज करें' : 'Enter Journey Details'}
            </h2>
            <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {language === 'hi' ? 'कहाँ से (From Location)' : 'From Location'}
                </label>
                <input 
                  type="text" 
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder={language === 'hi' ? 'शुरुआती स्थान' : 'Starting point'}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '1rem' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {language === 'hi' ? 'कहाँ तक (To Location)' : 'To Location'}
                </label>
                <input 
                  type="text" 
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder={language === 'hi' ? 'गंतव्य' : 'Destination point'}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '1rem' }}
                />
              </div>
              <button 
                onClick={handleSearch}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                {language === 'hi' ? 'विकल्प खोजें' : 'Search Options'}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
              {language === 'hi' ? 'उपलब्ध विकल्प' : 'Available Options'}
            </h2>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {fromLocation} → {toLocation}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(DATA[mode] || []).map(item => (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      marginRight: '16px',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.time}</div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--success)', marginTop: '4px', fontWeight: '700' }}>
                      {item.price}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBook(item)}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'hi' ? 'बुक' : 'Book'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
