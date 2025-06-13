import React, { useState } from 'react';
import { X, Check, Eye, Palette } from 'lucide-react';

const ThemePreviewModal = ({ isOpen, onClose, theme, onActivate, currentThemeId }) => {
  const [activating, setActivating] = useState(false);

  // Notify parent about user activity when modal is being used
  React.useEffect(() => {
    if (isOpen) {
      const handleActivity = () => {
        // Modal is being used, user is active
      };
      
      document.addEventListener('mousedown', handleActivity);
      document.addEventListener('keydown', handleActivity);
      
      return () => {
        document.removeEventListener('mousedown', handleActivity);
        document.removeEventListener('keydown', handleActivity);
      };
    }
  }, [isOpen]);

  if (!isOpen || !theme) return null;

  const handleActivate = async () => {
    setActivating(true);
    try {
      await onActivate(theme.id || theme.name);
      onClose();
    } catch (error) {
      console.error('Error activating theme:', error);
      alert('Failed to activate theme. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  const isCurrentTheme = currentThemeId === theme.id || currentThemeId === theme.name;

  // Preview styles using the theme colors
  const previewStyles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 1001,
    },

    modal: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: '16px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      border: `1px solid ${theme.colors.secondary}`,
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px',
      borderBottom: `1px solid ${theme.colors.secondary}`,
      backgroundColor: theme.colors.cardBackground,
    },

    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: theme.colors.text,
      margin: 0,
    },

    closeButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      color: theme.colors.textSecondary,
    },

    content: {
      padding: '24px',
      backgroundColor: theme.colors.background,
    },

    previewSection: {
      marginBottom: '24px',
    },

    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: '16px',
    },

    colorPalette: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },

    colorItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    },

    colorSwatch: (color) => ({
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      backgroundColor: color,
      border: `2px solid ${theme.colors.secondary}`,
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    }),

    colorLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },

    colorValue: {
      fontSize: '11px',
      color: theme.colors.textSecondary,
      fontFamily: 'monospace',
    },

    previewCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },

    previewCard: {
      backgroundColor: theme.colors.cardBackground,
      border: `1px solid ${theme.colors.secondary}`,
      borderRadius: '12px',
      padding: '16px',
    },

    cardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: '8px',
    },

    cardText: {
      fontSize: '14px',
      color: theme.colors.textSecondary,
      marginBottom: '12px',
    },

    previewButton: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
    },

    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px',
      borderTop: `1px solid ${theme.colors.secondary}`,
      backgroundColor: theme.colors.cardBackground,
    },

    themeInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },

    themeName: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.colors.text,
    },

    themeDescription: {
      fontSize: '14px',
      color: theme.colors.textSecondary,
    },

    actionButtons: {
      display: 'flex',
      gap: '12px',
    },

    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },

    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: 'white',
    },

    secondaryButton: {
      backgroundColor: 'transparent',
      color: theme.colors.textSecondary,
      border: `1px solid ${theme.colors.secondary}`,
    },

    currentThemeBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      backgroundColor: `${theme.colors.primary}20`,
      color: theme.colors.primary,
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
    },
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={previewStyles.overlay} onClick={onClose}>
      <div style={previewStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={previewStyles.header}>
          <h2 style={previewStyles.title}>
            <Palette size={24} style={{ marginRight: '8px' }} />
            Theme Preview
          </h2>
          <button style={previewStyles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={previewStyles.content}>
          <div style={previewStyles.previewSection}>
            <h3 style={previewStyles.sectionTitle}>Color Palette</h3>
            <div style={previewStyles.colorPalette}>
              {Object.entries(theme.colors).map(([name, color]) => (
                <div key={name} style={previewStyles.colorItem}>
                  <div 
                    style={previewStyles.colorSwatch(color)}
                    onClick={() => copyToClipboard(color)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={previewStyles.colorLabel}>
                    {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div style={previewStyles.colorValue}>{color}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={previewStyles.previewSection}>
            <h3 style={previewStyles.sectionTitle}>Component Preview</h3>
            <div style={previewStyles.previewCards}>
              <div style={previewStyles.previewCard}>
                <div style={previewStyles.cardTitle}>Sample Card</div>
                <div style={previewStyles.cardText}>
                  This is how cards would look with this theme. The text uses the theme's text colors.
                </div>
                <button style={previewStyles.previewButton}>
                  Primary Button
                </button>
              </div>

              <div style={previewStyles.previewCard}>
                <div style={previewStyles.cardTitle}>Another Card</div>
                <div style={previewStyles.cardText}>
                  Background colors and borders adapt to the selected theme automatically.
                </div>
                <button style={{
                  ...previewStyles.previewButton,
                  backgroundColor: 'transparent',
                  color: theme.colors.primary,
                  border: `1px solid ${theme.colors.primary}`,
                }}>
                  Secondary Button
                </button>
              </div>

              <div style={previewStyles.previewCard}>
                <div style={previewStyles.cardTitle}>Theme Elements</div>
                <div style={previewStyles.cardText}>
                  All UI elements will automatically use the theme colors for consistency.
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px',
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                  }} />
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.accent,
                  }} />
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.secondary,
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={previewStyles.actions}>
          <div style={previewStyles.themeInfo}>
            <div style={previewStyles.themeName}>
              {theme.displayName || theme.name}
              {isCurrentTheme && (
                <span style={previewStyles.currentThemeBadge}>
                  <Check size={12} />
                  Current Theme
                </span>
              )}
            </div>
            <div style={previewStyles.themeDescription}>
              {theme.description || `${theme.type || 'Custom'} theme with beautiful color combinations`}
            </div>
          </div>

          <div style={previewStyles.actionButtons}>
            <button
              style={{ ...previewStyles.button, ...previewStyles.secondaryButton }}
              onClick={onClose}
            >
              Close
            </button>
            {!isCurrentTheme && (
              <button
                style={{ ...previewStyles.button, ...previewStyles.primaryButton }}
                onClick={handleActivate}
                disabled={activating}
              >
                {activating ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Activating...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Activate Theme
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ThemePreviewModal;