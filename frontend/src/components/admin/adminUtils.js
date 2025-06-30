// adminUtils.js - Shared utility functions for admin dashboard tabs
// Place this file in: frontend/src/utils/adminUtils.js

// ========== Format Utilities ==========

/**
 * Format currency values
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Format date with various options
 * @param {string|Date} date - The date to format
 * @param {string} format - Format type: 'full', 'short', 'time', 'date'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'full') => {
  const dateObj = new Date(date);
  
  const formats = {
    full: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    },
    date: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  };

  return new Intl.DateTimeFormat('en-US', formats[format] || formats.full).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date} timestamp - The timestamp to format
 * @returns {string} Relative time string
 */
export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format response time
 * @param {number} time - Time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatResponseTime = (time) => {
  if (time < 1000) return `${time}ms`;
  return `${(time / 1000).toFixed(2)}s`;
};

// ========== Notification Utilities ==========

/**
 * Show notification (can be replaced with toast library)
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds
 */
export const showNotification = (message, type = 'success', duration = 3000) => {
  // For now, using alert. Replace with toast notifications
  // Example implementations:
  
  // Option 1: Basic alert
  alert(`${type.toUpperCase()}: ${message}`);
  
  // Option 2: With react-toastify
  // import { toast } from 'react-toastify';
  // toast[type](message, { autoClose: duration });
  
  // Option 3: With react-hot-toast
  // import toast from 'react-hot-toast';
  // toast[type](message, { duration });
  
  // Option 4: Custom notification system
  // const notification = document.createElement('div');
  // notification.className = `notification notification-${type}`;
  // notification.textContent = message;
  // document.body.appendChild(notification);
  // setTimeout(() => notification.remove(), duration);
};

// ========== API Utilities ==========

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if no specific error message
 */
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  
  if (error.response) {
    // Server responded with error
    message = error.response.data?.message || 
              error.response.data?.error || 
              `Error: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response
    message = 'Network error. Please check your connection.';
  } else {
    // Other errors
    message = error.message || defaultMessage;
  }
  
  showNotification(message, 'error');
  return message;
};

/**
 * Make authenticated API request
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} Response promise
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response;
};

// ========== CSV Export Utilities ==========

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV string
 */
export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';
  
  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      // Escape values containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csv - CSV content
 * @param {string} filename - Filename for download
 */
export const downloadCSV = (csv, filename = 'export.csv') => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

/**
 * Export items to CSV
 * @param {Array} items - Items array
 * @param {string} filename - Optional filename
 */
export const exportItemsToCSV = (items, filename = null) => {
  const headers = ['ID', 'Title', 'Category', 'Price', 'Condition', 'Status', 'Seller', 'Views', 'Saves', 'Listed Date'];
  
  const data = items.map(item => ({
    'ID': item.id,
    'Title': item.title,
    'Category': item.category,
    'Price': item.price,
    'Condition': item.condition,
    'Status': item.status,
    'Seller': item.seller,
    'Views': item.views,
    'Saves': item.saves,
    'Listed Date': formatDate(item.listedDate, 'short')
  }));
  
  const csv = convertToCSV(data, headers);
  const defaultFilename = `items-export-${formatDate(new Date(), 'date')}.csv`;
  downloadCSV(csv, filename || defaultFilename);
};

/**
 * Export users to CSV
 * @param {Array} users - Users array
 * @param {string} filename - Optional filename
 */
export const exportUsersToCSV = (users, filename = null) => {
  const headers = ['ID', 'Name', 'Email', 'Username', 'Status', 'Join Date', 'Location', 'Items', 'Revenue'];
  
  const data = users.map(user => ({
    'ID': user.id,
    'Name': user.name,
    'Email': user.email,
    'Username': user.username,
    'Status': user.status,
    'Join Date': formatDate(user.joinDate, 'short'),
    'Location': user.location || 'Not specified',
    'Items': user.items || 0,
    'Revenue': formatCurrency(user.revenue || 0)
  }));
  
  const csv = convertToCSV(data, headers);
  const defaultFilename = `users-export-${formatDate(new Date(), 'date')}.csv`;
  downloadCSV(csv, filename || defaultFilename);
};

/**
 * Export transactions to CSV
 * @param {Array} transactions - Transactions array
 * @param {string} filename - Optional filename
 */
export const exportTransactionsToCSV = (transactions, filename = null) => {
  const headers = ['ID', 'Type', 'Amount', 'Fee', 'Net Amount', 'Status', 'Date', 'Item', 'Buyer', 'Seller', 'Payment Method'];
  
  const data = transactions.map(tx => ({
    'ID': tx.id,
    'Type': tx.type,
    'Amount': formatCurrency(tx.amount),
    'Fee': formatCurrency(tx.fee),
    'Net Amount': formatCurrency(tx.netAmount),
    'Status': tx.status,
    'Date': formatDate(tx.date),
    'Item': tx.item.title,
    'Buyer': tx.buyer.name,
    'Seller': tx.seller.name,
    'Payment Method': tx.paymentMethod
  }));
  
  const csv = convertToCSV(data, headers);
  const defaultFilename = `transactions-export-${formatDate(new Date(), 'date')}.csv`;
  downloadCSV(csv, filename || defaultFilename);
};

// ========== Validation Utilities ==========

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate price format
 * @param {number|string} price - Price to validate
 * @returns {boolean} Is valid price
 */
export const isValidPrice = (price) => {
  const priceNum = parseFloat(price);
  return !isNaN(priceNum) && priceNum >= 0 && priceNum <= 999999.99;
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {boolean} Is valid username
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
  return usernameRegex.test(username);
};

// ========== Status Utilities ==========

/**
 * Get status color
 * @param {string} status - Status value
 * @param {string} type - Type of status (user, item, transaction)
 * @returns {string} Hex color code
 */
export const getStatusColor = (status, type = 'general') => {
  const colors = {
    general: {
      active: '#10b981',
      inactive: '#f59e0b',
      pending: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280',
      draft: '#f59e0b',
      suspended: '#ef4444',
      archived: '#6b7280'
    }
  };
  
  return colors[type]?.[status] || colors.general[status] || '#6b7280';
};

/**
 * Get status icon
 * @param {string} status - Status value
 * @returns {string} Icon name for lucide-react
 */
export const getStatusIcon = (status) => {
  const icons = {
    active: 'CheckCircle',
    inactive: 'AlertTriangle',
    pending: 'Clock',
    completed: 'CheckCircle',
    failed: 'XCircle',
    cancelled: 'XCircle',
    draft: 'Edit',
    suspended: 'UserX',
    archived: 'Archive'
  };
  
  return icons[status] || 'AlertTriangle';
};

// ========== Miscellaneous Utilities ==========

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {string} successMessage - Success notification message
 */
export const copyToClipboard = async (text, successMessage = 'Copied to clipboard!') => {
  try {
    await navigator.clipboard.writeText(text);
    showNotification(successMessage, 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy to clipboard', 'error');
  }
};

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

/**
 * Pluralize word based on count
 * @param {number} count - Item count
 * @param {string} singular - Singular form
 * @param {string} plural - Optional plural form
 * @returns {string} Pluralized string
 */
export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
};

/**
 * Check if user has permission
 * @param {object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean} Has permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.isAdmin || user.role === 'admin') return true;
  
  // Check specific permissions
  const permissions = {
    viewUsers: ['admin', 'moderator'],
    editUsers: ['admin'],
    deleteUsers: ['admin'],
    viewItems: ['admin', 'moderator'],
    editItems: ['admin', 'moderator'],
    deleteItems: ['admin'],
    viewTransactions: ['admin'],
    processRefunds: ['admin'],
    viewSettings: ['admin'],
    editSettings: ['admin']
  };
  
  return permissions[permission]?.includes(user.role) || false;
};

// ========== Export Summary ==========
// This object can be used for named imports if preferred
export const adminUtils = {
  // Format utilities
  formatCurrency,
  formatDate,
  formatTimeAgo,
  formatFileSize,
  formatResponseTime,
  
  // Notification utilities
  showNotification,
  
  // API utilities
  handleAPIError,
  authenticatedFetch,
  
  // CSV utilities
  convertToCSV,
  downloadCSV,
  exportItemsToCSV,
  exportUsersToCSV,
  exportTransactionsToCSV,
  
  // Validation utilities
  isValidEmail,
  isValidPrice,
  isValidUsername,
  
  // Status utilities
  getStatusColor,
  getStatusIcon,
  
  // Miscellaneous utilities
  debounce,
  copyToClipboard,
  generateUniqueId,
  getInitials,
  pluralize,
  hasPermission
};

export default adminUtils;