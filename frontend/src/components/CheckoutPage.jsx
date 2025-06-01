import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Shield, Package, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI, userAPI } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY');

// Checkout form component
const CheckoutForm = ({ item, shippingAddress, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { themeColors } = useTheme();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on backend
      const { data } = await transactionAPI.createPaymentIntent({
        itemId: item._id,
        amount: item.price,
        shippingAddress
      });

      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            address: {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country || 'US'
            }
          }
        }
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          setSucceeded(true);
          // Create transaction record
          await transactionAPI.createTransaction({
            pinId: item._id,
            paymentIntentId: result.paymentIntent.id,
            paymentMethod: 'card',
            shippingAddress,
            amount: item.price
          });
          onSuccess(result.paymentIntent);
        }
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: themeColors.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: themeColors.textSecondary
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        padding: '20px',
        backgroundColor: themeColors.secondary,
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <CardElement options={cardStyle} />
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <AlertCircle size={20} style={{ marginRight: '8px' }} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || succeeded}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: processing || succeeded ? '#666' : themeColors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: processing || succeeded ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {processing ? (
          <>Processing...</>
        ) : succeeded ? (
          <>Payment Successful!</>
        ) : (
          <>
            <CreditCard size={20} style={{ marginRight: '8px' }} />
            Place Order - ${item.price.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

// Main checkout page component
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  const [item, setItem] = useState(location.state?.item || null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!item) {
      navigate('/');
      return;
    }

    // Load user's saved addresses
    loadSavedAddresses();
  }, [isAuthenticated, item, navigate]);

  const loadSavedAddresses = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.data.success && response.data.data.shippingAddresses) {
        setSavedAddresses(response.data.data.shippingAddresses);
        // Use default address if available
        const defaultAddr = response.data.data.shippingAddresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setShippingAddress(defaultAddr);
          setUseNewAddress(false);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    // Navigate to success page
    navigate('/payment-success', {
      state: {
        item,
        paymentIntent,
        message: 'Your order has been placed! The seller will be notified to ship your item.'
      }
    });
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      backgroundColor: themeColors.background, 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto' 
      }}>
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            color: themeColors.text,
            marginBottom: '24px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          <ArrowLeft size={20} style={{ marginRight: '8px' }} />
          Back
        </button>

        <h1 style={{ 
          color: themeColors.text, 
          marginBottom: '32px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          Checkout
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 350px', 
          gap: '24px',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Left Column - Shipping & Payment */}
          <div>
            {/* Shipping Address */}
            <div style={{
              backgroundColor: themeColors.cardBackground,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{ 
                color: themeColors.text, 
                marginBottom: '20px',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Shipping Address
              </h2>

              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginBottom: '12px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      checked={!useNewAddress}
                      onChange={() => setUseNewAddress(false)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ color: themeColors.text }}>Use saved address</span>
                  </label>
                  
                  {!useNewAddress && (
                    <select
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: themeColors.secondary,
                        color: themeColors.text,
                        border: 'none',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}
                      onChange={(e) => {
                        const addr = savedAddresses.find(a => a._id === e.target.value);
                        if (addr) setShippingAddress(addr);
                      }}
                    >
                      {savedAddresses.map(addr => (
                        <option key={addr._id} value={addr._id}>
                          {addr.name} - {addr.line1}, {addr.city}, {addr.state}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      checked={useNewAddress}
                      onChange={() => setUseNewAddress(true)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ color: themeColors.text }}>Use new address</span>
                  </label>
                </div>
              )}

              {(useNewAddress || savedAddresses.length === 0) && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={shippingAddress.name}
                    onChange={handleAddressChange}
                    required
                    style={{
                      padding: '12px',
                      backgroundColor: themeColors.secondary,
                      color: themeColors.text,
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <input
                    type="text"
                    name="line1"
                    placeholder="Address Line 1"
                    value={shippingAddress.line1}
                    onChange={handleAddressChange}
                    required
                    style={{
                      padding: '12px',
                      backgroundColor: themeColors.secondary,
                      color: themeColors.text,
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <input
                    type="text"
                    name="line2"
                    placeholder="Address Line 2 (Optional)"
                    value={shippingAddress.line2}
                    onChange={handleAddressChange}
                    style={{
                      padding: '12px',
                      backgroundColor: themeColors.secondary,
                      color: themeColors.text,
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      required
                      style={{
                        padding: '12px',
                        backgroundColor: themeColors.secondary,
                        color: themeColors.text,
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      required
                      maxLength="2"
                      style={{
                        padding: '12px',
                        backgroundColor: themeColors.secondary,
                        color: themeColors.text,
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="ZIP"
                      value={shippingAddress.postalCode}
                      onChange={handleAddressChange}
                      required
                      style={{
                        padding: '12px',
                        backgroundColor: themeColors.secondary,
                        color: themeColors.text,
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div style={{
              backgroundColor: themeColors.cardBackground,
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ 
                color: themeColors.text, 
                marginBottom: '20px',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Payment Method
              </h2>

              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  item={item}
                  shippingAddress={shippingAddress}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>

              {/* Buyer Protection Notice */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <Shield size={20} color="#22c55e" style={{ marginRight: '12px', marginTop: '2px' }} />
                <div>
                  <h3 style={{ 
                    color: '#22c55e', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    Buyer Protection
                  </h3>
                  <p style={{ 
                    color: themeColors.textSecondary, 
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    Your payment will be held securely until you confirm receipt of your item. 
                    You have 3 days after delivery to inspect your purchase.
                  </p>
                </div>
              </div>

              {/* Terms Agreement */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginTop: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                color: themeColors.textSecondary
              }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginRight: '8px', marginTop: '4px' }}
                />
                <span>
                  I agree to BabyResell's Terms of Service and understand that my payment 
                  will be released to the seller after I confirm receipt of the item.
                </span>
              </label>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div style={{
            backgroundColor: themeColors.cardBackground,
            borderRadius: '12px',
            padding: '24px',
            height: 'fit-content',
            position: 'sticky',
            top: '20px'
          }}>
            <h2 style={{ 
              color: themeColors.text, 
              marginBottom: '20px',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Order Summary
            </h2>

            {/* Item Details */}
            <div style={{ 
              display: 'flex', 
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: `1px solid ${themeColors.secondary}`
            }}>
              <img
                src={item.thumbnail || item.image}
                alt={item.title}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginRight: '16px'
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: themeColors.text, 
                  fontSize: '16px',
                  marginBottom: '4px'
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  color: themeColors.textSecondary, 
                  fontSize: '14px',
                  marginBottom: '4px'
                }}>
                  Condition: {item.condition}
                </p>
                <p style={{ 
                  color: themeColors.textSecondary, 
                  fontSize: '14px'
                }}>
                  Seller: {item.user?.username}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: `1px solid ${themeColors.secondary}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '14px'
              }}>
                <span style={{ color: themeColors.textSecondary }}>Item Price</span>
                <span style={{ color: themeColors.text }}>${item.price.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '14px'
              }}>
                <span style={{ color: themeColors.textSecondary }}>Shipping</span>
                <span style={{ color: themeColors.text }}>
                  {item.shippingCost ? `$${item.shippingCost.toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '14px'
              }}>
                <span style={{ color: themeColors.textSecondary }}>Platform Fee</span>
                <span style={{ color: themeColors.text }}>
                  ${(item.price * 0.05).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              <span style={{ color: themeColors.text }}>Total</span>
              <span style={{ color: themeColors.primary }}>
                ${(item.price + (item.shippingCost || 0) + (item.price * 0.05)).toFixed(2)}
              </span>
            </div>

            {/* Delivery Estimate */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: themeColors.secondary,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px'
            }}>
              <Package size={18} style={{ marginRight: '8px', color: themeColors.textSecondary }} />
              <span style={{ color: themeColors.textSecondary }}>
                Estimated delivery: 3-7 business days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;