import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Settings } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would navigate to search results
    console.log('Searching for:', searchQuery);
  };
  
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
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
    alignItems: 'center',
    cursor: 'pointer'
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

  const userMenuContainerStyle = {
    position: 'relative',
    display: 'inline-block'
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
    cursor: 'pointer',
    marginLeft: '10px'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: themeColors.cardBackground,
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid #333',
    minWidth: '180px',
    zIndex: 1000
  };

  const dropdownItemStyle = {
    padding: '12px 16px',
    color: themeColors.text,
    cursor: 'pointer',
    borderBottom: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  };

  const lastDropdownItemStyle = {
    ...dropdownItemStyle,
    borderBottom: 'none'
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('/create-listing')}
                style={primaryButtonStyle}
              >
                Create Pin
              </button>
              
              {/* User Menu */}
              <div style={userMenuContainerStyle}>
                <div 
                  style={avatarStyle} 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                
                {showUserMenu && (
                  <div style={dropdownStyle}>
                    <div 
                      style={dropdownItemStyle}
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.secondary}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Profile
                    </div>
                    
                    {/* Admin Dashboard Link - Only show for admins */}
                    {(user?.isAdmin === true || user?.role === 'admin') && (
                      <div 
                        style={dropdownItemStyle}
                        onClick={() => {
                          navigate('/admin');
                          setShowUserMenu(false);
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Settings size={16} style={{ marginRight: '8px' }} />
                        Admin Dashboard
                      </div>
                    )}
                    
                    <div 
                      style={dropdownItemStyle}
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.secondary}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Settings
                    </div>
                    
                    <div 
                      style={lastDropdownItemStyle}
                      onClick={handleLogout}
                      onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.secondary}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Sign Out
                    </div>
                  </div>
                )}
              </div>
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
      
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;