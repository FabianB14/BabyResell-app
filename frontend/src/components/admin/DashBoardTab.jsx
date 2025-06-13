import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Users, 
  Package, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  ShoppingBag
} from 'lucide-react';

const DashboardTab = ({ stats }) => {
  const { themeColors } = useTheme();
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'user_registration',
      message: 'New user registered: parent123',
      time: '6/12/2025, 7:08:52 PM',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 2,
      type: 'item_created',
      message: 'New item listed: Baby Carrier',
      time: '6/12/2025, 6:38:52 PM',
      icon: Package,
      color: '#10b981'
    },
    {
      id: 3,
      type: 'transaction_completed',
      message: 'Transaction completed: $45.00',
      time: '6/12/2025, 5:38:52 PM',
      icon: CreditCard,
      color: '#f59e0b'
    }
  ]);
  
  const styles = {
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    
    statCard: {
      backgroundColor: themeColors.cardBackground,
      padding: '24px',
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${themeColors.secondary}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    
    statCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
    
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
    },
    
    statIcon: {
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      backgroundColor: themeColors.secondary,
    },
    
    statContent: {
      flex: 1,
    },
    
    statLabel: {
      color: themeColors.textSecondary,
      fontSize: '14px',
      marginBottom: '4px',
      fontWeight: '500',
    },
    
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: '8px',
      lineHeight: 1,
    },
    
    statGrowth: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
    },
    
    activitySection: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${themeColors.secondary}`,
    },
    
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
      color: themeColors.text,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    
    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    
    activityItem: {
      display: 'flex',
      gap: '16px',
      padding: '16px',
      backgroundColor: themeColors.secondary,
      borderRadius: '12px',
      alignItems: 'center',
    },
    
    activityIcon: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
    },
    
    activityContent: {
      flex: 1,
    },
    
    activityMessage: {
      fontSize: '14px',
      color: themeColors.text,
      marginBottom: '4px',
    },
    
    activityTime: {
      fontSize: '12px',
      color: themeColors.textSecondary,
    },
    
    activityType: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: themeColors.background,
      color: themeColors.textSecondary,
      marginLeft: 'auto',
    },
    
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      marginTop: '32px',
    },
    
    chartCard: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${themeColors.secondary}`,
      height: '300px',
      display: 'flex',
      flexDirection: 'column',
    },
  };
  
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const statCards = [
    {
      id: 'users',
      label: 'Active Users',
      value: stats.users.total,
      growth: stats.users.growth,
      icon: Users,
      color: '#3b82f6',
      prefix: '',
      formatter: formatNumber
    },
    {
      id: 'items',
      label: 'Listed Items',
      value: stats.items.total,
      growth: stats.items.growth,
      icon: Package,
      color: '#10b981',
      prefix: '',
      formatter: formatNumber
    },
    {
      id: 'transactions',
      label: 'Transactions',
      value: stats.transactions.total,
      growth: stats.transactions.growth,
      icon: CreditCard,
      color: '#f59e0b',
      prefix: '',
      formatter: formatNumber
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: stats.revenue.total,
      growth: stats.revenue.growth,
      icon: DollarSign,
      color: '#8b5cf6',
      prefix: '$',
      formatter: formatCurrency
    }
  ];
  
  return (
    <div>
      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.statHeader}>
                <div style={styles.statContent}>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <div style={styles.statValue}>
                    {stat.id === 'revenue' ? formatCurrency(stat.value) : formatNumber(stat.value)}
                  </div>
                  <div style={{
                    ...styles.statGrowth,
                    color: stat.growth > 0 ? '#10b981' : '#ef4444'
                  }}>
                    <TrendingUp size={16} />
                    <span>{stat.growth > 0 ? '+' : ''}{stat.growth}% today</span>
                  </div>
                </div>
                <div style={{
                  ...styles.statIcon,
                  backgroundColor: `${stat.color}20`,
                  color: stat.color
                }}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Recent Activity */}
      <div style={styles.activitySection}>
        <h2 style={styles.sectionTitle}>
          <Activity size={20} />
          Recent Activity
        </h2>
        <div style={styles.activityList}>
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} style={styles.activityItem}>
                <div style={{
                  ...styles.activityIcon,
                  backgroundColor: `${activity.color}20`,
                  color: activity.color
                }}>
                  <Icon size={20} />
                </div>
                <div style={styles.activityContent}>
                  <div style={styles.activityMessage}>{activity.message}</div>
                  <div style={styles.activityTime}>{activity.time}</div>
                </div>
                <div style={styles.activityType}>
                  {activity.type.replace('_', ' ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>
            <TrendingUp size={18} />
            Revenue Overview
          </h3>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: themeColors.textSecondary
          }}>
            Chart visualization would go here
          </div>
        </div>
        
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>
            <ShoppingBag size={18} />
            Popular Categories
          </h3>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: themeColors.textSecondary
          }}>
            Category breakdown would go here
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;