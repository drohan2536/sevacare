import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { API_BASE_URL } from '../config.js';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/orders`, { headers: { 'x-user-id': 'user1' } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/services`, { headers: { 'x-user-id': 'user1' } }).then(r => r.json())
    ]).then(([orderData, bookingData]) => {
      if (Array.isArray(orderData)) setOrders(orderData);
      if (Array.isArray(bookingData)) setBookings(bookingData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusLabels = {
    placed: language === 'hi' ? 'ऑर्डर किया' : 'Placed',
    confirmed: language === 'hi' ? 'पुष्टि हुई' : 'Confirmed',
    preparing: language === 'hi' ? 'तैयार हो रहा' : 'Preparing',
    out_for_delivery: language === 'hi' ? 'डिलीवरी पर' : 'Out for Delivery',
    delivered: language === 'hi' ? 'डिलीवर हुआ' : 'Delivered',
    cancelled: language === 'hi' ? 'रद्द' : 'Cancelled',
    pending: language === 'hi' ? 'लंबित' : 'Pending',
    in_progress: language === 'hi' ? 'जारी' : 'In Progress',
    completed: language === 'hi' ? 'पूर्ण' : 'Completed'
  };

  const typeIcons = { food: '🍱', medicine: '💊', massage: '💆', cleaning: '🧹', doctor: '👨‍⚕️' };
  const statusSteps = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('common.orders')}</button>
      </nav>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <button
          className={`time-slot ${tab === 'orders' ? 'selected' : ''}`}
          onClick={() => setTab('orders')}
          style={{ flex: 1 }}
        >
          {language === 'hi' ? '📦 ऑर्डर' : '📦 Orders'}
        </button>
        <button
          className={`time-slot ${tab === 'bookings' ? 'selected' : ''}`}
          onClick={() => setTab('bookings')}
          style={{ flex: 1 }}
        >
          {language === 'hi' ? '📅 बुकिंग' : '📅 Bookings'}
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : tab === 'orders' ? (
        orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-text">{t('common.no_data')}</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <span className={`order-type-badge badge-${order.orderType}`}>
                  {typeIcons[order.orderType]} {order.orderType}
                </span>
                <span className={`status-badge status-${order.status}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <p className="order-items-preview">
                {order.items?.map(i => i.name).join(', ')}
              </p>

              {/* Provider Info (Food/Medicine) */}
              {order.provider && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>🏢 {order.provider.name}</div>
                  {order.provider.contact && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📞 {order.provider.contact}</div>}
                  
                  {order.provider.deliveryBoy && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                      <div style={{ fontSize: '28px' }}>{order.provider.deliveryBoy.photo}</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>{order.provider.deliveryBoy.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'डिलीवरी बॉय' : 'Delivery Partner'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>📞 {order.provider.deliveryBoy.phone}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Tracker */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="tracker-timeline" style={{ margin: '12px 0' }}>
                  {statusSteps.map((step, i) => {
                    const stepIndex = statusSteps.indexOf(order.status);
                    const isActive = i <= stepIndex;
                    const isCurrent = i === stepIndex;
                    return (
                      <div key={step} className="tracker-step">
                        <div className="tracker-dot-wrapper">
                          <div className={`tracker-dot ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}></div>
                          {i < statusSteps.length - 1 && <div className={`tracker-line ${isActive ? 'active' : ''}`}></div>}
                        </div>
                        <div className="tracker-content">
                          <div className="tracker-status" style={{ opacity: isActive ? 1 : 0.4 }}>
                            {statusLabels[step] || step}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="order-footer">
                <span className="order-amount">₹{order.totalAmount}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )
      ) : (
        bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p className="empty-state-text">{t('common.no_data')}</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking._id} className="order-card">
              <div className="order-card-header">
                <span className={`order-type-badge badge-${booking.serviceType}`}>
                  {typeIcons[booking.serviceType]} {booking.serviceType}
                </span>
                <span className={`status-badge status-${booking.status}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>
              <p className="order-items-preview">
                {booking.provider?.name || booking.serviceType} — {booking.subType || booking.serviceType}
              </p>

              {/* Provider Info (Massage/Doctor/Cleaning) */}
              {booking.provider && (
                <div style={{ marginTop: '12px', marginBottom: '12px', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>🏢 {booking.provider.name}</div>
                  {(booking.provider.contact || booking.provider.phone) && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📞 {booking.provider.contact || booking.provider.phone}</div>}
                  
                  {booking.provider.worker && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                      <div style={{ fontSize: '28px' }}>{booking.provider.worker.photo}</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>{booking.provider.worker.name}</div>
                        {booking.provider.worker.degree && <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: '600', marginTop: '2px' }}>{booking.provider.worker.degree}</div>}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>📞 {booking.provider.worker.phone}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
                📅 {new Date(booking.date).toLocaleDateString()} • ⏰ {booking.timeSlot}
              </div>
              <div className="order-footer">
                <span className="order-amount">₹{booking.amount}</span>
                {booking.status === 'pending' || booking.status === 'confirmed' ? (
                  <button className="btn btn-outline btn-sm" style={{ width: 'auto' }}>
                    {t('booking.cancel')}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
