import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  
  // Dark-themed footer styles
  const footerStyle = {
    backgroundColor: themeColors.secondary,
    color: themeColors.textSecondary,
    padding: '20px',
    marginTop: 'auto', // Push to bottom of the page
    borderTop: '1px solid #333'
  };

  const containerStyle = {
    maxWidth: '1500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    '@media (min-width: 640px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }
  };

  const copyrightStyle = {
    fontSize: '14px'
  };

  const linkContainerStyle = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  };

  const linkStyle = {
    color: themeColors.textSecondary,
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
    cursor: 'pointer'
  };

  const hoverLink = (e) => {
    e.target.style.color = themeColors.primary;
  };

  const unhoverLink = (e) => {
    e.target.style.color = themeColors.textSecondary;
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={copyrightStyle}>
          © {new Date().getFullYear()} BabyResell. All rights reserved.
        </div>
        
        <div style={linkContainerStyle}>
          <span 
            style={linkStyle} 
            onMouseEnter={hoverLink} 
            onMouseLeave={unhoverLink}
            onClick={() => navigate('/about')}
          >
            About
          </span>
          <span 
            style={linkStyle} 
            onMouseEnter={hoverLink} 
            onMouseLeave={unhoverLink}
            onClick={() => navigate('/privacy')}
          >
            Privacy
          </span>
          <span 
            style={linkStyle} 
            onMouseEnter={hoverLink} 
            onMouseLeave={unhoverLink}
            onClick={() => navigate('/terms')}
          >
            Terms
          </span>
          <span 
            style={linkStyle} 
            onMouseEnter={hoverLink} 
            onMouseLeave={unhoverLink}
            onClick={() => navigate('/contact')}
          >
            Contact Support
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;