import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const ApiConnectionTest = () => {
  const { themeColors } = useTheme();
  const [testResult, setTestResult] = useState({ status: null, message: '', data: null });
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult({ status: null, message: 'Testing connection...', data: null });
    
    try {
      // Try to connect to the basic endpoint
      const response = await axios.get('http://localhost:5000/api/baby-items/categories');
      
      // If we got here, connection was successful
      setTestResult({
        status: 'success',
        message: 'Successfully connected to the backend API!',
        data: response.data
      });
      console.log('API Response:', response.data);
    } catch (error) {
      console.error('API Connection Error:', error);
      
      // Check if there's a specific error message from the server
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      setTestResult({
        status: 'error',
        message: `Failed to connect to the backend API: ${errorMessage}`,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    padding: '16px',
    border: '1px solid',
    borderColor: themeColors.secondary,
    borderRadius: '8px',
    marginBottom: '24px',
    backgroundColor: themeColors.cardBackground
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: themeColors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const resultContainerStyle = {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '4px',
    backgroundColor: testResult.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
                    testResult.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                    'transparent'
  };

  const resultTextStyle = {
    color: testResult.status === 'success' ? '#22c55e' : 
          testResult.status === 'error' ? '#ef4444' : 
          themeColors.text
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>Backend Connection Test</h3>
      <button 
        style={buttonStyle} 
        onClick={testApiConnection}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {testResult.message && (
        <div style={resultContainerStyle}>
          <p style={resultTextStyle}>{testResult.message}</p>
          
          {testResult.status === 'success' && testResult.data && (
            <pre style={{ 
              marginTop: '8px', 
              padding: '8px', 
              backgroundColor: 'rgba(0, 0, 0, 0.1)', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              color: themeColors.text
            }}>
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiConnectionTest;