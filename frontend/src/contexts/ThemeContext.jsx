import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { themeAPI } from '../services/api';

// Create context
export const ThemeContext = createContext();

// Default theme fallback
const defaultTheme = {
  id: 'default',
  name: 'default',
  displayName: 'Default Theme',
  colors: {
    primary: '#e60023', // Pinterest red
    secondary: '#2e2e2e',
    accent: '#e2336b', // Gradient pink
    background: '#121212', // Dark background
    cardBackground: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0b0b0'
  }
};

// Predefined seasonal themes as fallbacks
const predefinedThemes = {
  spring: {
    id: 'spring',
    name: 'spring',
    displayName: 'Spring Bloom',
    colors: {
      primary: '#10b981',
      secondary: '#d1fae5',
      accent: '#34d399',
      background: '#ecfdf5',
      cardBackground: '#ffffff',
      text: '#065f46',
      textSecondary: '#6b7280'
    }
  },
  summer: {
    id: 'summer',
    name: 'summer', 
    displayName: 'Summer Vibes',
    colors: {
      primary: '#f59e0b',
      secondary: '#fef3c7',
      accent: '#fb923c',
      background: '#fffbeb',
      cardBackground: '#ffffff',
      text: '#92400e',
      textSecondary: '#6b7280'
    }
  },
  fall: {
    id: 'fall',
    name: 'fall',
    displayName: 'Autumn Harvest',
    colors: {
      primary: '#ea580c',
      secondary: '#fed7aa',
      accent: '#fb923c',
      background: '#fff7ed',
      cardBackground: '#ffffff',
      text: '#9a3412',
      textSecondary: '#6b7280'
    }
  },
  winter: {
    id: 'winter',
    name: 'winter',
    displayName: 'Winter Wonderland',
    colors: {
      primary: '#0ea5e9',
      secondary: '#e0f2fe',
      accent: '#38bdf8',
      background: '#f0f9ff',
      cardBackground: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#6b7280'
    }
  },
  christmas: {
    id: 'christmas',
    name: 'christmas',
    displayName: 'Christmas Magic',
    colors: {
      primary: '#dc2626',
      secondary: '#fecaca',
      accent: '#ef4444',
      background: '#fef2f2',
      cardBackground: '#ffffff',
      text: '#991b1b',
      textSecondary: '#6b7280'
    }
  },
  halloween: {
    id: 'halloween',
    name: 'halloween',
    displayName: 'Halloween Spooky',
    colors: {
      primary: '#f97316',
      secondary: '#fed7aa',
      accent: '#fb923c',
      background: '#1a1a1a',
      cardBackground: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#a1a1aa'
    }
  },
  dark: {
    id: 'dark',
    name: 'dark',
    displayName: 'Dark Mode',
    colors: {
      primary: '#e60023',
      secondary: '#2e2e2e',
      accent: '#e2336b',
      background: '#121212',
      cardBackground: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0'
    }
  }
};

// Provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW: Track when user is actively working to prevent disruptive refreshes
  const [isUserActive, setIsUserActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const lastActivityRef = useRef(Date.now());

  // Get theme colors (computed from current theme)
  const themeColors = currentTheme.colors || defaultTheme.colors;

  // Load active theme from backend - THIS IS CALLED BY ALL USERS
  const loadActiveTheme = async (force = false) => {
    try {
      // Don't refresh if user is actively working unless forced
      if (!force && (isUserActive || modalOpen)) {
        console.log('Skipping theme refresh - user is active or modal is open');
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('Loading active theme from backend...');
      
      // Get the globally active theme from backend
      const response = await themeAPI.getActiveTheme();
      
      if (response.data.success && response.data.data) {
        const backendTheme = response.data.data;
        
        console.log('Active theme loaded from backend:', backendTheme);
        
        // Map backend theme to our format
        const theme = {
          id: backendTheme._id,
          name: backendTheme.name,
          displayName: backendTheme.displayName || backendTheme.name,
          colors: backendTheme.colors || predefinedThemes[backendTheme.name]?.colors || defaultTheme.colors,
          isActive: backendTheme.isActive,
          activatedAt: backendTheme.activatedAt,
          type: backendTheme.isSeasonal ? 'seasonal' : backendTheme.isHoliday ? 'holiday' : 'custom'
        };
        
        setCurrentTheme(theme);
        console.log('Theme applied locally:', theme);
      } else {
        console.log('No active theme found in backend, using fallback');
        // Fallback to automatic seasonal theme
        const seasonalTheme = getCurrentSeasonalTheme();
        setCurrentTheme(seasonalTheme);
      }
    } catch (error) {
      console.warn('Failed to load active theme from backend, using fallback:', error);
      // Use predefined seasonal theme based on current date
      const seasonalTheme = getCurrentSeasonalTheme();
      setCurrentTheme(seasonalTheme);
      setError('Using offline theme due to connection issue');
    } finally {
      setLoading(false);
    }
  };

  // Load all available themes
  const loadAvailableThemes = async (force = false) => {
    try {
      // Don't refresh if user is actively working unless forced
      if (!force && (isUserActive || modalOpen)) {
        console.log('Skipping available themes refresh - user is active or modal is open');
        return;
      }

      const response = await themeAPI.getAllThemes();
      if (response.data.success) {
        setAvailableThemes(response.data.data);
      }
    } catch (error) {
      console.warn('Failed to load available themes:', error);
      // Use predefined themes as fallback
      setAvailableThemes(Object.values(predefinedThemes));
    }
  };

  // Get current seasonal theme based on date
  const getCurrentSeasonalTheme = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31
    
    // Check for holiday themes first
    if (month === 11 && day <= 25) { // Christmas (Dec 1-25)
      return predefinedThemes.christmas;
    }
    if (month === 9) { // Halloween (October)
      return predefinedThemes.halloween;
    }
    
    // Seasonal themes
    if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
      return predefinedThemes.winter; // Dec 21 - Mar 19
    } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
      return predefinedThemes.spring; // Mar 20 - Jun 20
    } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
      return predefinedThemes.summer; // Jun 21 - Sep 21
    } else {
      return predefinedThemes.fall; // Sep 22 - Dec 20
    }
  };

  // **GLOBAL THEME ACTIVATION** - This makes themes change for ALL users
  const activateTheme = async (themeId) => {
    try {
      setLoading(true);
      console.log('Activating theme globally:', themeId);
      
      let response;
      
      // Check if it's a predefined theme (by name) or database theme (by ID)
      if (predefinedThemes[themeId]) {
        // Activate predefined theme by name - this creates/activates it globally
        console.log('Activating predefined theme:', themeId);
        response = await themeAPI.activateThemeByName(themeId);
      } else {
        // Activate existing database theme by ID
        console.log('Activating database theme by ID:', themeId);
        response = await themeAPI.activateTheme(themeId);
      }
      
      if (response.data.success) {
        console.log('Theme activated successfully on backend:', response.data.data);
        
        // Force reload the active theme to get the latest state
        await loadActiveTheme(true);
        
        return { 
          success: true, 
          theme: response.data.data,
          message: response.data.message 
        };
      }
      
      return { success: false, error: response.data.message || 'Failed to activate theme' };
    } catch (error) {
      console.error('Error activating theme globally:', error);
      return { success: false, error: error.message || 'Failed to activate theme' };
    } finally {
      setLoading(false);
    }
  };

  // Activate seasonal theme automatically (global)
  const activateSeasonalTheme = async () => {
    try {
      setLoading(true);
      console.log('Activating seasonal theme globally...');
      
      // This activates the current seasonal theme for ALL users
      const response = await themeAPI.activateSeasonalTheme();
      
      if (response.data.success) {
        console.log('Seasonal theme activated globally:', response.data.data);
        
        // Force reload the active theme to get the latest state
        await loadActiveTheme(true);
        
        return { success: true, theme: response.data.data };
      }
      
      return { success: false, error: 'Failed to activate seasonal theme' };
    } catch (error) {
      console.warn('Backend seasonal activation failed, using local fallback:', error);
      const seasonalTheme = getCurrentSeasonalTheme();
      setCurrentTheme(seasonalTheme);
      return { success: true, theme: seasonalTheme };
    } finally {
      setLoading(false);
    }
  };

  // Create a new theme (global)
  const createTheme = async (themeData) => {
    try {
      console.log('Creating new theme:', themeData);
      const response = await themeAPI.createTheme(themeData);
      if (response.data.success) {
        console.log('Theme created successfully:', response.data.data);
        // Force refresh themes list after creating
        await loadAvailableThemes(true);
        return { success: true, theme: response.data.data };
      }
      return { success: false, error: 'Failed to create theme' };
    } catch (error) {
      console.error('Error creating theme:', error);
      return { success: false, error: error.message };
    }
  };

  // Update theme (global)
  const updateTheme = async (themeId, themeData) => {
    try {
      const response = await themeAPI.updateTheme(themeId, themeData);
      if (response.data.success) {
        // Force refresh themes list after updating
        await loadAvailableThemes(true);
        // If it's the current theme, reload it
        if (currentTheme.id === themeId) {
          await loadActiveTheme(true);
        }
        return { success: true, theme: response.data.data };
      }
      return { success: false, error: 'Failed to update theme' };
    } catch (error) {
      console.error('Error updating theme:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete theme (global)
  const deleteTheme = async (themeId) => {
    try {
      const response = await themeAPI.deleteTheme(themeId);
      if (response.data.success) {
        // Force refresh themes list after deleting
        await loadAvailableThemes(true);
        return { success: true };
      }
      return { success: false, error: 'Failed to delete theme' };
    } catch (error) {
      console.error('Error deleting theme:', error);
      return { success: false, error: error.message };
    }
  };

  // NEW: Functions for child components to control refresh behavior
  const setUserActive = (active) => {
    setIsUserActive(active);
    if (active) {
      lastActivityRef.current = Date.now();
    }
  };

  const setModalOpenState = (open) => {
    setModalOpen(open);
  };

  // Apply CSS variables to document root for all users
  useEffect(() => {
    const root = document.documentElement;
    
    console.log('Applying theme colors to CSS variables:', themeColors);
    
    // Apply theme colors as CSS variables
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    
    // Also set legacy variables for compatibility
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-secondary', themeColors.secondary);
    root.style.setProperty('--color-accent', themeColors.accent);
    root.style.setProperty('--color-background', themeColors.background);
    root.style.setProperty('--color-card-background', themeColors.cardBackground);
    root.style.setProperty('--color-text', themeColors.text);
    root.style.setProperty('--color-text-secondary', themeColors.textSecondary);
    
    // Update document background for immediate visual feedback
    document.body.style.backgroundColor = themeColors.background;
    document.body.style.color = themeColors.text;
    
    console.log('CSS variables applied successfully');
  }, [themeColors]);

  // Load initial theme on mount - THIS HAPPENS FOR ALL USERS
  useEffect(() => {
    console.log('ThemeProvider mounted, loading initial theme...');
    loadActiveTheme(true); // Force load on mount
    loadAvailableThemes(true); // Force load on mount
  }, []);

  // IMPROVED: Smart auto-refresh that respects user activity
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      const inactiveTime = 2 * 60 * 1000; // 2 minutes
      
      // Only auto-refresh if user has been inactive for 2+ minutes AND no modals are open
      if (timeSinceLastActivity > inactiveTime && !modalOpen && !isUserActive) {
        console.log('Auto-refreshing themes after user inactivity');
        loadActiveTheme(false); // Non-forced refresh
      }
    }, 60000); // Check every minute instead of every 30 seconds

    return () => clearInterval(interval);
  }, [isUserActive, modalOpen]);

  // Track user activity to prevent disruptive refreshes
  useEffect(() => {
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      setIsUserActive(true);
      
      // Reset user active state after 30 seconds of no activity
      setTimeout(() => setIsUserActive(false), 30000);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, []);

  const contextValue = {
    // Theme state
    currentTheme,
    themeColors,
    availableThemes,
    loading,
    error,
    
    // Theme actions (all global)
    activateTheme,          // ← This now changes theme for ALL users
    activateSeasonalTheme,  // ← This now changes theme for ALL users
    createTheme,
    updateTheme,
    deleteTheme,
    
    // Utility functions
    loadActiveTheme,
    loadAvailableThemes,
    getCurrentSeasonalTheme,
    
    // NEW: Activity control functions for child components
    setUserActive,
    setModalOpenState,
    
    // Predefined themes for reference
    predefinedThemes
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;