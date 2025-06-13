import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Play, 
  Activity, 
  Server, 
  Database, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  MessageSquare,
  Settings,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Eye,
  Copy,
  Trash2
} from 'lucide-react';

const APIToolsTab = () => {
  const { themeColors } = useTheme();
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});
  const [requestHistory, setRequestHistory] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    checkHealthStatus();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API endpoints configuration
  const apiEndpoints = {
    authentication: {
      label: 'Authentication',
      icon: Users,
      color: '#3b82f6',
      endpoints: [
        { method: 'POST', path: '/auth/register', name: 'Register User', requiresBody: true },
        { method: 'POST', path: '/auth/login', name: 'Login User', requiresBody: true },
        { method: 'GET', path: '/auth/me', name: 'Get Profile', requiresAuth: true },
        { method: 'POST', path: '/auth/logout', name: 'Logout', requiresAuth: true },
        { method: 'GET', path: '/health', name: 'Health Check' }
      ]
    },
    babyItems: {
      label: 'Baby Items',
      icon: ShoppingBag,
      color: '#10b981',
      endpoints: [
        { method: 'GET', path: '/baby-items', name: 'Get All Items' },
        { method: 'GET', path: '/baby-items/categories', name: 'Get Categories' },
        { method: 'POST', path: '/baby-items', name: 'Create Item', requiresAuth: true, requiresBody: true },
        { method: 'GET', path: '/baby-items/:id', name: 'Get Item by ID' },
        { method: 'PUT', path: '/baby-items/:id', name: 'Update Item', requiresAuth: true, requiresBody: true },
        { method: 'DELETE', path: '/baby-items/:id', name: 'Delete Item', requiresAuth: true }
      ]
    },
    users: {
      label: 'Users',
      icon: Users,
      color: '#8b5cf6',
      endpoints: [
        { method: 'GET', path: '/users/:id', name: 'Get User Profile' },
        { method: 'PUT', path: '/users/:id', name: 'Update User', requiresAuth: true, requiresBody: true },
        { method: 'POST', path: '/users/:id/follow', name: 'Follow User', requiresAuth: true },
        { method: 'POST', path: '/users/:id/unfollow', name: 'Unfollow User', requiresAuth: true }
      ]
    },
    transactions: {
      label: 'Transactions',
      icon: CreditCard,
      color: '#f59e0b',
      endpoints: [
        { method: 'GET', path: '/transactions', name: 'Get Transactions', requiresAuth: true },
        { method: 'POST', path: '/transactions', name: 'Create Transaction', requiresAuth: true, requiresBody: true },
        { method: 'GET', path: '/transactions/:id', name: 'Get Transaction', requiresAuth: true },
        { method: 'PUT', path: '/transactions/:id', name: 'Update Transaction', requiresAuth: true, requiresBody: true }
      ]
    },
    messages: {
      label: 'Messages',
      icon: MessageSquare,
      color: '#ec4899',
      endpoints: [
        { method: 'GET', path: '/messages/conversations', name: 'Get Conversations', requiresAuth: true },
        { method: 'POST', path: '/messages', name: 'Send Message', requiresAuth: true, requiresBody: true },
        { method: 'GET', path: '/messages/conversations/:id', name: 'Get Conversation', requiresAuth: true }
      ]
    }
  };

  // Sample request bodies for different endpoints
  const sampleBodies = {
    '/auth/register': {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    },
    '/auth/login': {
      email: 'test@example.com',
      password: 'password123'
    },
    '/baby-items': {
      title: 'Baby Stroller',
      description: 'Gently used baby stroller in excellent condition',
      price: 89.99,
      category: 'strollers',
      ageGroup: '0-6 months',
      condition: 'excellent',
      brand: 'Graco'
    }
  };

  const checkHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      setHealthStatus(response.ok ? 'healthy' : 'unhealthy');
    } catch (error) {
      setHealthStatus('error');
    }
  };

  const testEndpoint = async (category, endpoint) => {
    const key = `${category}-${endpoint.path}`;
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      let url = `/api${endpoint.path}`;
      // Replace :id with a sample ID for testing
      if (url.includes(':id')) {
        url = url.replace(':id', '1');
      }

      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add auth header if required
      if (endpoint.requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) {
          options.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Add request body if required
      if (endpoint.requiresBody && ['POST', 'PUT'].includes(endpoint.method)) {
        const sampleBody = sampleBodies[endpoint.path];
        if (sampleBody) {
          options.body = JSON.stringify(sampleBody);
        }
      }

      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      const result = {
        success: response.ok,
        status: response.status,
        responseTime,
        data: responseData,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => ({ ...prev, [key]: result }));
      
      // Add to history
      setRequestHistory(prev => [{
        id: Date.now(),
        method: endpoint.method,
        path: endpoint.path,
        name: endpoint.name,
        category,
        ...result
      }, ...prev.slice(0, 19)]); // Keep last 20 requests

    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => ({ ...prev, [key]: result }));
      
      setRequestHistory(prev => [{
        id: Date.now(),
        method: endpoint.method,
        path: endpoint.path,
        name: endpoint.name,
        category,
        ...result
      }, ...prev.slice(0, 19)]);
    }

    setLoading(prev => ({ ...prev, [key]: false }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setRequestHistory([]);
    setTestResults({});
  };

  const formatResponseTime = (time) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '24px',
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '16px' : '24px',
    },

    headerLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: isMobile ? '100%' : 'auto',
    },

    title: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: 'bold',
      color: themeColors.text,
      margin: 0,
    },

    subtitle: {
      color: themeColors.textSecondary,
      fontSize: isMobile ? '14px' : '16px',
      margin: 0,
    },

    healthStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: isMobile ? '6px 12px' : '8px 16px',
      borderRadius: '8px',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '500',
      backgroundColor: healthStatus === 'healthy' ? 'rgba(16, 185, 129, 0.1)' : 
                      healthStatus === 'unhealthy' ? 'rgba(239, 68, 68, 0.1)' : 
                      'rgba(156, 163, 175, 0.1)',
      color: healthStatus === 'healthy' ? '#10b981' : 
             healthStatus === 'unhealthy' ? '#ef4444' : 
             themeColors.textSecondary,
      width: isMobile ? '100%' : 'auto',
      justifyContent: isMobile ? 'center' : 'flex-start',
    },

    mainContent: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 400px',
      gap: isMobile ? '16px' : '24px',
    },

    endpointsPanel: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      padding: isMobile ? '16px' : '24px',
      height: 'fit-content',
      order: isMobile ? 2 : 1,
    },

    resultsPanel: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      padding: isMobile ? '16px' : '24px',
      maxHeight: isMobile ? '400px' : '800px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      order: isMobile ? 1 : 2,
    },

    categorySection: {
      marginBottom: isMobile ? '16px' : '24px',
    },

    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: isMobile ? '12px' : '16px',
      padding: isMobile ? '8px' : '12px',
      borderRadius: '8px',
      backgroundColor: themeColors.secondary,
    },

    categoryTitle: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '600',
      color: themeColors.text,
      margin: 0,
    },

    endpointsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginLeft: isMobile ? '8px' : '16px',
    },

    endpointItem: {
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '8px' : '0',
      padding: isMobile ? '10px' : '12px 16px',
      borderRadius: '8px',
      backgroundColor: themeColors.background,
      border: `1px solid ${themeColors.secondary}`,
      transition: 'all 0.2s ease',
    },

    endpointInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1,
      width: isMobile ? '100%' : 'auto',
    },

    endpointName: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '500',
      color: themeColors.text,
    },

    endpointDetails: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '6px' : '8px',
      fontSize: isMobile ? '11px' : '12px',
      color: themeColors.textSecondary,
      flexWrap: 'wrap',
    },

    methodBadge: (method) => ({
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 'bold',
      backgroundColor: method === 'GET' ? '#10b981' : 
                      method === 'POST' ? '#3b82f6' : 
                      method === 'PUT' ? '#f59e0b' : 
                      method === 'DELETE' ? '#ef4444' : '#6b7280',
      color: 'white',
    }),

    testButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: isMobile ? '8px 12px' : '6px 12px',
      backgroundColor: themeColors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '13px' : '12px',
      fontWeight: '500',
      minWidth: isMobile ? '100%' : '80px',
      justifyContent: 'center',
    },

    resultsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '0',
      marginBottom: '16px',
    },

    clearButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: isMobile ? '8px 12px' : '6px 12px',
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '13px' : '12px',
      width: isMobile ? '100%' : 'auto',
      justifyContent: 'center',
    },

    historyList: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '6px' : '8px',
      overflowY: 'auto',
      maxHeight: isMobile ? '300px' : '600px',
    },

    historyItem: {
      padding: isMobile ? '10px' : '12px',
      borderRadius: '8px',
      backgroundColor: themeColors.background,
      border: `1px solid ${themeColors.secondary}`,
    },

    historyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '8px' : '0',
      marginBottom: '8px',
    },

    historyInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '6px' : '8px',
      fontSize: isMobile ? '11px' : '12px',
      flexWrap: 'wrap',
    },

    statusBadge: (success) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: 'bold',
      backgroundColor: success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      color: success ? '#10b981' : '#ef4444',
    }),

    responsePreview: {
      marginTop: '8px',
      padding: isMobile ? '6px' : '8px',
      backgroundColor: themeColors.secondary,
      borderRadius: '4px',
      fontSize: isMobile ? '10px' : '11px',
      fontFamily: 'monospace',
      color: themeColors.textSecondary,
      maxHeight: isMobile ? '80px' : '100px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'pre-wrap',
    },

    emptyState: {
      textAlign: 'center',
      padding: isMobile ? '20px 10px' : '40px 20px',
      color: themeColors.textSecondary,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>API Testing Tools</h2>
          <p style={styles.subtitle}>Test and monitor your BabyResell API endpoints</p>
        </div>
        <div style={styles.healthStatus}>
          <Activity size={16} />
          <span>API Status: {healthStatus || 'Checking...'}</span>
          <button
            onClick={checkHealthStatus}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.endpointsPanel}>
          <h3 style={{ color: themeColors.text, marginBottom: '20px', fontSize: isMobile ? '16px' : '18px' }}>API Endpoints</h3>
          
          {Object.entries(apiEndpoints).map(([categoryKey, category]) => {
            const Icon = category.icon;
            return (
              <div key={categoryKey} style={styles.categorySection}>
                <div style={styles.categoryHeader}>
                  <Icon size={isMobile ? 18 : 20} color={category.color} />
                  <h4 style={styles.categoryTitle}>{category.label}</h4>
                </div>
                
                <div style={styles.endpointsList}>
                  {category.endpoints.map((endpoint, index) => {
                    const key = `${categoryKey}-${endpoint.path}`;
                    const isLoading = loading[key];
                    const result = testResults[key];
                    
                    return (
                      <div key={index} style={styles.endpointItem}>
                        <div style={styles.endpointInfo}>
                          <div style={styles.endpointName}>{endpoint.name}</div>
                          <div style={styles.endpointDetails}>
                            <span style={styles.methodBadge(endpoint.method)}>
                              {endpoint.method}
                            </span>
                            <span>{endpoint.path}</span>
                            {endpoint.requiresAuth && (
                              <span style={{ color: '#f59e0b', fontSize: isMobile ? '10px' : '11px' }}>🔒 Auth</span>
                            )}
                            {result && (
                              <span style={{ color: result.success ? '#10b981' : '#ef4444' }}>
                                {result.success ? '✓' : '✗'} 
                                {result.responseTime && ` ${formatResponseTime(result.responseTime)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          style={styles.testButton}
                          onClick={() => testEndpoint(categoryKey, endpoint)}
                          disabled={isLoading}
                        >
                          {isLoading ? <RefreshCw size={12} /> : <Play size={12} />}
                          {isLoading ? 'Testing...' : 'Test'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.resultsPanel}>
          <div style={styles.resultsHeader}>
            <h3 style={{ color: themeColors.text, margin: 0, fontSize: isMobile ? '16px' : '18px' }}>Request History</h3>
            <button style={styles.clearButton} onClick={clearHistory}>
              <Trash2 size={12} />
              Clear History
            </button>
          </div>

          <div style={styles.historyList}>
            {requestHistory.length === 0 ? (
              <div style={styles.emptyState}>
                <Server size={isMobile ? 36 : 48} color={themeColors.textSecondary} />
                <p style={{ fontSize: isMobile ? '14px' : '16px' }}>No API requests yet.</p>
                <p style={{ fontSize: isMobile ? '12px' : '14px' }}>Test an endpoint to see results here.</p>
              </div>
            ) : (
              requestHistory.map((item) => (
                <div key={item.id} style={styles.historyItem}>
                  <div style={styles.historyHeader}>
                    <div style={styles.historyInfo}>
                      <span style={styles.methodBadge(item.method)}>
                        {item.method}
                      </span>
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                      <span style={{ fontSize: isMobile ? '9px' : '10px', color: themeColors.textSecondary }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.responseTime && (
                        <span style={{ fontSize: isMobile ? '9px' : '10px', color: themeColors.textSecondary }}>
                          {formatResponseTime(item.responseTime)}
                        </span>
                      )}
                      <div style={styles.statusBadge(item.success)}>
                        {item.success ? <Check size={10} /> : <X size={10} />}
                        {item.status || 'Error'}
                      </div>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(item.data || item.error, null, 2))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.textSecondary }}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {(item.data || item.error) && (
                    <div style={styles.responsePreview}>
                      {JSON.stringify(item.data || item.error, null, 2).substring(0, isMobile ? 150 : 200)}
                      {JSON.stringify(item.data || item.error, null, 2).length > (isMobile ? 150 : 200) && '...'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIToolsTab;