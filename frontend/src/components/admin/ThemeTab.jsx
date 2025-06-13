import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeCreatorModal from '../ThemeCreatorModal';
import ThemePreviewModal from '../ThemePreviewModal';
import { 
  Palette, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Upload,
  Download,
  Copy,
  RefreshCw,
  Check,
  X,
  Star,
  Clock,
  Sun,
  Snowflake,
  Leaf,
  Flower,
  Heart,
  Gift,
  Sparkles,
  Moon,
  MoreVertical,
  Play,
  Settings
} from 'lucide-react';

const ThemeTab = () => {
  const { 
    themeColors, 
    currentTheme, 
    availableThemes, 
    predefinedThemes,
    activateTheme, 
    createTheme,
    loading 
  } = useTheme();
  
  const [activeView, setActiveView] = useState('current');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // Add preview modal state
  const [previewTheme, setPreviewTheme] = useState(null); // Theme being previewed
  const [activatingThemeId, setActivatingThemeId] = useState(null); // Track which theme is being activated

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock theme data - we'll combine this with predefined themes and available themes
  const [localThemes] = useState([
    {
      id: 'autumn-2024',
      name: 'autumn-2024',
      displayName: 'Autumn Harvest',
      status: 'scheduled',
      type: 'seasonal',
      startDate: '2024-09-22',
      endDate: '2024-12-20',
      description: 'Warm autumn colors with cozy vibes',
      colors: {
        primary: '#d97706',
        secondary: '#fed7aa',
        accent: '#ea580c',
        background: '#fef7ed',
        text: '#9a3412',
        cardBackground: '#ffffff'
      },
      icon: Leaf,
      previewImage: '/themes/autumn-preview.jpg',
      usage: 0,
      createdAt: '2024-04-10T12:00:00Z',
      updatedAt: '2024-04-10T12:00:00Z'
    },
    {
      id: 'winter-2024',
      name: 'winter-2024',
      displayName: 'Winter Wonderland',
      status: 'draft',
      type: 'seasonal',
      startDate: '2024-12-20',
      endDate: '2025-03-20',
      description: 'Cool winter theme with crystalline blues',
      colors: {
        primary: '#0ea5e9',
        secondary: '#e0f2fe',
        accent: '#0284c7',
        background: '#f0f9ff',
        text: '#0c4a6e',
        cardBackground: '#ffffff'
      },
      icon: Snowflake,
      previewImage: '/themes/winter-preview.jpg',
      usage: 0,
      createdAt: '2024-03-15T08:00:00Z',
      updatedAt: '2024-05-20T14:15:00Z'
    },
    {
      id: 'spring-2024',
      name: 'spring-2024',
      displayName: 'Spring Bloom',
      status: 'archived',
      type: 'seasonal',
      startDate: '2024-03-20',
      endDate: '2024-06-20',
      description: 'Fresh spring theme with vibrant greens',
      colors: {
        primary: '#22c55e',
        secondary: '#dcfce7',
        accent: '#16a34a',
        background: '#f0fdf4',
        text: '#15803d',
        cardBackground: '#ffffff'
      },
      icon: Flower,
      previewImage: '/themes/spring-preview.jpg',
      usage: 82,
      createdAt: '2024-01-20T16:00:00Z',
      updatedAt: '2024-06-20T23:59:00Z'
    },
    {
      id: 'valentines-2024',
      name: 'valentines-2024',
      displayName: 'Valentine Romance',
      status: 'archived',
      type: 'holiday',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      description: 'Romantic Valentine\'s Day theme',
      colors: {
        primary: '#ec4899',
        secondary: '#fce7f3',
        accent: '#db2777',
        background: '#fdf2f8',
        text: '#be185d',
        cardBackground: '#ffffff'
      },
      icon: Heart,
      previewImage: '/themes/valentine-preview.jpg',
      usage: 91,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-02-15T23:59:00Z'
    },
    {
      id: 'christmas-2023',
      name: 'christmas-2023',
      displayName: 'Christmas Joy',
      status: 'archived',
      type: 'holiday',
      startDate: '2023-12-01',
      endDate: '2023-12-26',
      description: 'Festive Christmas theme with holiday spirit',
      colors: {
        primary: '#dc2626',
        secondary: '#fee2e2',
        accent: '#b91c1c',
        background: '#fef2f2',
        text: '#991b1b',
        cardBackground: '#ffffff'
      },
      icon: Gift,
      previewImage: '/themes/christmas-preview.jpg',
      usage: 95,
      createdAt: '2023-11-01T14:00:00Z',
      updatedAt: '2023-12-26T10:30:00Z'
    }
  ]);

  // Combine all available themes
  const getAllThemes = () => {
    const allThemes = [];
    
    // Add predefined themes
    if (predefinedThemes) {
      Object.values(predefinedThemes).forEach(theme => {
        allThemes.push({
          ...theme,
          status: theme.id === currentTheme?.id || theme.name === currentTheme?.name ? 'active' : 'available',
          type: 'seasonal',
          icon: getThemeIcon(theme.name || theme.id)
        });
      });
    }
    
    // Add backend themes
    if (availableThemes && Array.isArray(availableThemes)) {
      availableThemes.forEach(theme => {
        allThemes.push({
          ...theme,
          status: theme.id === currentTheme?.id || theme.name === currentTheme?.name ? 'active' : 'available',
          icon: getThemeIcon(theme.name || theme.id)
        });
      });
    }
    
    // Add local themes
    localThemes.forEach(theme => {
      if (!allThemes.find(t => t.id === theme.id || t.name === theme.name)) {
        allThemes.push({
          ...theme,
          status: theme.id === currentTheme?.id || theme.name === currentTheme?.name ? 'active' : theme.status,
          icon: theme.icon
        });
      }
    });
    
    return allThemes;
  };

  const getThemeIcon = (themeName) => {
    const name = (themeName || '').toLowerCase();
    if (name.includes('spring')) return Flower;
    if (name.includes('summer')) return Sun;
    if (name.includes('fall') || name.includes('autumn')) return Leaf;
    if (name.includes('winter')) return Snowflake;
    if (name.includes('christmas')) return Gift;
    if (name.includes('valentine')) return Heart;
    return Palette;
  };

  const viewTabs = [
    { id: 'current', label: 'Current Theme', icon: Star },
    { id: 'available', label: 'Available Themes', icon: Palette },
    { id: 'archive', label: 'Archive', icon: Clock }
  ];

  // Handle theme activation
  const handleActivateTheme = async (themeId) => {
    try {
      setActivatingThemeId(themeId);
      const result = await activateTheme(themeId);
      
      if (result.success) {
        // Theme activated successfully
        console.log('Theme activated successfully:', result.theme);
        // The ThemeContext will handle updating the current theme
      } else {
        alert(result.error || 'Failed to activate theme');
      }
    } catch (error) {
      console.error('Error activating theme:', error);
      alert('Failed to activate theme. Please try again.');
    } finally {
      setActivatingThemeId(null);
    }
  };

  // Handle theme preview
  const handlePreviewTheme = (theme) => {
    setPreviewTheme(theme);
    setShowPreviewModal(true);
  };

  // Handle theme save from creator modal
  const handleThemeSave = async (themeData) => {
    try {
      const result = await createTheme(themeData);
      
      if (result.success) {
        alert('Theme created successfully!');
      } else {
        throw new Error(result.error || 'Failed to create theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error; // Let the modal handle the error
    }
  };

  const handleThemeAction = (action, themeId) => {
    console.log(`${action} theme ${themeId}`);
    // Implement theme actions here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'available': return '#3b82f6';
      case 'scheduled': return '#3b82f6';
      case 'draft': return '#f59e0b';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return Check;
      case 'available': return Palette;
      case 'scheduled': return Calendar;
      case 'draft': return Edit;
      case 'archived': return Clock;
      default: return Clock;
    }
  };

  const getFilteredThemes = () => {
    const allThemes = getAllThemes();
    
    switch (activeView) {
      case 'current':
        return allThemes.filter(theme => theme.status === 'active');
      case 'available':
        return allThemes.filter(theme => ['available', 'scheduled', 'draft'].includes(theme.status));
      case 'archive':
        return allThemes.filter(theme => theme.status === 'archived');
      default:
        return [];
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
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

    title: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: 'bold',
      color: themeColors.text,
      margin: 0,
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      width: isMobile ? '100%' : 'auto',
    },

    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: isMobile ? '8px 12px' : '8px 16px',
      backgroundColor: themeColors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
    },

    secondaryButton: {
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
    },

    tabContainer: {
      display: 'flex',
      gap: '4px',
      backgroundColor: themeColors.secondary,
      padding: '4px',
      borderRadius: '8px',
      width: isMobile ? '100%' : 'fit-content',
      overflowX: isMobile ? 'auto' : 'visible',
    },

    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: isMobile ? '8px 12px' : '8px 16px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '500',
      color: themeColors.textSecondary,
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      minWidth: isMobile ? 'fit-content' : 'auto',
    },

    activeTab: {
      backgroundColor: themeColors.primary,
      color: 'white',
    },

    currentThemeCard: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      padding: isMobile ? '16px' : '24px',
      marginBottom: isMobile ? '16px' : '24px',
    },

    currentThemeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '16px',
      marginBottom: '16px',
    },

    currentThemeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    themeIcon: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      borderRadius: '12px',
      backgroundColor: currentTheme?.colors?.primary || themeColors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    },

    themeDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },

    themeName: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: '600',
      color: themeColors.text,
    },

    themeDescription: {
      fontSize: isMobile ? '13px' : '14px',
      color: themeColors.textSecondary,
    },

    statusBadge: (status) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      backgroundColor: `${getStatusColor(status)}15`,
      color: getStatusColor(status),
      textTransform: 'capitalize',
    }),

    actionButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      color: themeColors.textSecondary,
      transition: 'all 0.2s ease',
    },

    colorPalette: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
    },

    colorSwatch: (color) => ({
      width: isMobile ? '32px' : '40px',
      height: isMobile ? '32px' : '40px',
      borderRadius: '8px',
      backgroundColor: color,
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    }),

    usageBar: {
      width: '100%',
      height: '4px',
      backgroundColor: themeColors.secondary,
      borderRadius: '2px',
      overflow: 'hidden',
      marginTop: '4px',
    },

    usageFill: (usage) => ({
      width: `${usage}%`,
      height: '100%',
      backgroundColor: themeColors.primary,
      transition: 'width 0.3s ease',
    }),

    themeGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: isMobile ? '12px' : '16px',
    },

    themeCard: {
      backgroundColor: themeColors.cardBackground,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '12px',
      padding: isMobile ? '16px' : '20px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      position: 'relative',
    },

    themeCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },

    themeCardInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1,
    },

    themeCardIcon: (theme) => ({
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: theme.colors?.primary || themeColors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0,
    }),

    themeCardContent: {
      flex: 1,
      minWidth: 0,
    },

    themeCardName: {
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: '4px',
    },

    themeCardMeta: {
      fontSize: isMobile ? '12px' : '13px',
      color: themeColors.textSecondary,
    },

    themeCardActions: {
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
    },

    themeCardDetails: {
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: `1px solid ${themeColors.secondary}`,
    },

    themeCardDescription: {
      fontSize: isMobile ? '12px' : '13px',
      color: themeColors.textSecondary,
      marginBottom: '12px',
      lineHeight: '1.4',
    },

    themeCardColors: {
      display: 'flex',
      gap: '6px',
      marginBottom: '12px',
    },

    smallColorSwatch: (color) => ({
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      backgroundColor: color,
      border: '1px solid rgba(0,0,0,0.1)',
    }),

    themeCardButtonContainer: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },

    themeCardButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      flex: 1,
      justifyContent: 'center',
    },

    previewButton: {
      backgroundColor: 'transparent',
      color: themeColors.primary,
      border: `1px solid ${themeColors.primary}`,
    },

    activateButton: {
      backgroundColor: themeColors.primary,
      color: 'white',
    },

    activatingButton: {
      backgroundColor: themeColors.textSecondary,
      color: 'white',
      cursor: 'not-allowed',
    },

    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: themeColors.textSecondary,
      gridColumn: '1 / -1',
    },

    loadingState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: themeColors.textSecondary,
      gridColumn: '1 / -1',
    },
  };

  const renderCurrentTheme = () => {
    if (!currentTheme) return null;
    
    const CurrentThemeIcon = getThemeIcon(currentTheme.name || currentTheme.id);
    
    return (
      <div style={styles.currentThemeCard}>
        <div style={styles.currentThemeHeader}>
          <div style={styles.currentThemeInfo}>
            <div style={styles.themeIcon}>
              <CurrentThemeIcon size={isMobile ? 20 : 24} />
            </div>
            <div style={styles.themeDetails}>
              <div style={styles.themeName}>{currentTheme.displayName || currentTheme.name}</div>
              <div style={styles.themeDescription}>
                {currentTheme.description || 'Currently active theme'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={styles.statusBadge('active')}>
              <Check size={12} />
              Active
            </span>
            <button style={styles.actionButton}>
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: themeColors.text }}>Theme Colors</h4>
            <div style={styles.colorPalette}>
              {currentTheme.colors && Object.entries(currentTheme.colors).slice(0, 6).map(([name, color]) => (
                <div
                  key={name}
                  style={styles.colorSwatch(color)}
                  title={`${name}: ${color}`}
                  onClick={() => copyToClipboard(color)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: themeColors.text }}>Quick Actions</h4>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                style={{ ...styles.button, ...styles.secondaryButton, fontSize: '12px', padding: '6px 12px' }}
                onClick={() => handlePreviewTheme(currentTheme)}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                style={{ ...styles.button, fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setShowThemeCreator(true)}
              >
                <Plus size={14} />
                Create New
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading themes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Theme Management</h2>
        <div style={styles.headerActions}>
          <button style={{ ...styles.button, ...styles.secondaryButton }}>
            <Upload size={16} />
            {!isMobile && 'Import Theme'}
          </button>
          <button 
            style={styles.button}
            onClick={() => setShowThemeCreator(true)}
          >
            <Plus size={16} />
            {!isMobile && 'Create Theme'}
          </button>
        </div>
      </div>

      <div style={styles.tabContainer}>
        {viewTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeView === tab.id ? styles.activeTab : {})
              }}
              onClick={() => setActiveView(tab.id)}
            >
              <Icon size={16} />
              {!isMobile || tab.label.length < 12 ? tab.label : tab.label.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {activeView === 'current' && renderCurrentTheme()}

      <div style={styles.themeGrid}>
        {getFilteredThemes().length === 0 ? (
          <div style={styles.emptyState}>
            <Palette size={48} />
            <p>No themes found for this category.</p>
          </div>
        ) : (
          getFilteredThemes().map((theme) => {
            const Icon = theme.icon || getThemeIcon(theme.name || theme.id);
            const StatusIcon = getStatusIcon(theme.status);
            const isActive = theme.status === 'active';
            const isActivating = activatingThemeId === (theme.id || theme.name);
            
            return (
              <div 
                key={theme.id || theme.name} 
                style={styles.themeCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = themeColors.primary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = themeColors.secondary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={styles.themeCardHeader}>
                  <div style={styles.themeCardInfo}>
                    <div style={styles.themeCardIcon(theme)}>
                      <Icon size={18} />
                    </div>
                    <div style={styles.themeCardContent}>
                      <div style={styles.themeCardName}>{theme.displayName || theme.name}</div>
                      <div style={styles.themeCardMeta}>
                        {theme.type || 'Custom'} theme
                        {theme.startDate && ` • ${formatDate(theme.startDate)}`}
                      </div>
                    </div>
                  </div>
                  <div style={styles.themeCardActions}>
                    <span style={styles.statusBadge(theme.status)}>
                      <StatusIcon size={10} />
                      {theme.status}
                    </span>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleThemeAction('more', theme.id || theme.name)}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>

                <div style={styles.themeCardDetails}>
                  <div style={styles.themeCardDescription}>
                    {theme.description || `A beautiful ${theme.type || 'custom'} theme with carefully chosen colors.`}
                  </div>

                  {theme.colors && (
                    <div style={styles.themeCardColors}>
                      {Object.entries(theme.colors).slice(0, 6).map(([name, color]) => (
                        <div
                          key={name}
                          style={styles.smallColorSwatch(color)}
                          title={`${name}: ${color}`}
                        />
                      ))}
                    </div>
                  )}

                  <div style={styles.themeCardButtonContainer}>
                    <button
                      style={{ ...styles.themeCardButton, ...styles.previewButton }}
                      onClick={() => handlePreviewTheme(theme)}
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                    
                    {!isActive && (
                      <button
                        style={{ 
                          ...styles.themeCardButton, 
                          ...(isActivating ? styles.activatingButton : styles.activateButton)
                        }}
                        onClick={() => handleActivateTheme(theme.id || theme.name)}
                        disabled={isActivating}
                      >
                        {isActivating ? (
                          <>
                            <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            Activating...
                          </>
                        ) : (
                          <>
                            <Play size={12} />
                            Activate
                          </>
                        )}
                      </button>
                    )}

                    {isActive && (
                      <button
                        style={{ ...styles.themeCardButton, ...styles.activateButton }}
                        disabled
                      >
                        <Check size={12} />
                        Active
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Theme Creator Modal */}
      <ThemeCreatorModal
        isOpen={showThemeCreator}
        onClose={() => setShowThemeCreator(false)}
        onSave={handleThemeSave}
      />

      {/* Theme Preview Modal */}
      <ThemePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewTheme(null);
        }}
        theme={previewTheme}
        onActivate={handleActivateTheme}
        currentThemeId={currentTheme?.id || currentTheme?.name}
      />

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

export default ThemeTab;