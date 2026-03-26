import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { API_BASE_URL } from '../config.js';

export default function Doctor() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [consultType, setConsultType] = useState('video');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/services/providers/doctor`).then(r => r.json()).then(setProviders).catch(() => {});
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
          serviceType: 'doctor',
          subType: consultType,
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

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('services.doctor')}</button>
      </nav>

      {/* Consultation Type */}
      <div className="section-header">
        <h2 className="section-title">{language === 'hi' ? 'परामर्श प्रकार' : 'Consultation Type'}</h2>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[
          { key: 'video', icon: '📹', label: language === 'hi' ? 'वीडियो कॉल' : 'Video Call' },
          { key: 'audio', icon: '📞', label: language === 'hi' ? 'ऑडियो कॉल' : 'Audio Call' },
          { key: 'chat', icon: '💬', label: language === 'hi' ? 'चैट' : 'Chat' },
        ].map(ct => (
          <button
            key={ct.key}
            className={`time-slot ${consultType === ct.key ? 'selected' : ''}`}
            onClick={() => setConsultType(ct.key)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 24 }}>{ct.icon}</span>
            <span>{ct.label}</span>
          </button>
        ))}
      </div>

      {/* Doctor Selection */}
      <div className="section-header">
        <h2 className="section-title">{language === 'hi' ? 'डॉक्टर चुनें' : 'Choose Doctor'}</h2>
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
        id="confirm-doctor-btn"
      >
        {language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment'} {selected ? `• ₹${selected.price}` : ''}
      </button>

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">👩‍⚕️</div>
            <h2 className="modal-title">{t('booking.booking_confirmed')}</h2>
            <p className="modal-text">{selected?.name} • {consultType} • {date} • {time}</p>
          </div>
        </div>
      )}
    </div>
  );
}
