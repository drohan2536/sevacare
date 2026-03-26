import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const PLANS = [
  {
    id: 'lite',
    name_en: 'Lite',
    name_hi: 'लाइट',
    priceINR: 999,
    priceUSD: 12,
    priceEUR: 11,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    icon: '⚡',
    services_en: ['Medicine Delivery', 'Doctor Consultation'],
    services_hi: ['दवाई डिलीवरी', 'डॉक्टर परामर्श'],
    serviceKeys: ['medicine', 'doctor'],
    tag_en: 'Basic',
    tag_hi: 'बुनियादी',
  },
  {
    id: 'pro',
    name_en: 'Pro',
    name_hi: 'प्रो',
    priceINR: 1499,
    priceUSD: 18,
    priceEUR: 16,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    icon: '🚀',
    services_en: ['Medicine Delivery', 'Doctor Consultation', 'Diet Food', 'Transportation'],
    services_hi: ['दवाई डिलीवरी', 'डॉक्टर परामर्श', 'डाइट खाना', 'परिवहन'],
    serviceKeys: ['medicine', 'doctor', 'diet_food', 'transport'],
    tag_en: 'Popular',
    tag_hi: 'लोकप्रिय',
    popular: true,
  },
  {
    id: 'premium',
    name_en: 'Premium',
    name_hi: 'प्रीमियम',
    priceINR: 2499,
    priceUSD: 30,
    priceEUR: 27,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: '👑',
    services_en: ['Medicine Delivery', 'Doctor Consultation', 'Diet Food', 'Transportation', 'Body Massage', 'House Cleaning'],
    services_hi: ['दवाई डिलीवरी', 'डॉक्टर परामर्श', 'डाइट खाना', 'परिवहन', 'बॉडी मसाज', 'घर की सफाई'],
    serviceKeys: ['medicine', 'doctor', 'diet_food', 'transport', 'massage', 'cleaning'],
    tag_en: 'All Access',
    tag_hi: 'पूर्ण एक्सेस',
  }
];

const ALL_SERVICES = [
  { key: 'medicine', name_en: 'Medicine Delivery', name_hi: 'दवाई डिलीवरी' },
  { key: 'doctor', name_en: 'Doctor Consultation', name_hi: 'डॉक्टर परामर्श' },
  { key: 'diet_food', name_en: 'Diet Food', name_hi: 'डाइट खाना' },
  { key: 'transport', name_en: 'Transportation', name_hi: 'परिवहन' },
  { key: 'massage', name_en: 'Body Massage', name_hi: 'बॉडी मसाज' },
  { key: 'cleaning', name_en: 'House Cleaning', name_hi: 'घर की सफाई' },
];

export { PLANS };

export default function Subscription() {
  const { updateUser, user, logout } = useAuth();
  const { language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const isHi = language === 'hi';

  const getPrice = (plan) => {
    if (currency === 'USD') return `$${plan.priceUSD}`;
    if (currency === 'EUR') return `€${plan.priceEUR}`;
    return `₹${plan.priceINR.toLocaleString('en-IN')}`;
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowConfirm(true);
  };

  const proceedToPayment = () => {
    setShowConfirm(false);
    setShowPayment(true);
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
      updateUser({
        subscription: {
          plan: selectedPlan.id,
          serviceKeys: selectedPlan.serviceKeys,
          subscribedAt: now.toISOString(),
          expiresAt,
        }
      });
      setIsProcessing(false);
      setShowPayment(false);
    }, 1500); // mock processing time
  };

  return (
    <div className="page" style={{ padding: '16px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={logout}
          style={{ fontSize: '14px' }}
        >
          {isHi ? 'लॉगआउट' : 'Logout'} 🚪
        </button>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px'
        }}>
          {isHi ? 'अपना प्लान चुनें' : 'Choose Your Plan'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {isHi ? 'मासिक सदस्यता • कभी भी रद्द करें' : 'Monthly Subscription • Cancel Anytime'}
        </p>
      </div>

      {/* Currency Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '24px'
      }}>
        {['INR', 'USD', 'EUR'].map(c => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: currency === c ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: currency === c ? 'var(--primary-glow)' : 'transparent',
              color: currency === c ? 'var(--primary-light)' : 'var(--text-muted)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {c === 'INR' ? '₹ INR' : c === 'USD' ? '$ USD' : '€ EUR'}
          </button>
        ))}
      </div>

      {/* SOS Note */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '12px',
        padding: '12px 16px',
        textAlign: 'center',
        marginBottom: '24px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        🚨 {isHi ? 'SOS इमरजेंसी सभी प्लान में उपलब्ध है' : 'Emergency SOS is available in all plans'}
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            style={{
              background: 'var(--bg-card)',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border)',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div style={{
                background: plan.gradient,
                color: 'white',
                textAlign: 'center',
                padding: '6px',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                ⭐ {isHi ? 'सबसे लोकप्रिय' : 'MOST POPULAR'}
              </div>
            )}

            <div style={{ padding: '24px' }}>
              {/* Plan header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: plan.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {plan.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {isHi ? plan.name_hi : plan.name_en}
                  </h2>
                  <span style={{
                    fontSize: '12px',
                    color: plan.color,
                    fontWeight: '600',
                    background: `${plan.color}15`,
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    {isHi ? plan.tag_hi : plan.tag_en}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {getPrice(plan)}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                  /{isHi ? 'माह' : 'month'}
                </span>
              </div>

              {/* Services list — show all services, green tick or red cross */}
              <div style={{ marginBottom: '20px' }}>
                {ALL_SERVICES.map((service, i) => {
                  const included = plan.serviceKeys.includes(service.key);
                  return (
                    <div key={service.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      borderBottom: i < ALL_SERVICES.length ? '1px solid var(--border)' : 'none'
                    }}>
                      <span style={{
                        color: included ? 'var(--success)' : 'var(--danger)',
                        fontSize: '16px',
                        fontWeight: '700',
                        width: '20px',
                        textAlign: 'center'
                      }}>
                        {included ? '✓' : '✗'}
                      </span>
                      <span style={{
                        color: included ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '0.95rem',
                        textDecoration: included ? 'none' : 'line-through',
                        opacity: included ? 1 : 0.6
                      }}>
                        {isHi ? service.name_hi : service.name_en}
                      </span>
                    </div>
                  );
                })}
                {/* SOS always included */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 0',
                }}>
                  <span style={{ color: 'var(--success)', fontSize: '16px', fontWeight: '700', width: '20px', textAlign: 'center' }}>✓</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {isHi ? 'इमरजेंसी SOS' : 'Emergency SOS'} 🚨
                  </span>
                </div>
              </div>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(plan)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: plan.gradient,
                  color: 'white',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
              >
                {isHi ? 'सब्सक्राइब करें' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{selectedPlan.icon}</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.5rem' }}>
              {isHi ? 'सब्सक्रिप्शन की पुष्टि करें' : 'Confirm Subscription'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '1rem' }}>
              {isHi ? selectedPlan.name_hi : selectedPlan.name_en} {isHi ? 'प्लान' : 'Plan'}
            </p>
            <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.8rem', margin: '12px 0' }}>
              {getPrice(selectedPlan)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/{isHi ? 'माह' : 'month'}</span>
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              {isHi ? '30 दिनों के लिए वैध' : 'Valid for 30 days'}
            </p>
            <button
              onClick={proceedToPayment}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: selectedPlan.gradient,
                color: 'white',
                border: 'none',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              {isHi ? 'पुष्टि करें' : 'Confirm & Pay'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPayment && selectedPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease'
          }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '4px', fontSize: '1.4rem' }}>
              {isHi ? 'सुरक्षित भुगतान' : 'Secure Payment'} 🔒
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem' }}>
              {isHi ? 'भुगतान विधि चुनें' : 'Choose payment method'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'UPI', label_en: 'UPI (GPay, PhonePe, Paytm)', label_hi: 'UPI (GPay, PhonePe, Paytm)', icon: '📱' },
                { id: 'Card', label_en: 'Credit / Debit Card', label_hi: 'क्रेडिट / डेबिट कार्ड', icon: '💳' },
                { id: 'NetBanking', label_en: 'Net Banking', label_hi: 'नेट बैंकिंग', icon: '🏦' }
              ].map(method => (
                <div
                  key={method.id}
                  onClick={() => !isProcessing && setSelectedPayment(method.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedPayment === method.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedPayment === method.id ? 'var(--primary-glow)' : 'transparent',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isProcessing ? 0.6 : 1
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{method.icon}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', flex: 1, textAlign: 'left' }}>
                    {isHi ? method.label_hi : method.label_en}
                  </span>
                  {selectedPayment === method.id && (
                    <span style={{ color: 'var(--primary)', fontSize: '20px' }}>✓</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{isHi ? 'कुल राशि' : 'Total Amount'}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{getPrice(selectedPlan)}</span>
              </div>
            </div>

            <button
              onClick={processPayment}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: isProcessing ? 'var(--text-muted)' : selectedPlan.gradient,
                color: 'white',
                border: 'none',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  {isHi ? 'प्रोसेसिंग...' : 'Processing...'}
                </>
              ) : (
                 `${isHi ? 'भुगतान करें' : 'Pay'} ${getPrice(selectedPlan)}`
              )}
            </button>
            <button
              onClick={() => { setShowPayment(false); setShowConfirm(true); }}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1
              }}
            >
              {isHi ? 'वापस जाएं' : 'Back'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
