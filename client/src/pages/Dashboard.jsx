import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import LanguageSelector from '../components/LanguageSelector.jsx';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [recentOrders, setRecentOrders] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/orders`, { headers: { 'x-user-id': user?._id || 'user1' } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRecentOrders(data.slice(0, 2)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const tips = t('dashboard.health_tips');
    if (Array.isArray(tips)) {
      const interval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % tips.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [language]);

  const services = [
    { key: 'diet_food', icon: '🍱', path: '/diet-food', className: 'food' },
    { key: 'massage', icon: '💆', path: '/massage', className: 'massage' },
    { key: 'medicine', icon: '💊', path: '/medicine', className: 'medicine' },
    { key: 'cleaning', icon: '🧹', path: '/cleaning', className: 'cleaning' },
    { key: 'doctor', icon: '👨‍⚕️', path: '/doctor', className: 'doctor' },
    { key: 'transport', icon: '🚕', path: '/transport', className: 'transport' },
    { key: 'sos', icon: '🚨', path: '/sos', className: 'sos-card' },
  ];

  const tips = t('dashboard.health_tips');

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LanguageSelector compact />
        <button className="btn btn-ghost btn-sm" onClick={logout} id="logout-btn">
          {t('common.logout')} 🚪
        </button>
      </div>

      {/* Greeting */}
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">{t('greeting')}, {user?.name?.split(' ')[0] || 'User'} 🙏</h1>
        <p className="dashboard-subtitle">{t('tagline')}</p>
      </div>

      {/* Health Tip Banner */}
      {Array.isArray(tips) && (
        <div className="health-tip-banner">
          <span className="health-tip-icon">💡</span>
          <div>
            <div className="health-tip-label">{t('dashboard.health_tip')}</div>
            <div className="health-tip-text">{tips[tipIndex]}</div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="section-header">
        <h2 className="section-title">{language === 'en' ? 'Services' : t('dashboard.quick_actions')}</h2>
      </div>
      <div className="services-grid">
        {services.map(service => (
          <button
            key={service.key}
            className={`service-card ${service.className}`}
            onClick={() => navigate(service.path)}
            id={`service-${service.key}`}
            aria-label={t(`services.${service.key}`)}
          >
            <span className="service-card-icon">{service.icon}</span>
            <span className="service-card-title">{t(`services.${service.key}`)}</span>
            <span className="service-card-desc">{t(`services.${service.key}_desc`)}</span>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.recent_orders')}</h2>
            <button className="section-action" onClick={() => navigate('/orders')}>{t('common.history')}</button>
          </div>
          {recentOrders.map(order => (
            <div key={order._id} className="order-card" onClick={() => navigate('/orders')}>
              <div className="order-card-header">
                <span className={`order-type-badge badge-${order.orderType}`}>
                  {order.orderType === 'food' ? '🍱' : '💊'} {order.orderType}
                </span>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              <p className="order-items-preview">
                {order.items?.map(i => i.name).join(', ')}
              </p>
              <div className="order-footer">
                <span className="order-amount">₹{order.totalAmount}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
