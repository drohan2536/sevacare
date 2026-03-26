import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { API_BASE_URL } from '../config.js';

export default function Medicine() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [menu, setMenu] = useState(null);
  const [cart, setCart] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/orders/menu/medicine`)
      .then(r => r.json())
      .then(setMenu)
      .catch(() => {});
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.filter(c => c.id !== item.id));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'user1' },
        body: JSON.stringify({
          orderType: 'medicine',
          items: cart.map(c => ({ name: c.name, quantity: c.quantity, price: c.price, description: c.description })),
          deliveryAddress: '42 MG Road, Pune',
          prescriptionImage: prescriptionUploaded ? 'prescription_uploaded.jpg' : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        setCart([]);
        setTimeout(() => { setShowSuccess(false); navigate('/orders'); }, 2000);
      }
    } catch {
      alert(language === 'hi' ? 'ऑर्डर फ़ेल हो गया' : 'Order failed');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="page">
      <nav className="navbar">
        <button className="navbar-back" onClick={() => navigate('/')}>← {t('services.medicine')}</button>
      </nav>

      {/* Prescription Upload */}
      <div
        className="upload-area"
        style={{ marginTop: 16, borderColor: prescriptionUploaded ? 'var(--success)' : '' }}
        onClick={() => setPrescriptionUploaded(true)}
      >
        <div className="upload-icon">{prescriptionUploaded ? '✅' : '📄'}</div>
        <div className="upload-text">
          {prescriptionUploaded
            ? (language === 'hi' ? 'प्रिस्क्रिप्शन अपलोड हो गया' : 'Prescription Uploaded')
            : t('order.upload_prescription')
          }
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
          {language === 'hi' ? 'फ़ोटो लें या फ़ाइल चुनें' : 'Take a photo or choose file'}
        </p>
      </div>

      {/* Simulated partner badge */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '16px 0', flexWrap: 'wrap' }}>
        {['PharmEasy', 'Netmeds', '1mg'].map(partner => (
          <span key={partner} style={{
            padding: '6px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--text-secondary)'
          }}>
            {partner} Partner
          </span>
        ))}
      </div>

      {/* Menu */}
      {menu?.categories?.map(category => (
        <div key={category.name} className="menu-category">
          <h2 className="menu-category-title">{category.emoji} {category.name}</h2>
          {category.items.map(item => {
            const inCart = cart.find(c => c.id === item.id);
            return (
              <div key={item.id} className="menu-item">
                <div className="menu-item-icon">{item.image}</div>
                <div className="menu-item-info">
                  <div className="menu-item-name">{item.name}</div>
                  <div className="menu-item-desc">{item.description}</div>
                </div>
                <div className="menu-item-actions">
                  <div className="menu-item-price">₹{item.price}</div>
                  <button
                    className={`add-btn ${inCart ? 'added' : ''}`}
                    onClick={() => addToCart(item)}
                  >
                    {inCart ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {!menu && <div className="loading-spinner"><div className="spinner"></div></div>}

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-info">
            <span className="cart-count">{cart.length} {language === 'hi' ? 'आइटम' : 'items'}</span>
            <span className="cart-total">₹{total}</span>
          </div>
          <button className="cart-btn" onClick={placeOrder} id="place-medicine-order-btn">
            {t('order.place_order')} →
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">💊</div>
            <h2 className="modal-title">{t('order.order_placed')}</h2>
            <p className="modal-text">{t('order.delivery_time')}: 1-2 {language === 'hi' ? 'घंटे' : 'hours'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
