import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColors } = useTheme();
  
  // Get data passed from checkout
  const { item, message } = location.state || {};
  
  useEffect(() => {
    // Clear any payment-related data from localStorage
    localStorage.removeItem('pendingPayment');
    
    // Redirect to home if no payment data
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: themeColors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: themeColors.cardBackground,
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <CheckCircle size={48} color="#22c55e" />
        </div>
        
        {/* Success Message */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: themeColors.text,
          marginBottom: '16px'
        }}>
          Payment Successful!
        </h1>
        
        <p style={{
          color: themeColors.textSecondary,
          marginBottom: '32px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          {message || 'Your order has been placed successfully. The seller will be notified to ship your item.'}
        </p>
        
        {/* Order Details */}
        {item && (
          <div style={{
            backgroundColor: themeColors.secondary,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{
              color: themeColors.text,
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Order Details
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <img
                src={item.thumbnail || item.image}
                alt={item.title}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginRight: '16px'
                }}
              />
              <div>
                <p style={{
                  color: themeColors.text,
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {item.title}
                </p>
                <p style={{
                  color: themeColors.textSecondary,
                  fontSize: '14px'
                }}>
                  ${item.price?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Next Steps */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{
            color: '#3b82f6',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            What happens next?
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: themeColors.text,
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '8px' }}>
              <Package size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              The seller will ship your item within 2 business days
            </li>
            <li style={{ marginBottom: '8px' }}>
              <ArrowRight size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              You'll receive tracking information via email
            </li>
            <li>
              <CheckCircle size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Confirm delivery to release payment to seller
            </li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: themeColors.text,
              border: `1px solid ${themeColors.secondary}`,
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            View Order
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: themeColors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;