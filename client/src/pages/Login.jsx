import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import LanguageSelector from '../components/LanguageSelector.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import { API_BASE_URL } from '../config.js';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('phone'); // phone, otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError(t('login.phone_placeholder'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
      } else {
        setError(data.error);
      }
    } catch {
      setError(t('common.error'));
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError(t('login.otp_placeholder'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name: name || 'User' })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
      } else {
        setError(data.error);
      }
    } catch {
      setError(t('common.error'));
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-logo">🙏</div>
      <h1 className="login-title">{t('login.title')}</h1>
      <p className="login-subtitle">{t('login.subtitle')}</p>

      {/* Full Language Selector Grid */}
      <LanguageSelector compact={false} />

      <div className="login-form">
        {step === 'phone' ? (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="phone-input">{t('login.phone')}</label>
              <div className="input-with-voice">
                <input
                  id="phone-input"
                  type="tel"
                  className="form-input"
                  placeholder={t('login.phone_placeholder')}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  autoComplete="tel"
                />
                <VoiceInput onResult={(text) => {
                  // Extract numbers from spoken text
                  const nums = text.replace(/\D/g, '');
                  if (nums) setPhone(prev => (prev + nums).slice(0, 10));
                }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="name-input">{t('login.name')}</label>
              <div className="input-with-voice">
                <input
                  id="name-input"
                  type="text"
                  className="form-input"
                  placeholder={t('login.name_placeholder')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <VoiceInput onResult={(text) => setName(text)} />
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>{t('login.new_user')}</p>
            {error && <p style={{ color: 'var(--danger)', marginBottom: 16, fontSize: 16 }}>{error}</p>}
            <button className="btn btn-primary" onClick={sendOtp} disabled={loading} id="send-otp-btn">
              {loading ? '...' : t('login.send_otp')}
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="otp-input">{t('login.enter_otp')}</label>
              <div className="input-with-voice">
                <input
                  id="otp-input"
                  type="tel"
                  className="form-input form-input-large"
                  placeholder={t('login.otp_placeholder')}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  autoFocus
                />
                <VoiceInput onResult={(text) => {
                  const nums = text.replace(/\D/g, '');
                  if (nums) setOtp(nums.slice(0, 4));
                }} />
              </div>
            </div>
            <div className="login-demo-hint">💡 {t('login.demo_hint')}</div>
            {error && <p style={{ color: 'var(--danger)', margin: '16px 0', fontSize: 16 }}>{error}</p>}
            <button className="btn btn-primary" onClick={verifyOtp} disabled={loading} id="verify-otp-btn" style={{ marginTop: 16 }}>
              {loading ? '...' : t('login.verify')}
            </button>
            <button className="btn btn-ghost" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} style={{ marginTop: 8 }}>
              ← {t('common.back')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
