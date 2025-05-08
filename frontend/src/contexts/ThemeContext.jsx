import React, { createContext, useState, useContext } from 'react';

// Create context
export const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  // Dark theme colors
  const [themeColors] = useState({
    primary: '#e60023', // Pinterest red
    secondary: '#2e2e2e',
    accent: '#e2336b', // Gradient pink
    background: '#121212', // Dark background
    cardBackground: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0b0b0'
  });

  // Apply CSS variables to document root
  React.useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-secondary', themeColors.secondary);
    root.style.setProperty('--color-accent', themeColors.accent);
    root.style.setProperty('--color-background', themeColors.background);
    root.style.setProperty('--color-card-background', themeColors.cardBackground);
    root.style.setProperty('--color-text', themeColors.text);
    root.style.setProperty('--color-text-secondary', themeColors.textSecondary);
  }, [themeColors]);

  return (
    <ThemeContext.Provider
      value={{
        themeColors
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;