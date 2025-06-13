import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResponsiveCheckout from '../components/ResponsiveCheckout';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  if (!item) {
    navigate('/');
    return null;
  }

  const handleComplete = (orderDetails) => {
    // Navigate to success page
    navigate('/payment-success', { 
      state: { 
        item: orderDetails.item,
        message: 'Your order has been placed successfully!'
      }
    });
  };

  return (
    <ResponsiveCheckout 
      item={item}
      onBack={() => navigate(-1)}
      onComplete={handleComplete}
    />
  );
};

export default CheckoutPage;