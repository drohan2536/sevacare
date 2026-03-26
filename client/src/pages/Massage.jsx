import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { API_BASE_URL } from '../config.js';

export default function Massage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/services/providers/massage`).then(r => r.json()).then(setProviders).catch(() => {});
    fetch(`${API_BASE_URL}/services/timeslots`).then(r => r.json()).then(setTimeSlots).catch(() => {});
    // Default date to tomorrow
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
          serviceType: 'massage',
          subType: selected.specialization,
          date,
          timeSlot: time,
          providerId: selected.id,
          notes,
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
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('services.massage')}</button>
      </nav>

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

      {/* Date Selection */}
      <div className="section-header">
        <h2 className="section-title">{t('booking.select_date')}</h2>
      </div>
      <input
        type="date"
        className="form-input"
        value={date}
        onChange={e => setDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        id="booking-date"
      />

      {/* Time Slot Selection */}
      <div className="section-header">
        <h2 className="section-title">{t('booking.select_time')}</h2>
      </div>
      <div className="time-slots-grid">
        {timeSlots.map(slot => (
          <button
            key={slot}
            className={`time-slot ${time === slot ? 'selected' : ''}`}
            onClick={() => setTime(slot)}
          >
            {slot}
          </button>
        ))}
      </div>

      {/* Notes */}
      <div className="form-group" style={{ marginTop: 24 }}>
        <label className="form-label">{t('booking.add_notes')}</label>
        <textarea
          className="form-input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={language === 'hi' ? 'कोई विशेष निर्देश...' : 'Any special instructions...'}
          rows={3}
        />
      </div>

      {/* Confirm Button */}
      <button
        className="btn btn-primary"
        onClick={confirmBooking}
        disabled={!selected || !date || !time}
        style={{ marginTop: 16, marginBottom: 100 }}
        id="confirm-booking-btn"
      >
        {t('booking.confirm_booking')} {selected ? `• ₹${selected.price}` : ''}
      </button>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">✅</div>
            <h2 className="modal-title">{t('booking.booking_confirmed')}</h2>
            <p className="modal-text">{selected?.name} • {date} • {time}</p>
          </div>
        </div>
      )}
    </div>
  );
}
