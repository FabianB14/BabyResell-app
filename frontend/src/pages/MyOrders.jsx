import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const MyOrders = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buying');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Simulated data for now
    setTimeout(() => {
      setOrders([
        {
          _id: '1',
          pin: { title: 'Baby Stroller', thumbnail: 'https://via.placeholder.com/100' },
          status: 'shipped',
          amount: 75.00,
          seller: { username: 'seller123' },
          buyer: { username: 'buyer456' },
          createdAt: new Date().toISOString(),
          trackingNumber: '1234567890'
        }
      ]);
      setLoading(false);
    }, 500);
  }, [isAuthenticated, activeTab, navigate]);
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: themeColors.background 
      }}>
        <div className="loader"></div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: themeColors.background,
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '32px',
          color: themeColors.text 
        }}>
          My Orders
        </h1>
        
        {/* Placeholder for orders */}
        <div style={{
          backgroundColor: themeColors.cardBackground,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          color: themeColors.textSecondary
        }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Order tracking coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;