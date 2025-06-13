import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  Package, 
  CreditCard, 
  Settings, 
  Code2, 
  Palette,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

// Import individual tab components
import DashboardTab from '../components/admin/DashboardTab';
import UsersTab from '../../components/admin/UsersTab';
import ItemsTab from '../../components/admin/ItemsTab';
import TransactionsTab from '../../components/admin/TransactionsTab';
import SettingsTab from '../../components/admin/SettingsTab';
import APIToolsTab from '../../components/admin/APIToolsTab';
import ThemeTab from '../../components/admin/ThemeTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    users: { total: 2150, growth: 8, new: 48 },
    items: { total: 6532, growth: 5, new: 124 },
    transactions: { total: 3215, growth: 12, new: 42 },
    revenue: { total: 62250.00, growth: 14, new: 1105.00 }
  });
  
  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'api', label: 'API Tools', icon: Code2 }
  ];
  
  const styles = {
    container: {
      backgroundColor: themeColors.background,
      minHeight: '100vh',
      color: themeColors.text
    },
    
    header: {
      backgroundColor: themeColors.cardBackground,
      padding: '24px',
      borderBottom: `1px solid ${themeColors.secondary}`,
    },
    
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: themeColors.text
    },
    
    subtitle: {
      color: themeColors.textSecondary,
      fontSize: '16px'
    },
    
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
    },
    
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '32px',
      flexWrap: 'wrap',
    },
    
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '8px',
      color: themeColors.textSecondary,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    
    activeTab: {
      backgroundColor: themeColors.primary,
      color: 'white',
    },
    
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    
    statCard: {
      backgroundColor: themeColors.cardBackground,
      padding: '24px',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
    },
    
    statIcon: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      opacity: 0.1,
    },
    
    statLabel: {
      color: themeColors.textSecondary,
      fontSize: '14px',
      marginBottom: '8px',
    },
    
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    
    statGrowth: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
    },
    
    growthPositive: {
      color: '#10b981',
    },
    
    growthNegative: {
      color: '#ef4444',
    },
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab stats={stats} />;
      case 'users':
        return <UsersTab />;
      case 'items':
        return <ItemsTab />;
      case 'transactions':
        return <TransactionsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'theme':
        return <ThemeTab />;
      case 'api':
        return <APIToolsTab />;
      default:
        return <DashboardTab stats={stats} />;
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.username}! Here's what's happening with BabyResell.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={styles.content}>
        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.activeTab : {})
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;