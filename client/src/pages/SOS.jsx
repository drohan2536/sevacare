import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { API_BASE_URL } from '../config.js';

export default function SOS() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activated, setActivated] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(false);

  const triggerSOS = async () => {
    setLoading(true);
    try {
      // Try to get location
      let location = { lat: 18.5204, lng: 73.8567 };
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {}

      const res = await fetch(`${API_BASE_URL}/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'user1' },
        body: JSON.stringify({ location, message: 'Emergency! Need immediate help!' })
      });
      const data = await res.json();
      if (data.success) {
        setActivated(true);
        setAlertData(data);
      }
    } catch {
      alert(language === 'hi' ? 'SOS भेजने में त्रुटि। कृपया 112 पर कॉल करें।' : 'Error sending SOS. Please call 112.');
    }
    setLoading(false);
  };

  const cancelSOS = () => {
    setActivated(false);
    setAlertData(null);
    navigate('/');
  };

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('sos_page.title')}</button>
      </nav>

      <div className="sos-page">
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 8 }}>
          {activated ? '🚑' : '🚨'} {t('sos_page.title')}
        </h1>
        <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: 24 }}>
          {activated ? t('sos_page.activated') : t('sos_page.subtitle')}
        </p>

        <button
          className={`sos-main-btn ${activated ? 'activated' : ''}`}
          onClick={!activated ? triggerSOS : undefined}
          disabled={loading}
          id="sos-main-btn"
          aria-label={activated ? 'SOS Activated' : 'Activate SOS'}
        >
          {loading ? '...' : activated ? '✓' : 'SOS'}
        </button>

        {activated && alertData && (
          <>
            <ul className="sos-actions">
              <li className="sos-action-item">✅ {t('sos_page.contacts_notified')}</li>
              <li className="sos-action-item">🏥 {t('sos_page.hospital_alerted')}</li>
              <li className="sos-action-item">📍 {t('sos_page.location_shared')}</li>
            </ul>

            {/* Nearby Hospitals */}
            <div style={{ width: '100%', textAlign: 'left' }}>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 12 }}>
                {language === 'hi' ? '🏥 नज़दीकी अस्पताल' : '🏥 Nearest Hospitals'}
              </h3>
              {alertData.alert?.nearbyHospitals?.map((h, i) => (
                <div key={i} className="card" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-base)' }}>{h.name}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{h.distance}</div>
                  </div>
                  <a
                    href={`tel:${h.phone}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: 'auto', minWidth: 80 }}
                  >
                    📞 {language === 'hi' ? 'कॉल' : 'Call'}
                  </a>
                </div>
              ))}
            </div>

            {/* Notified Contacts */}
            <div style={{ width: '100%', textAlign: 'left', marginTop: 24 }}>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 12 }}>
                {language === 'hi' ? '👥 सूचित संपर्क' : '👥 Notified Contacts'}
              </h3>
              {alertData.alert?.notifiedContacts?.map((c, i) => (
                <div key={i} className="card" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{c.name} ({c.relation})</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>📱 {c.phone}</div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-outline"
              onClick={cancelSOS}
              style={{ marginTop: 24 }}
              id="cancel-sos-btn"
            >
              {t('sos_page.cancel_sos')}
            </button>
          </>
        )}

        {!activated && (
          <div style={{ marginTop: 24, padding: 16, background: 'rgba(220,38,38,0.1)', borderRadius: 12, width: '100%' }}>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {language === 'hi'
                ? 'यह बटन दबाने पर आपके इमरजेंसी संपर्कों और नज़दीकी अस्पताल को तुरंत सूचित किया जाएगा।'
                : 'Pressing this button will instantly notify your emergency contacts and the nearest hospital.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
