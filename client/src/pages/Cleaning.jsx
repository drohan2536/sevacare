import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { API_BASE_URL } from '../config.js';

export default function Cleaning() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cleaningType, setCleaningType] = useState('regular');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/services/providers/cleaning`).then(r => r.json()).then(setProviders).catch(() => {});
    fetch(`${API_BASE_URL}/services/timeslots`).then(r => r.json()).then(setTimeSlots).catch(() => {});
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const confirmBooking = async () => {
    if (!selected || !date || !time) {
      alert(language === 'hi' ? 'कृपया सभी विवरण भरें' : 'Please fill all details');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'user1' },
        body: JSON.stringify({
          serviceType: 'cleaning',
          subType: cleaningType,
          date,
          timeSlot: time,
          providerId: selected.id,
          address: '42 MG Road, Pune'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => { setShowSuccess(false); navigate('/orders'); }, 2500);
      }
    } catch {
      alert(language === 'hi' ? 'बुकिंग फ़ेल हो गई' : 'Booking failed');
    }
  };

  const cleaningTypes = [
    { key: 'regular', label: language === 'hi' ? '🧹 नियमित सफाई' : '🧹 Regular Cleaning', desc: language === 'hi' ? 'मूल सफाई सेवा' : 'Basic cleaning service' },
    { key: 'deep', label: language === 'hi' ? '✨ डीप क्लीनिंग' : '✨ Deep Cleaning', desc: language === 'hi' ? 'गहन सफाई सेवा' : 'Thorough deep cleaning' },
    { key: 'kitchen', label: language === 'hi' ? '🍳 किचन क्लीनिंग' : '🍳 Kitchen Cleaning', desc: language === 'hi' ? 'किचन विशेष सफाई' : 'Kitchen specialized cleaning' },
    { key: 'bathroom', label: language === 'hi' ? '🚿 बाथरूम क्लीनिंग' : '🚿 Bathroom Cleaning', desc: language === 'hi' ? 'बाथरूम विशेष सफाई' : 'Bathroom specialized cleaning' },
  ];

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('services.cleaning')}</button>
      </nav>

      {/* Simulated partner badge */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <span style={{ padding: '6px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          Urban Company Partner
        </span>
      </div>

      {/* Cleaning Type Selection */}
      <div className="section-header">
        <h2 className="section-title">{language === 'hi' ? 'सफाई का प्रकार' : 'Cleaning Type'}</h2>
      </div>
      {cleaningTypes.map(ct => (
        <div
          key={ct.key}
          className={`provider-card ${cleaningType === ct.key ? 'selected' : ''}`}
          onClick={() => setCleaningType(ct.key)}
        >
          <div className="provider-info">
            <div className="provider-name">{ct.label}</div>
            <div className="provider-spec">{ct.desc}</div>
          </div>
        </div>
      ))}

      {/* Provider Selection */}
      <div className="section-header">
        <h2 className="section-title">{t('booking.select_provider')}</h2>
      </div>
      {providers.map(p => (
        <div
          key={p.id}
          className={`provider-card ${selected?.id === p.id ? 'selected' : ''}`}
          onClick={() => setSelected(p)}
        >
          <div className="provider-avatar">{p.image}</div>
          <div className="provider-info">
            <div className="provider-name">{p.name}</div>
            <div className="provider-spec">{p.specialization}</div>
            <div className="provider-meta">
              <span className="provider-rating">⭐ {p.rating}</span>
              <span>{p.experience}</span>
            </div>
          </div>
          <div className="provider-price">₹{p.price}</div>
        </div>
      ))}

      {/* Date */}
      <div className="section-header">
        <h2 className="section-title">{t('booking.select_date')}</h2>
      </div>
      <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />

      {/* Time */}
      <div className="section-header">
        <h2 className="section-title">{t('booking.select_time')}</h2>
      </div>
      <div className="time-slots-grid">
        {timeSlots.map(slot => (
          <button key={slot} className={`time-slot ${time === slot ? 'selected' : ''}`} onClick={() => setTime(slot)}>{slot}</button>
        ))}
      </div>

      {/* Confirm */}
      <button
        className="btn btn-primary"
        onClick={confirmBooking}
        disabled={!selected || !date || !time}
        style={{ marginTop: 24, marginBottom: 100 }}
        id="confirm-cleaning-btn"
      >
        {t('booking.confirm_booking')} {selected ? `• ₹${selected.price}` : ''}
      </button>

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">🧹</div>
            <h2 className="modal-title">{t('booking.booking_confirmed')}</h2>
            <p className="modal-text">{selected?.name} • {date} • {time}</p>
          </div>
        </div>
      )}
    </div>
  );
}
