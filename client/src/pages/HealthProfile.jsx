import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function HealthProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/health/${user?._id || 'user1'}`)
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="loading-spinner"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('health.title')}</button>
        <button className="btn btn-ghost btn-sm" onClick={logout} style={{ width: 'auto' }}>
          {t('common.logout')} 🚪
        </button>
      </nav>

      {/* User Info */}
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 64, marginBottom: 8, }}>{user?.role === 'elderly' ? '👴' : user?.role === 'caregiver' ? '🧑‍⚕️' : '👤'}</div>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{user?.name}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>📱 {user?.phone}</p>
        <span className={`order-type-badge badge-doctor`} style={{ marginTop: 8, display: 'inline-block' }}>
          {user?.role === 'elderly' ? (language === 'hi' ? 'बुजुर्ग' : 'Elderly') : user?.role}
        </span>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
        {[
          { label: language === 'hi' ? 'उम्र' : 'Age', value: profile?.age || '—', icon: '🎂' },
          { label: t('health.blood_group'), value: profile?.bloodGroup || '—', icon: '🩸' },
          { label: language === 'hi' ? 'वजन' : 'Weight', value: profile?.weight ? `${profile.weight}kg` : '—', icon: '⚖️' },
        ].map(stat => (
          <div key={stat.label} className="health-card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 28 }}>{stat.icon}</div>
            <div className="health-card-value" style={{ fontSize: 'var(--font-lg)' }}>{stat.value}</div>
            <div className="health-card-title" style={{ marginBottom: 0, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Medical Conditions */}
      {profile?.conditions?.length > 0 && (
        <div className="health-card">
          <h3 className="health-card-title">🏥 {t('health.conditions')}</h3>
          <div className="health-tags">
            {profile.conditions.map(c => (
              <span key={c} className="health-tag">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Allergies */}
      {profile?.allergies?.length > 0 && (
        <div className="health-card">
          <h3 className="health-card-title">⚠️ {t('health.allergies')}</h3>
          <div className="health-tags">
            {profile.allergies.map(a => (
              <span key={a} className="health-tag" style={{ background: 'rgba(234,88,12,0.1)', color: '#fb923c' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Current Medications */}
      {profile?.currentMedications?.length > 0 && (
        <div className="health-card">
          <h3 className="health-card-title">💊 {t('health.medications')}</h3>
          {profile.currentMedications.map((med, i) => (
            <div key={i} className="medication-item">
              <div className="medication-name">{med.name}</div>
              <div className="medication-detail">{med.dosage} • {med.frequency}</div>
              <div className="medication-detail">⏰ {med.time}</div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Notes */}
      {profile?.doctorNotes?.length > 0 && (
        <div className="health-card">
          <h3 className="health-card-title">📋 {t('health.doctor_notes')}</h3>
          {profile.doctorNotes.map((note, i) => (
            <div key={i} className="medication-item">
              <div className="medication-name">{note.doctor}</div>
              <div className="medication-detail">{note.note}</div>
              <div className="medication-detail" style={{ color: 'var(--text-muted)' }}>
                {new Date(note.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Info */}
      {profile?.emergencyInfo?.preferredHospital && (
        <div className="health-card">
          <h3 className="health-card-title">🚨 {language === 'hi' ? 'आपातकालीन जानकारी' : 'Emergency Info'}</h3>
          <div className="medication-item">
            <div className="medication-detail">🏥 {profile.emergencyInfo.preferredHospital}</div>
            <div className="medication-detail">👨‍⚕️ {profile.emergencyInfo.primaryDoctor}</div>
            <div className="medication-detail">📱 {profile.emergencyInfo.primaryDoctorPhone}</div>
            {profile.emergencyInfo.insuranceId && (
              <div className="medication-detail">🪪 {profile.emergencyInfo.insuranceId}</div>
            )}
          </div>
        </div>
      )}

      <div style={{ height: 100 }}></div>
    </div>
  );
}
