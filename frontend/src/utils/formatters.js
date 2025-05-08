/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a price with the currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted price with currency symbol
 */
export const formatPrice = (price, currency = 'USD') => {
    if (price === undefined || price === null) {
      return 'N/A';
    }
  
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$'
    };
  
    const symbol = currencySymbols[currency] || '$';
  
    // Format the price with 2 decimal places
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  };
  
  /**
   * Format a date in a human-readable format
   * @param {string|Date} date - The date to format
   * @param {boolean} includeTime - Whether to include the time
   * @returns {string} Formatted date string
   */
  export const formatDate = (date, includeTime = false) => {
    if (!date) {
      return 'N/A';
    }
  
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
  
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
  
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
  
    return dateObj.toLocaleDateString('en-US', options);
  };
  
  /**
   * Format a date relative to now (e.g., "2 days ago")
   * @param {string|Date} date - The date to format
   * @returns {string} Relative time string
   */
  export const formatRelativeTime = (date) => {
    if (!date) {
      return 'N/A';
    }
  
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
  
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
  
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    } else if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
    } else {
      return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
    }
  };
  
  /**
   * Truncate a string to a specified length with ellipsis
   * @param {string} str - The string to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated string
   */
  export const truncateString = (str, length = 100) => {
    if (!str) {
      return '';
    }
  
    if (str.length <= length) {
      return str;
    }
  
    return `${str.substring(0, length).trim()}...`;
  };
  
  /**
   * Format a username for display
   * @param {string} username - The username to format
   * @returns {string} Formatted username
   */
  export const formatUsername = (username) => {
    if (!username) {
      return 'Anonymous';
    }
  
    // If username is an email, hide part of it
    if (username.includes('@')) {
      const [name, domain] = username.split('@');
      const visiblePart = name.substring(0, Math.min(3, name.length));
      const hiddenPart = '*'.repeat(Math.max(0, name.length - 3));
      return `${visiblePart}${hiddenPart}@${domain}`;
    }
  
    return username;
  };
  
  /**
   * Format a phone number in a standardized way
   * @param {string} phone - The phone number to format
   * @returns {string} Formatted phone number
   */
  export const formatPhone = (phone) => {
    if (!phone) {
      return '';
    }
  
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
  
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 11)}`;
    }
  
    // If it doesn't match expected formats, return as is
    return phone;
  };
  
  /**
   * Clean and capitalize a string (e.g., for category display)
   * @param {string} str - The string to format
   * @returns {string} Cleaned and capitalized string
   */
  export const cleanAndCapitalize = (str) => {
    if (!str) {
      return '';
    }
  
    // Convert to lowercase and capitalize first letter of each word
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };