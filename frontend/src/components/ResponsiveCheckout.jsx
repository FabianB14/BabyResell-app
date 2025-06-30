import React, { useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, Shield, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const ResponsiveCheckout = ({ item, onBack, onComplete }) => {
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Shipping, 3: Payment
  
  // Calculate fees
  const itemPrice = item?.price || 0;
  const platformFee = itemPrice * 0.08;
  const shipping = 5.00; // Fixed shipping for demo
  const total = itemPrice + shipping;
  const sellerReceives = itemPrice - platformFee;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      if (onComplete) {
        onComplete({
          item,
          total,
          shipping: shippingInfo,
          payment: { last4: paymentInfo.cardNumber.slice(-4) }
        });
      }
    }, 2000);
  };
  
  const styles = {
    container: {
      backgroundColor: '#121212',
      minHeight: '100vh',
      color: '#ffffff',
    },
    
    header: {
      position: 'sticky',
      top: 0,
      backgroundColor: '#1e1e1e',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #2e2e2e',
      zIndex: 10,
    },
    
    backButton: {
      background: 'none',
      border: 'none',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '8px',
      marginLeft: '-8px',
    },
    
    title: {
      fontSize: '20px',
      fontWeight: '600',
      marginLeft: '16px',
    },
    
    content: {
      padding: '16px',
      maxWidth: '600px',
      margin: '0 auto',
    },
    
    section: {
      backgroundColor: '#1e1e1e',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    },
    
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    
    itemCard: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    
    itemImage: {
      width: '60px',
      height: '60px',
      borderRadius: '8px',
      objectFit: 'cover',
    },
    
    itemDetails: {
      flex: 1,
    },
    
    itemTitle: {
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px',
    },
    
    itemPrice: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#e60023',
    },
    
    priceBreakdown: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      paddingTop: '12px',
      borderTop: '1px solid #2e2e2e',
    },
    
    priceRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
    },
    
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '18px',
      fontWeight: '600',
      paddingTop: '8px',
      borderTop: '1px solid #2e2e2e',
    },
    
    formGroup: {
      marginBottom: '16px',
    },
    
    label: {
      display: 'block',
      fontSize: '14px',
      color: '#b0b0b0',
      marginBottom: '6px',
    },
    
    input: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#2e2e2e',
      border: '1px solid #444',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '16px',
    },
    
    inputRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    
    buyButton: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#e60023',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '24px',
    },
    
    securityNote: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      color: '#b0b0b0',
      marginTop: '12px',
    },
    
    steps: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px',
      padding: '0 16px',
    },
    
    step: {
      flex: 1,
      textAlign: 'center',
      position: 'relative',
    },
    
    stepNumber: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#2e2e2e',
      color: '#b0b0b0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 4px',
      fontSize: '14px',
      fontWeight: '600',
    },
    
    stepNumberActive: {
      backgroundColor: '#e60023',
      color: '#ffffff',
    },
    
    stepLabel: {
      fontSize: '12px',
      color: '#b0b0b0',
    },
    
    stepLabelActive: {
      color: '#ffffff',
    },
    
    stepConnector: {
      position: 'absolute',
      top: '16px',
      left: '50%',
      right: '-50%',
      height: '2px',
      backgroundColor: '#2e2e2e',
      zIndex: -1,
    },
    
    stepConnectorActive: {
      backgroundColor: '#e60023',
    },
    
    mobileOnly: {
      '@media (min-width: 768px)': {
        display: 'none',
      }
    },
    
    desktopOnly: {
      display: 'none',
      '@media (min-width: 768px)': {
        display: 'block',
      }
    }
  };
  
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <>
            {/* Item Review */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                Review Item
              </h3>
              <div style={styles.itemCard}>
                <img 
                  src={item?.thumbnail || item?.image || 'https://via.placeholder.com/60'}
                  alt={item?.title}
                  style={styles.itemImage}
                />
                <div style={styles.itemDetails}>
                  <div style={styles.itemTitle}>{item?.title}</div>
                  <div style={{ fontSize: '12px', color: '#b0b0b0' }}>
                    Condition: {item?.condition}
                  </div>
                </div>
                <div style={styles.itemPrice}>
                  ${itemPrice.toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Price Breakdown */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                Price Details
              </h3>
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>Item Price</span>
                  <span>${itemPrice.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span style={{ color: '#b0b0b0', fontSize: '12px' }}>
                    Platform Fee (8%)
                  </span>
                  <span style={{ color: '#b0b0b0', fontSize: '12px' }}>
                    -${platformFee.toFixed(2)}
                  </span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Seller info */}
              <div style={{ 
                marginTop: '16px', 
                padding: '12px',
                backgroundColor: '#2e2e2e',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#b0b0b0'
              }}>
                <Shield size={16} style={{ marginBottom: '4px' }} />
                Seller receives ${sellerReceives.toFixed(2)} after platform fee
              </div>
            </div>
            
            <button
              style={styles.buyButton}
              onClick={() => setCurrentStep(2)}
            >
              Continue to Shipping
            </button>
          </>
        );
        
      case 2:
        return (
          <>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <MapPin size={20} />
                Shipping Address
              </h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <input
                  type="text"
                  style={styles.input}
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  placeholder="123 Main St"
                />
              </div>
              
              <div style={styles.inputRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>City</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    placeholder="Seattle"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>State</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                    placeholder="WA"
                    maxLength="2"
                  />
                </div>
              </div>
              
              <div style={styles.inputRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ZIP Code</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={shippingInfo.zip}
                    onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
                    placeholder="98101"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    style={styles.input}
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
            
            <button
              style={styles.buyButton}
              onClick={() => setCurrentStep(3)}
            >
              Continue to Payment
            </button>
          </>
        );
        
      case 3:
        return (
          <form onSubmit={handleSubmit}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <CreditCard size={20} />
                Payment Information
              </h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Card Number</label>
                <input
                  type="text"
                  style={styles.input}
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Name on Card</label>
                <input
                  type="text"
                  style={styles.input}
                  value={paymentInfo.cardName}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              
              <div style={styles.inputRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Expiry Date</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={paymentInfo.expiry}
                    onChange={(e) => setPaymentInfo({...paymentInfo, expiry: e.target.value})}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>CVV</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>
              
              <div style={styles.securityNote}>
                <Shield size={16} />
                <span>Your payment info is secure and encrypted</span>
              </div>
            </div>
            
            {/* Order Summary */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Order Summary</h3>
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>{item?.title}</span>
                  <span>${itemPrice.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total</span>
                  <span style={{ color: '#e60023' }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              style={{
                ...styles.buyButton,
                opacity: processing ? 0.7 : 1,
              }}
              disabled={processing}
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard size={20} />
                  Complete Purchase
                </>
              )}
            </button>
            
            <div style={{ 
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '12px',
              color: '#b0b0b0'
            }}>
              <AlertCircle size={16} style={{ marginBottom: '-3px' }} />
              {' '}By completing this purchase, you agree to our terms of service
            </div>
          </form>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span className="hide-mobile">Back</span>
        </button>
        <h1 style={styles.title}>Checkout</h1>
      </div>
      
      {/* Progress Steps */}
      <div style={styles.steps}>
        {[1, 2, 3].map((step) => (
          <div key={step} style={styles.step}>
            <div style={{
              ...styles.stepNumber,
              ...(currentStep >= step ? styles.stepNumberActive : {})
            }}>
              {step}
            </div>
            <div style={{
              ...styles.stepLabel,
              ...(currentStep >= step ? styles.stepLabelActive : {})
            }}>
              {step === 1 ? 'Review' : step === 2 ? 'Shipping' : 'Payment'}
            </div>
            {step < 3 && (
              <div style={{
                ...styles.stepConnector,
                ...(currentStep > step ? styles.stepConnectorActive : {})
              }} />
            )}
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div style={styles.content}>
        {renderStep()}
      </div>
    </div>
  );
};

export default ResponsiveCheckout;