import React from 'react';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

const MobileBottomNav = ({ activeTab = 'home', onTabChange, isAuthenticated = false }) => {
  const styles = {
    container: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#1e1e1e',
      borderTop: '1px solid #2e2e2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)', // For iPhone notch
      zIndex: 100,
      // Hide on desktop
      '@media (min-width: 768px)': {
        display: 'none',
      }
    },
    
    tab: {
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#b0b0b0',
      padding: '8px 0',
      transition: 'color 0.2s',
    },
    
    activeTab: {
      color: '#e60023',
    },
    
    icon: {
      marginBottom: '4px',
    },
    
    label: {
      fontSize: '10px',
      fontWeight: '500',
    },
    
    createButton: {
      width: '56px',
      height: '56px',
      backgroundColor: '#e60023',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: 'pointer',
      position: 'absolute',
      top: '-28px',
      left: '50%',
      transform: 'translateX(-50%)',
      boxShadow: '0 2px 8px rgba(230, 0, 35, 0.3)',
    }
  };
  
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'create', icon: Plus, label: 'Sell' },
    { id: 'saved', icon: Heart, label: 'Saved' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];
  
  // Show only desktop version for larger screens
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }
  
  return (
    <nav style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        if (tab.id === 'create') {
          return (
            <div key={tab.id} style={{ flex: 1, position: 'relative' }}>
              <button
                style={styles.createButton}
                onClick={() => onTabChange(tab.id)}
                aria-label="Create listing"
              >
                <Icon size={24} color="white" />
              </button>
            </div>
          );
        }
        
        // Hide saved/profile for non-authenticated users
        if (!isAuthenticated && (tab.id === 'saved' || tab.id === 'profile')) {
          return null;
        }
        
        return (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(isActive ? styles.activeTab : {})
            }}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon 
              size={20} 
              style={styles.icon}
              fill={isActive ? 'currentColor' : 'none'}
            />
            <span style={styles.label}>{tab.label}</span>
          </button>
        );
      })}
      
      {/* Add login button for non-authenticated users */}
      {!isAuthenticated && (
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'login' ? styles.activeTab : {})
          }}
          onClick={() => onTabChange('login')}
        >
          <User size={20} style={styles.icon} />
          <span style={styles.label}>Login</span>
        </button>
      )}
    </nav>
  );
};

export default MobileBottomNav;