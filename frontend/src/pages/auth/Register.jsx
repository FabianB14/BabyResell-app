import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { register, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setLocalError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    
    const success = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    });
    
    if (success) {
      navigate('/');
    }
  };
  
  // Dark theme styles for register page
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
        <h2 style={titleStyle}>Create your account</h2>
        
        {(error || localError) && (
          <div style={errorStyle}>
            {error || localError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label htmlFor="username" style={labelStyle}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              style={inputStyle}
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              style={inputStyle}
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Your email address"
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              style={inputStyle}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password (min 6 characters)"
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label htmlFor="confirmPassword" style={labelStyle}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              style={inputStyle}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
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
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', color: themeColors.textSecondary }}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={linkStyle}>
              Sign in
            </Link>
          </p>
          
          <p style={{ fontSize: '12px', marginTop: '20px' }}>
            By signing up, you agree to our{' '}
            <a href="/terms" style={{ ...linkStyle, fontSize: '12px' }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" style={{ ...linkStyle, fontSize: '12px' }}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;