import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Search, Plus, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const ResponsiveHeader = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${searchQuery}`);
    setMobileMenuOpen(false);
  };
  
  const styles = {
    header: {
      backgroundColor: themeColors.cardBackground,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      borderBottom: `1px solid ${themeColors.secondary}`,
    },
    
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    
    logo: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: themeColors.primary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    
    desktopSearch: {
      display: 'none',
      flex: 1,
      maxWidth: '600px',
      margin: '0 24px',
    },
    
    searchInput: {
      width: '100%',
      padding: '10px 16px',
      paddingLeft: '40px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '24px',
      color: themeColors.text,
      fontSize: '14px',
    },
    
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: themeColors.textSecondary,
    },
    
    desktopNav: {
      display: 'none',
      alignItems: 'center',
      gap: '16px',
    },
    
    mobileNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    
    iconButton: {
      background: 'none',
      border: 'none',
      color: themeColors.text,
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    createButton: {
      backgroundColor: themeColors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
    },
    
    mobileMenu: {
      position: 'fixed',
      top: '60px',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: themeColors.background,
      transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
      zIndex: 99,
      overflow: 'auto',
    },
    
    mobileMenuItem: {
      display: 'block',
      width: '100%',
      padding: '16px 20px',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${themeColors.secondary}`,
      color: themeColors.text,
      fontSize: '16px',
      textAlign: 'left',
      cursor: 'pointer',
    },
    
    mobileSearchContainer: {
      padding: '16px',
      borderBottom: `1px solid ${themeColors.secondary}`,
    },
    
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: themeColors.primary,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '14px',
    },
  };
  
  // Media queries for desktop styles
  const mediaQuery = window.matchMedia('(min-width: 768px)');
  const isDesktop = mediaQuery.matches;
  
  if (isDesktop) {
    styles.container.padding = '16px 24px';
    styles.logo.fontSize = '24px';
    styles.desktopSearch.display = 'block';
    styles.desktopNav.display = 'flex';
    styles.mobileNav.display = 'none';
  }
  
  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Logo */}
          <div 
            style={styles.logo}
            onClick={() => navigate('/')}
          >
            BabyResell
          </div>
          
          {/* Desktop Search */}
          <div style={styles.desktopSearch}>
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for baby items..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          {/* Desktop Navigation */}
          <div style={styles.desktopNav}>
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => navigate('/create-listing')}
                  style={styles.createButton}
                >
                  <Plus size={16} />
                  Create
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  style={styles.iconButton}
                >
                  Messages
                </button>
                <div 
                  style={styles.avatar}
                  onClick={() => navigate('/profile')}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  style={{
                    ...styles.iconButton,
                    padding: '8px 16px',
                  }}
                >
                  Log in
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  style={styles.createButton}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
          
          {/* Mobile Navigation */}
          <div style={styles.mobileNav}>
            <button
              onClick={() => navigate('/search')}
              style={styles.iconButton}
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={styles.iconButton}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <div style={styles.mobileMenu}>
        {/* Mobile Search */}
        <div style={styles.mobileSearchContainer}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              style={{
                ...styles.searchInput,
                width: '100%',
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        {/* Mobile Menu Items */}
        {isAuthenticated ? (
          <>
            <button 
              style={styles.mobileMenuItem}
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
            >
              <User size={20} style={{ marginRight: '12px', display: 'inline' }} />
              Profile
            </button>
            <button 
              style={styles.mobileMenuItem}
              onClick={() => {
                navigate('/create-listing');
                setMobileMenuOpen(false);
              }}
            >
              <Plus size={20} style={{ marginRight: '12px', display: 'inline' }} />
              Create Listing
            </button>
            <button 
              style={styles.mobileMenuItem}
              onClick={() => {
                navigate('/messages');
                setMobileMenuOpen(false);
              }}
            >
              Messages
            </button>
            <button 
              style={styles.mobileMenuItem}
              onClick={() => {
                navigate('/orders');
                setMobileMenuOpen(false);
              }}
            >
              My Orders
            </button>
            <button 
              style={styles.mobileMenuItem}
              onClick={() => {
                navigate('/settings');
                setMobileMenuOpen(false);
              }}
            >
              Settings
            </button>
            <button 
              style={{
                ...styles.mobileMenuItem,
                color: themeColors.primary,
              }}
              onClick={() => {
                // Handle logout
                setMobileMenuOpen(false);
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button 
              style={styles.mobileMenuItem}
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
            >
              Log In
            </button>
            <button 
              style={{
                ...styles.mobileMenuItem,
                color: themeColors.primary,
              }}
              onClick={() => {
                navigate('/register');
                setMobileMenuOpen(false);
              }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ResponsiveHeader;