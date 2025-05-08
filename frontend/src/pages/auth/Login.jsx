import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { login, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };
  
  // Dark theme styles for login page
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: themeColors.background
  };

  const formContainerStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: themeColors.text
  };

  const inputGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: themeColors.text
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#383838',
    color: themeColors.text
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '16px',
    backgroundColor: themeColors.primary,
    color: 'white',
    transition: 'opacity 0.2s'
  };

  const linkStyle = {
    color: themeColors.primary,
    textDecoration: 'none',
    fontWeight: '500'
  };

  const errorStyle = {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  };
  
  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>Sign in to BabyResell</h2>
        
        {(error || localError) && (
          <div style={errorStyle}>
            {error || localError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', color: themeColors.textSecondary }}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={linkStyle}>
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;