import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would navigate to search results
    console.log('Searching for:', searchQuery);
  };
  
  // CSS for dark themed header
  const headerStyle = {
    backgroundColor: themeColors.secondary,
    padding: '12px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #333'
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1500px',
    margin: '0 auto'
  };

  const logoStyle = {
    fontWeight: 'bold',
    fontSize: '24px',
    textDecoration: 'none',
    color: themeColors.primary,
    display: 'flex',
    alignItems: 'center'
  };

  const searchContainerStyle = {
    flex: 1,
    maxWidth: '700px',
    margin: '0 24px'
  };

  const searchInputStyle = {
    backgroundColor: '#383838',
    border: 'none',
    borderRadius: '24px',
    padding: '10px 16px',
    width: '100%',
    color: themeColors.text,
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '24px',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '10px',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: themeColors.primary,
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: themeColors.text
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: themeColors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer'
  };
  
  return (
    <header style={headerStyle}>
      <nav style={navStyle}>
        {/* Logo */}
        <div 
          style={logoStyle}
          onClick={() => navigate('/')}
        >
          BabyResell
        </div>
        
        {/* Search */}
        <div style={searchContainerStyle}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for baby items..."
              style={searchInputStyle}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        {/* Auth Buttons */}
        <div>
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('/create-listing')}
                style={primaryButtonStyle}
              >
                Create Pin
              </button>
              <span style={avatarStyle} onClick={() => navigate('/profile')}>
                U
              </span>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                style={secondaryButtonStyle}
              >
                Log in
              </button>
              <button 
                onClick={() => navigate('/register')}
                style={primaryButtonStyle}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;