import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, CreditCard, Settings, Database, BarChart2, Shield } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ApiConnectionTest from '../../components/ApiConnectionTest';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApiTest, setShowApiTest] = useState(false);
  
  // Sample stats data - in a real app, fetch from API
  const [statsData] = useState({
    users: {
      total: 2150,
      newToday: 48,
      growth: 8
    },
    items: {
      total: 6532,
      active: 4890,
      sold: 1642,
      newToday: 124,
      growth: 5
    },
    transactions: {
      total: 3215,
      pending: 56,
      completed: 3159,
      today: 42,
      growth: 12
    },
    revenue: {
      total: 62250,
      today: 1105,
      growth: 14
    }
  });

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/admin' } });
      return;
    }
    
    // Check if user is admin
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Style objects for dark theme
  const containerStyle = {
    backgroundColor: themeColors.background,
    minHeight: '100vh',
    padding: '20px'
  };

  const cardStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const statCardStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  const tabStyle = {
    backgroundColor: themeColors.cardBackground,
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '10px 16px',
    borderRadius: '6px',
    marginRight: '10px',
    cursor: 'pointer',
    backgroundColor: isActive ? themeColors.primary : 'transparent',
    color: isActive ? 'white' : themeColors.text,
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center'
  });

  const iconContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    marginBottom: '10px'
  };

  const buttonStyle = {
    backgroundColor: themeColors.primary,
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '10px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ color: themeColors.text, marginBottom: '20px' }}>Admin Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div style={tabStyle}>
        <button 
          style={tabButtonStyle(activeTab === 'dashboard')}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart2 size={18} style={{ marginRight: '8px' }} />
          Dashboard
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'users')}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} style={{ marginRight: '8px' }} />
          Users
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'items')}
          onClick={() => setActiveTab('items')}
        >
          <ShoppingBag size={18} style={{ marginRight: '8px' }} />
          Items
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'transactions')}
          onClick={() => setActiveTab('transactions')}
        >
          <CreditCard size={18} style={{ marginRight: '8px' }} />
          Transactions
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'settings')}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} style={{ marginRight: '8px' }} />
          Settings
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'api')}
          onClick={() => setActiveTab('api')}
        >
          <Database size={18} style={{ marginRight: '8px' }} />
          API Tools
        </button>
      </div>
      
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Users Stat */}
            <div style={statCardStyle}>
              <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                <Users size={24} color="#3b82f6" />
              </div>
              <h3 style={{ color: themeColors.text, margin: '0 0 8px 0' }}>Active Users</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: themeColors.text }}>{statsData.users.total.toLocaleString()}</span>
                <span style={{ marginLeft: '8px', fontSize: '14px', color: 'rgb(34, 197, 94)' }}>+{statsData.users.newToday} today</span>
              </div>
            </div>
            
            {/* Items Stat */}
            <div style={statCardStyle}>
              <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                <ShoppingBag size={24} color="#22c55e" />
              </div>
              <h3 style={{ color: themeColors.text, margin: '0 0 8px 0' }}>Listed Items</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: themeColors.text }}>{statsData.items.total.toLocaleString()}</span>
                <span style={{ marginLeft: '8px', fontSize: '14px', color: 'rgb(34, 197, 94)' }}>+{statsData.items.newToday} today</span>
              </div>
            </div>
            
            {/* Transactions Stat */}
            <div style={statCardStyle}>
              <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(249, 115, 22, 0.2)' }}>
                <CreditCard size={24} color="#f97316" />
              </div>
              <h3 style={{ color: themeColors.text, margin: '0 0 8px 0' }}>Transactions</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: themeColors.text }}>{statsData.transactions.total.toLocaleString()}</span>
                <span style={{ marginLeft: '8px', fontSize: '14px', color: 'rgb(34, 197, 94)' }}>+{statsData.transactions.today} today</span>
              </div>
            </div>
            
            {/* Revenue Stat */}
            <div style={statCardStyle}>
              <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                <Shield size={24} color="#a855f7" />
              </div>
              <h3 style={{ color: themeColors.text, margin: '0 0 8px 0' }}>Revenue</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: themeColors.text }}>${statsData.revenue.total.toLocaleString()}</span>
                <span style={{ marginLeft: '8px', fontSize: '14px', color: 'rgb(34, 197, 94)' }}>+${statsData.revenue.today} today</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={cardStyle}>
            <h2 style={{ color: themeColors.text, marginBottom: '16px' }}>Recent Activity</h2>
            <p style={{ color: themeColors.textSecondary }}>Recent user actions and system events will appear here.</p>
          </div>
        </div>
      )}
      
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={cardStyle}>
          <h2 style={{ color: themeColors.text, marginBottom: '16px' }}>User Management</h2>
          <p style={{ color: themeColors.textSecondary }}>User management features to be implemented.</p>
        </div>
      )}
      
      {/* Items Tab */}
      {activeTab === 'items' && (
        <div style={cardStyle}>
          <h2 style={{ color: themeColors.text, marginBottom: '16px' }}>Item Management</h2>
          <p style={{ color: themeColors.textSecondary }}>Item management features to be implemented.</p>
        </div>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div style={cardStyle}>
          <h2 style={{ color: themeColors.text, marginBottom: '16px' }}>Transaction Management</h2>
          <p style={{ color: themeColors.textSecondary }}>Transaction management features to be implemented.</p>
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={cardStyle}>
          <h2 style={{ color: themeColors.text, marginBottom: '16px' }}>Admin Settings</h2>
          <p style={{ color: themeColors.textSecondary }}>Admin settings to be implemented.</p>
        </div>
      )}
      
      {/* API Tools Tab */}
      {activeTab === 'api' && (
        <div style={cardStyle}>
          <h2 style={{ color: themeColors.text, marginBottom: '16px' }}>API Testing Tools</h2>
          <button 
            style={buttonStyle}
            onClick={() => setShowApiTest(!showApiTest)}
          >
            {showApiTest ? 'Hide API Tester' : 'Show API Tester'}
          </button>
          
          {showApiTest && <ApiConnectionTest />}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;