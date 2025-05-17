import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { register, loading, error, isAuthenticated, testConnection } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');
  const [apiStatus, setApiStatus] = useState({ 
    checked: false, 
    working: false,
    message: ''
  });
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Test direct API access on component mount
  useEffect(() => {
    const checkApiAccess = async () => {
      try {
        // Getting the base URL based on environment
        const isProduction = window.location.hostname !== 'localhost';
        const baseURL = isProduction 
          ? 'https://babyresell-62jr6.ondigitalocean.app/api'
          : 'http://localhost:5000/api';
        
        // Test with a direct axios call to avoid any interceptor issues
        const response = await axios.get(`${baseURL}/health`);
        
        setApiStatus({ 
          checked: true, 
          working: true,
          message: `API connected successfully: ${JSON.stringify(response.data)}`
        });
      } catch (err) {
        console.error('API connection test failed:', err);
        setApiStatus({
          checked: true,
          working: false,
          message: `API connection failed: ${err.message}`
        });
        
        if (err.response) {
          setDebugInfo({
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
            headers: err.response.headers
          });
        } else {
          setDebugInfo({
            error: err.message,
            note: 'This might be a CORS issue or the API server is not running'
          });
        }
      }
    };
    
    checkApiAccess();
  }, []);
  
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
  setDebugInfo(null);
  
  // Reset errors
  setLocalError('');
  
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
  
  try {
    // Log the registration attempt for debugging
    console.log('Attempting registration with:', {
      username: formData.username,
      email: formData.email,
      passwordLength: formData.password.length
    });

    // Key change: Use a relative URL for the API endpoint in production
    const isProduction = window.location.hostname !== 'localhost';
    const baseURL = isProduction 
      ? '/api'  // Use relative URL in production
      : 'http://localhost:5000/api';
    
    console.log('Using API base URL:', baseURL);
    
    // Add detailed request configuration with headers for debugging
    const response = await axios.post(`${baseURL}/auth/register`, {
      username: formData.username,
      email: formData.email,
      password: formData.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Add an identifier to help track this request in server logs
        'X-Request-Source': 'registration-form'
      },
      // Add a timeout to avoid waiting too long
      timeout: 10000
    });
    
    console.log('Registration succeeded:', response.data);
    
    // Store the token and navigate
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      navigate('/');
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    // Enhanced error debugging information
    if (err.response) {
      // The server responded with a status code outside the 2xx range
      setDebugInfo({
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data,
        headers: err.response.headers,
        url: err.config.url,
        method: err.config.method
      });
      
      setLocalError(err.response.data?.message || `Server error: ${err.response.status} ${err.response.statusText}`);
    } else if (err.request) {
      // The request was made but no response was received
      setDebugInfo({
        error: 'No response received',
        request: JSON.stringify(err.request),
        url: err.config.url,
        method: err.config.method
      });
      
      setLocalError(`Network error: No response from server. Check if the API is running.`);
    } else {
      // Something happened in setting up the request
      setDebugInfo({
        error: err.message,
        note: 'Error occurred before the request was sent',
        stack: err.stack
      });
      
      setLocalError(`Request configuration error: ${err.message}`);
    }
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

  const infoStyle = {
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa'
  };

  const apiStatusStyle = {
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center',
    backgroundColor: apiStatus.working ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
    color: apiStatus.working ? '#10b981' : '#ef4444'
  };

  const debugStyle = {
    padding: '8px',
    borderRadius: '8px',
    marginTop: '16px',
    fontSize: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: '#ffffff',
    maxHeight: '200px',
    overflowY: 'auto',
    wordBreak: 'break-word'
  };
  
  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>Create your account</h2>
        
        {apiStatus.checked && (
          <div style={apiStatus.working ? infoStyle : apiStatusStyle}>
            {apiStatus.message}
          </div>
        )}
        
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

        {debugInfo && (
          <div style={debugStyle}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Debug Info:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;