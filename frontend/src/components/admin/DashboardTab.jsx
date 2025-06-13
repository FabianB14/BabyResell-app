import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Users, 
  Package, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Eye,
  Heart,
  ShoppingBag,
  UserPlus,
  Bell,
  Download,
  RefreshCw
} from 'lucide-react';

const DashboardTab = ({ stats }) => {
  const { themeColors } = useTheme();
  const [timeRange, setTimeRange] = useState('7d');
  const [recentActivity, setRecentActivity] = useState([]);

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    loadRecentActivity();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadRecentActivity = () => {
    // Mock recent activity data
    const mockActivity = [
      {
        id: 1,
        type: 'new_user',
        message: 'New user registered: Emma Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        icon: UserPlus,
        color: '#3b82f6'
      },
      {
        id: 2,
        type: 'item_sold',
        message: 'Baby Stroller sold for $89.99',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        icon: ShoppingBag,
        color: '#10b981'
      },
      {
        id: 3,
        type: 'new_item',
        message: 'New item listed: Toddler Bed',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        icon: Package,
        color: '#f59e0b'
      },
      {
        id: 4,
        type: 'transaction',
        message: 'Payment processed: $125.00',
        timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
        icon: CreditCard,
        color: '#8b5cf6'
      }
    ];
    setRecentActivity(mockActivity);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '24px',
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '16px' : '24px',
    },

    title: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: 'bold',
      color: themeColors.text,
      margin: 0,
    },

    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      width: isMobile ? '100%' : 'auto',
    },

    timeRangeSelect: {
      padding: isMobile ? '8px 12px' : '6px 12px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: isMobile ? '14px' : '13px',
      cursor: 'pointer',
      minWidth: isMobile ? '120px' : '100px',
    },

    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: isMobile ? '8px 12px' : '6px 12px',
      backgroundColor: themeColors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '13px',
      fontWeight: '500',
    },

    secondaryButton: {
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
    },

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '12px' : '20px',
      marginBottom: isMobile ? '20px' : '24px',
    },

    statCard: {
      backgroundColor: themeColors.cardBackground,
      padding: isMobile ? '16px' : '20px',
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      position: 'relative',
      overflow: 'hidden',
    },

    statIcon: {
      position: 'absolute',
      top: isMobile ? '12px' : '16px',
      right: isMobile ? '12px' : '16px',
      width: isMobile ? '32px' : '40px',
      height: isMobile ? '32px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      opacity: 0.1,
    },

    statValue: {
      fontSize: isMobile ? '18px' : '24px',
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: '4px',
    },

    statLabel: {
      fontSize: isMobile ? '11px' : '12px',
      color: themeColors.textSecondary,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },

    statGrowth: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: isMobile ? '11px' : '12px',
      fontWeight: '500',
    },

    contentGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '2fr 1fr',
      gap: isMobile ? '16px' : '24px',
    },

    activityCard: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      padding: isMobile ? '16px' : '20px',
      order: isMobile ? 1 : 1,
    },

    quickActionsCard: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      padding: isMobile ? '16px' : '20px',
      height: 'fit-content',
      order: isMobile ? 2 : 2,
    },

    cardTitle: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: isMobile ? '12px' : '16px',
    },

    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '8px' : '12px',
    },

    activityItem: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '8px' : '12px',
      padding: isMobile ? '8px' : '12px',
      backgroundColor: themeColors.background,
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
    },

    activityIcon: {
      width: isMobile ? '32px' : '36px',
      height: isMobile ? '32px' : '36px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    activityContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      flex: 1,
      minWidth: 0, // Prevents text overflow
    },

    activityMessage: {
      fontSize: isMobile ? '13px' : '14px',
      color: themeColors.text,
      fontWeight: '500',
      lineHeight: '1.3',
    },

    activityTime: {
      fontSize: isMobile ? '11px' : '12px',
      color: themeColors.textSecondary,
    },

    quickActionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '8px' : '12px',
    },

    quickActionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: isMobile ? '10px' : '12px',
      backgroundColor: themeColors.background,
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    quickActionIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    quickActionContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      flex: 1,
    },

    quickActionTitle: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '500',
      color: themeColors.text,
    },

    quickActionDesc: {
      fontSize: isMobile ? '11px' : '12px',
      color: themeColors.textSecondary,
    },

    emptyState: {
      textAlign: 'center',
      padding: isMobile ? '20px' : '40px',
      color: themeColors.textSecondary,
    },
  };

  const quickActions = [
    {
      id: 1,
      title: 'View All Users',
      description: 'Manage user accounts',
      icon: Users,
      color: '#3b82f6',
      action: () => console.log('Navigate to users')
    },
    {
      id: 2,
      title: 'Review Items',
      description: 'Moderate new listings',
      icon: Package,
      color: '#10b981',
      action: () => console.log('Navigate to items')
    },
    {
      id: 3,
      title: 'Check Transactions',
      description: 'Monitor payments',
      icon: CreditCard,
      color: '#f59e0b',
      action: () => console.log('Navigate to transactions')
    },
    {
      id: 4,
      title: 'System Health',
      description: 'API status & performance',
      icon: Activity,
      color: '#8b5cf6',
      action: () => console.log('Navigate to API tools')
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard Overview</h2>
        <div style={styles.controls}>
          <select 
            style={styles.timeRangeSelect}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button style={{ ...styles.button, ...styles.secondaryButton }}>
            <Download size={14} />
            Export
          </button>
          <button style={styles.button} onClick={loadRecentActivity}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#3b82f6' }}>
            <Users size={isMobile ? 16 : 20} color="#3b82f6" />
          </div>
          <div style={styles.statValue}>{stats?.users?.total?.toLocaleString() || '2,150'}</div>
          <div style={styles.statLabel}>Total Users</div>
          <div style={{ ...styles.statGrowth, color: '#10b981' }}>
            <TrendingUp size={12} />
            +{stats?.users?.growth || 8}% this week
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#10b981' }}>
            <Package size={isMobile ? 16 : 20} color="#10b981" />
          </div>
          <div style={styles.statValue}>{stats?.items?.total?.toLocaleString() || '6,532'}</div>
          <div style={styles.statLabel}>Total Items</div>
          <div style={{ ...styles.statGrowth, color: '#10b981' }}>
            <TrendingUp size={12} />
            +{stats?.items?.growth || 5}% this week
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#f59e0b' }}>
            <CreditCard size={isMobile ? 16 : 20} color="#f59e0b" />
          </div>
          <div style={styles.statValue}>{stats?.transactions?.total?.toLocaleString() || '3,215'}</div>
          <div style={styles.statLabel}>Transactions</div>
          <div style={{ ...styles.statGrowth, color: '#10b981' }}>
            <TrendingUp size={12} />
            +{stats?.transactions?.growth || 12}% this week
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#8b5cf6' }}>
            <DollarSign size={isMobile ? 16 : 20} color="#8b5cf6" />
          </div>
          <div style={styles.statValue}>${stats?.revenue?.total?.toLocaleString() || '62,250'}</div>
          <div style={styles.statLabel}>Revenue</div>
          <div style={{ ...styles.statGrowth, color: '#10b981' }}>
            <TrendingUp size={12} />
            +{stats?.revenue?.growth || 14}% this week
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={styles.contentGrid}>
        {/* Recent Activity */}
        <div style={styles.activityCard}>
          <h3 style={styles.cardTitle}>Recent Activity</h3>
          <div style={styles.activityList}>
            {recentActivity.length === 0 ? (
              <div style={styles.emptyState}>
                <Activity size={isMobile ? 36 : 48} />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} style={styles.activityItem}>
                    <div style={{ ...styles.activityIcon, backgroundColor: `${activity.color}15` }}>
                      <Icon size={isMobile ? 14 : 16} color={activity.color} />
                    </div>
                    <div style={styles.activityContent}>
                      <div style={styles.activityMessage}>{activity.message}</div>
                      <div style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActionsCard}>
          <h3 style={styles.cardTitle}>Quick Actions</h3>
          <div style={styles.quickActionsList}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <div 
                  key={action.id} 
                  style={styles.quickActionItem}
                  onClick={action.action}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.background;
                  }}
                >
                  <div style={{ ...styles.quickActionIcon, backgroundColor: `${action.color}15` }}>
                    <Icon size={16} color={action.color} />
                  </div>
                  <div style={styles.quickActionContent}>
                    <div style={styles.quickActionTitle}>{action.title}</div>
                    <div style={styles.quickActionDesc}>{action.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;