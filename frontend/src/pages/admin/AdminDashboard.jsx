import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, CreditCard, Settings, Database, BarChart2, Shield, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import ApiConnectionTest from '../../components/ApiConnectionTest';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApiTest, setShowApiTest] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Check if user is admin on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/admin' } });
      return;
    }
    
    if (!isAdmin()) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate, isAdmin]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats and recent activity
        const [stats, activity] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getRecentActivity(),
        ]);
        
        setStatsData(stats);
        setRecentActivity(activity.activities || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Fallback to placeholder data
        setStatsData({
          users: { total: 2150, newToday: 48, growth: 8 },
          items: { total: 6532, active: 4890, sold: 1642, newToday: 124, growth: 5 },
          transactions: { total: 3215, pending: 56, completed: 3159, today: 42, growth: 12 },
          revenue: { total: 62250, today: 1105, growth: 14 },
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && isAdmin()) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin]);

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Style objects for dark theme
  const containerStyle = {
    backgroundColor: themeColors.background,
    minHeight: '100vh',
    padding: '20px'
  };

  const cardStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const statCardStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const tabStyle = {
    backgroundColor: themeColors.cardBackground,
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '12px 20px',
    borderRadius: '8px',
    marginRight: '12px',
    cursor: 'pointer',
    backgroundColor: isActive ? themeColors.primary : 'transparent',
    color: isActive ? 'white' : themeColors.text,
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  });

  const iconContainerStyle = (bgColor) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: bgColor,
    marginBottom: '16px'
  });

  const statValueStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: '4px'
  };

  const statLabelStyle = {
    color: themeColors.textSecondary,
    fontSize: '14px',
    marginBottom: '8px'
  };

  const growthIndicatorStyle = (positive) => ({
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: positive ? '#22c55e' : '#ef4444',
    fontWeight: '600'
  });

  const buttonStyle = {
    backgroundColor: themeColors.primary,
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '12px',
    transition: 'background-color 0.2s ease'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: themeColors.text, fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: themeColors.textSecondary, fontSize: '16px' }}>
          Welcome back, {user?.username}! Here's what's happening with BabyResell.
        </p>
      </div>
      
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}
      
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
      {activeTab === 'dashboard' && statsData && (
        <div>
          {/* Stats Overview */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* Users Stat */}
            <div style={statCardStyle}>
              <div style={iconContainerStyle('rgba(59, 130, 246, 0.2)')}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div style={statLabelStyle}>Active Users</div>
              <div style={statValueStyle}>{formatNumber(statsData.users.total)}</div>
              <div style={growthIndicatorStyle(statsData.users.growth > 0)}>
                <TrendingUp size={16} style={{ marginRight: '4px' }} />
                +{statsData.users.newToday} today ({statsData.users.growth}%)
              </div>
            </div>
            
            {/* Items Stat */}
            <div style={statCardStyle}>
              <div style={iconContainerStyle('rgba(34, 197, 94, 0.2)')}>
                <ShoppingBag size={24} color="#22c55e" />
              </div>
              <div style={statLabelStyle}>Listed Items</div>
              <div style={statValueStyle}>{formatNumber(statsData.items.total)}</div>
              <div style={growthIndicatorStyle(statsData.items.growth > 0)}>
                <TrendingUp size={16} style={{ marginRight: '4px' }} />
                +{statsData.items.newToday} today ({statsData.items.growth}%)
              </div>
            </div>
            
            {/* Transactions Stat */}
            <div style={statCardStyle}>
              <div style={iconContainerStyle('rgba(249, 115, 22, 0.2)')}>
                <CreditCard size={24} color="#f97316" />
              </div>
              <div style={statLabelStyle}>Transactions</div>
              <div style={statValueStyle}>{formatNumber(statsData.transactions.total)}</div>
              <div style={growthIndicatorStyle(statsData.transactions.growth > 0)}>
                <TrendingUp size={16} style={{ marginRight: '4px' }} />
                +{statsData.transactions.today} today ({statsData.transactions.growth}%)
              </div>
            </div>
            
            {/* Revenue Stat */}
            <div style={statCardStyle}>
              <div style={iconContainerStyle('rgba(168, 85, 247, 0.2)')}>
                <Shield size={24} color="#a855f7" />
              </div>
              <div style={statLabelStyle}>Revenue</div>
              <div style={statValueStyle}>{formatCurrency(statsData.revenue.total)}</div>
              <div style={growthIndicatorStyle(statsData.revenue.growth > 0)}>
                <TrendingUp size={16} style={{ marginRight: '4px' }} />
                {formatCurrency(statsData.revenue.today)} today ({statsData.revenue.growth}%)
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={cardStyle}>
            <h2 style={{ color: themeColors.text, fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Recent Activity
            </h2>
            
            {recentActivity.length > 0 ? (
              <div>
                {recentActivity.map((activity) => (
                  <div key={activity.id} style={{
                    padding: '16px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ color: themeColors.text, margin: '0 0 4px 0' }}>
                        {activity.description}
                      </p>
                      <span style={{ color: themeColors.textSecondary, fontSize: '12px' }}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      backgroundColor: themeColors.secondary,
                      color: themeColors.textSecondary,
                      fontSize: '12px'
                    }}>
                      {activity.type.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: themeColors.textSecondary }}>
                No recent activity to display.
              </p>
            )}
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