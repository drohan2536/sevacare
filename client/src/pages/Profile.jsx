import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const subscription = user?.subscription;
  const isSubscribed = subscription && subscription.plan && new Date(subscription.expiresAt) > new Date();

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('common.profile')}</button>
      </nav>

      {/* User Info (Big Header) */}
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 64, marginBottom: 8, }}>{user?.role === 'elderly' ? '👴' : user?.role === 'caregiver' ? '🧑‍⚕️' : '👤'}</div>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{user?.name}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>📱 {user?.phone}</p>
        <span className={'order-type-badge badge-doctor'} style={{ marginTop: 8, display: 'inline-block' }}>
          {user?.role === 'elderly' ? (language === 'hi' ? 'बुजुर्ग' : 'Elderly') : user?.role}
        </span>
      </div>

      {/* Subscription Card */}
      <div className="health-card">
        <h3 className="health-card-title">💎 {language === 'hi' ? 'सदस्यता' : 'Subscription'}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>{isSubscribed ? subscription.plan : (language === 'hi' ? 'कोई सक्रिय योजना नहीं' : 'No active plan')}</div>
            {isSubscribed && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {language === 'hi' ? 'वैधता:' : 'Valid till:'} {new Date(subscription.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>
          <button className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/subscription')}>
            {isSubscribed ? (language === 'hi' ? 'प्रबंधित करें' : 'Manage') : (language === 'hi' ? 'सदस्यता लें' : 'Subscribe')}
          </button>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="health-card">
        <h3 className="health-card-title">🌐 {language === 'hi' ? 'भाषा' : 'Language'}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setLanguage('en')}
            style={{flex: 1}}
          >
            English
          </button>
          <button 
            className={`btn btn-sm ${language === 'hi' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setLanguage('hi')}
            style={{flex: 1}}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Emergency Info */}
      <div className="health-card">
          <h3 className="health-card-title">🚨 {language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'}</h3>
          {user?.emergencyContacts?.length > 0 ? (
            user.emergencyContacts.map((contact, i) => (
              <div key={i} className="medication-item">
                <div className="medication-name">{contact.name}</div>
                <div className="medication-detail">📱 {contact.phone} • {contact.relation}</div>
              </div>
            ))
          ) : (
             <div style={{ color: 'var(--text-muted)' }}>{language === 'hi' ? 'कोई आपातकालीन संपर्क नहीं' : 'No emergency contacts added'}</div>
          )}
      </div>

      {/* Address */}
      {user?.address && (
         <div className="health-card">
            <h3 className="health-card-title">🏠 {language === 'hi' ? 'पता' : 'Address'}</h3>
            <div className="medication-item">
               <div className="medication-name">{user.address.street}</div>
               <div className="medication-detail">{user.address.city}, {user.address.state} - {user.address.pincode}</div>
            </div>
         </div>
      )}

      {/* Actions */}
      <div style={{ padding: '0 16px', marginTop: '24px' }}>
        <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleLogout}>
          {t('common.logout')} 🚪
        </button>
      </div>

      <div style={{ height: 100 }}></div>
    </div>
  );
}
