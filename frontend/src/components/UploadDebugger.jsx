import React, { useState } from 'react';
import { uploadAPI, authAPI } from '../services/api';

const UploadDebugger = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);
    
    if (selectedFile) {
      setDebugInfo({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified
      });
    }
  };

  const testBasicConnection = async () => {
    setLoading(true);
    try {
      console.log('Testing basic API connection...');
      
      // Test the health endpoint
      const response = await fetch(window.location.origin + '/api/health');
      const data = await response.text();
      
      setResult({
        test: 'Basic Connection',
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      console.log('Health check result:', response.status, data);
    } catch (err) {
      console.error('Basic connection test failed:', err);
      setError(`Connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      console.log('Testing auth endpoint...');
      
      const response = await authAPI.getProfile();
      setResult({
        test: 'Auth Test',
        success: true,
        data: response.data
      });
      
      console.log('Auth test result:', response.data);
    } catch (err) {
      console.error('Auth test failed:', err);
      setError(`Auth test failed: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUploadEndpoint = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing upload with:', debugInfo);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      
      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }
      
      // Test the upload
      const response = await uploadAPI.uploadImage(formData);
      
      setResult({
        test: 'Upload Test',
        success: true,
        data: response.data
      });
      
      console.log('Upload successful:', response.data);
      
    } catch (err) {
      console.error('Upload test failed:', err);
      
      // Extract detailed error information
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers,
        responseData: err.response?.data,
        requestData: 'FormData (see console for details)'
      };
      
      setError(JSON.stringify(errorDetails, null, 2));
      
      // Also log the full error object
      console.log('Full error object:', err);
      console.log('Error response:', err.response);
      console.log('Error config:', err.config);
    } finally {
      setLoading(false);
    }
  };

  const testUploadDirect = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing direct upload...');
      
      // Get the token manually
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'No token');
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(window.location.origin + '/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
        },
        body: formData
      });
      
      console.log('Direct upload response status:', response.status);
      console.log('Direct upload response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Direct upload response text:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }
      
      if (response.ok) {
        setResult({
          test: 'Direct Upload Test',
          success: true,
          status: response.status,
          data: responseData
        });
      } else {
        setError(`Direct upload failed: ${response.status} - ${responseText}`);
      }
      
    } catch (err) {
      console.error('Direct upload test failed:', err);
      setError(`Direct upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px', 
      margin: '20px',
      fontFamily: 'arial'
    }}>
      <h2>Upload & API Debugger</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Step 1: Test Basic Connection</h3>
        <button
          onClick={testBasicConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Basic API Connection
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Step 2: Test Authentication</h3>
        <button
          onClick={testAuth}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Auth Endpoint
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Step 3: Test Upload</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        
        {debugInfo && (
          <div style={{ 
            backgroundColor: '#e9ecef', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '10px',
            fontSize: '14px'
          }}>
            <strong>File Info:</strong><br/>
            Name: {debugInfo.name}<br/>
            Size: {(debugInfo.size / 1024 / 1024).toFixed(2)} MB<br/>
            Type: {debugInfo.type}
          </div>
        )}
        
        <button
          onClick={testUploadEndpoint}
          disabled={loading || !file}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !file ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Upload (via API)'}
        </button>

        <button
          onClick={testUploadDirect}
          disabled={loading || !file}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !file ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Upload (Direct)'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#28a745' }}>✅ Success Result:</h4>
          <pre style={{ 
            backgroundColor: '#d4edda', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '12px',
            border: '1px solid #c3e6cb'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#dc3545' }}>❌ Error Details:</h4>
          <pre style={{ 
            backgroundColor: '#f8d7da', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            color: '#721c24',
            fontSize: '12px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug Instructions</summary>
          <div style={{ marginTop: '10px' }}>
            <ol>
              <li><strong>Test Basic Connection:</strong> Verifies your backend is running and accessible</li>
              <li><strong>Test Auth:</strong> Verifies you're logged in and auth is working</li>
              <li><strong>Test Upload:</strong> Tests both our API wrapper and direct fetch methods</li>
              <li><strong>Check Browser Console:</strong> Detailed logs are printed to the console</li>
              <li><strong>Check Network Tab:</strong> Look at the actual HTTP requests being made</li>
            </ol>
            <p><strong>Common Issues:</strong></p>
            <ul>
              <li>Backend not running (Step 1 fails)</li>
              <li>Not logged in (Step 2 fails)</li>
              <li>Upload route missing/broken (Step 3 fails)</li>
              <li>Environment variables missing (500 error in Step 3)</li>
              <li>CORS issues (requests blocked)</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default UploadDebugger;