import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function HealthProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`/api/health/${user?._id || 'user1'}`)
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name);
    
    // Attempt to guess type from name or default
    let docType = 'Medical Report';
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('blood')) docType = 'Blood Test';
    else if (lowerName.includes('sugar')) docType = 'Sugar Test';
    else if (lowerName.includes('mri')) docType = 'MRI Report';
    else if (lowerName.includes('xray') || lowerName.includes('x-ray')) docType = 'X-Ray Report';
    else if (lowerName.includes('mediclaim') || lowerName.includes('insurance')) docType = 'Mediclaim';
    
    formData.append('type', docType);

    setUploading(true);
    try {
      const res = await fetch(`/api/health/${user?._id || 'user1'}/document`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = (doc) => {
    if (!doc.fileUrl) return;
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName || doc.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (fileName) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप वाकई इस दस्तावेज़ को हटाना चाहते हैं?' : 'Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/health/${user?._id || 'user1'}/document/${fileName}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch(e) {
      console.error(e);
    }
  };

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
      </nav>

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

      {/* Medical Documents */}
      <div className="health-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="health-card-title" style={{ margin: 0 }}>📄 {language === 'hi' ? 'चिकित्सा दस्तावेज़' : 'Medical Documents'}</h3>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ width: 'auto', padding: '4px 12px', fontSize: '14px' }}
          >
            {uploading ? (language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...') : (language === 'hi' ? '+ अपलोड करें' : '+ Upload')}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            style={{ display: 'none' }} 
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>

        {profile?.documents?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.documents.map((doc, i) => (
              <div key={i} className="medication-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="medication-name">{doc.title}</div>
                  <div className="medication-detail" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{doc.type}</div>
                  <div className="medication-detail" style={{ color: 'var(--text-muted)' }}>
                    {new Date(doc.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {doc.fileUrl && doc.fileUrl !== '' && (
                    <>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                        style={{ padding: '4px 8px', width: 'auto' }}
                        title="Preview"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleDownload(doc)}
                        style={{ padding: '4px 8px', width: 'auto' }}
                        title="Download"
                      >
                        ⬇️
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleDelete(doc.fileName)}
                        style={{ padding: '4px 8px', width: 'auto', color: 'red' }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
            {language === 'hi' ? 'कोई दस्तावेज़ नहीं मिला' : 'No documents found'}
          </div>
        )}
      </div>

      <div style={{ height: 100 }}></div>
    </div>
  );
}
