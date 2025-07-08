import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI } from '../../utils/api';
import { showNotification } from '../../utils/adminUtils';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Bell,
  Shield,
  DollarSign,
  Mail,
  Globe,
  Database,
  Key,
  Users,
  Package,
  CreditCard,
  AlertTriangle,
  Check,
  X,
  Upload,
  Download,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Loader
} from 'lucide-react';

const SettingsTab = () => {
  const { themeColors } = useTheme();
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(true);
  
  const getDefaultSettings = () => ({
    general: {
      siteName: 'BabyResell',
      siteDescription: 'A marketplace for parents to buy and sell pre-loved baby items',
      supportEmail: 'support@babyresell.com',
      timezone: 'America/Los_Angeles',
      language: 'en',
      maintenanceMode: false,
      contactPhone: '',
      address: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: ''
      }
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      transactionAlerts: true,
      securityAlerts: true,
      marketingEmails: false,
      newUserNotifications: true,
      lowStockAlerts: false,
      dailyReports: false,
      weeklyReports: true
    },
    payments: {
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalSecretKey: '',
      transactionFeePercent: 8.0,
      minimumPayout: 25.00,
      payoutSchedule: 'weekly',
      currency: 'USD',
      taxEnabled: false,
      taxRate: 0
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 30,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      accountLockoutDuration: 15,
      requireStrongPassword: true,
      requireEmailVerification: true,
      ipWhitelisting: false,
      allowedIPs: [],
      enableCaptcha: false
    },
    content: {
      autoModeratePosts: true,
      requirePostApproval: false,
      maxImagesPerListing: 8,
      maxDescriptionLength: 1000,
      allowGuestBrowsing: true,
      minListingPrice: 1.00,
      maxListingPrice: 9999.99,
      enableCategories: true,
      enableTags: true,
      enableReviews: true,
      moderationKeywords: []
    }
  });
  
  const [settings, setSettings] = useState(getDefaultSettings());

  const [originalSettings, setOriginalSettings] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});

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

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    if (originalSettings) {
      const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setUnsavedChanges(hasChanges);
    }
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Try to load from API first
      try {
        // Check if adminAPI.getSettings exists
        if (adminAPI.getSettings) {
          const response = await adminAPI.getSettings();
          if (response.data) {
            // Merge with defaults to ensure all properties exist
            const mergedSettings = deepMerge(getDefaultSettings(), response.data);
            setSettings(mergedSettings);
            setOriginalSettings(mergedSettings);
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, using localStorage');
      }
      
      // If API fails or doesn't exist, load from localStorage
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Merge with defaults to ensure all properties exist
        const mergedSettings = deepMerge(getDefaultSettings(), parsedSettings);
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
      } else {
        // If no saved settings, use defaults
        const defaults = getDefaultSettings();
        setSettings(defaults);
        setOriginalSettings(defaults);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('Failed to load settings', 'error');
      // Use defaults on error
      const defaults = getDefaultSettings();
      setSettings(defaults);
      setOriginalSettings(defaults);
    } finally {
      setLoading(false);
    }
  };

  // Deep merge helper function
  const deepMerge = (target, source) => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  };

  const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
  };

  const settingSections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'content', label: 'Content', icon: Package }
  ];

  const handleSettingChange = (section, key, value) => {
    if (key.includes('.')) {
      // Handle nested properties
      const keys = key.split('.');
      setSettings(prev => {
        const newSettings = { ...prev };
        let current = newSettings[section];
        
        // Ensure nested objects exist
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newSettings;
      });
    } else {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));
    }
  };

  const validateSettings = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.general.supportEmail)) {
      showNotification('Please enter a valid support email', 'error');
      return false;
    }

    // Validate payment settings
    if (settings.payments.transactionFeePercent < 0 || settings.payments.transactionFeePercent > 50) {
      showNotification('Transaction fee must be between 0% and 50%', 'error');
      return false;
    }

    if (settings.payments.minimumPayout < 1) {
      showNotification('Minimum payout must be at least $1', 'error');
      return false;
    }

    // Validate security settings
    if (settings.security.passwordMinLength < 6 || settings.security.passwordMinLength > 32) {
      showNotification('Password minimum length must be between 6 and 32', 'error');
      return false;
    }

    if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 1440) {
      showNotification('Session timeout must be between 5 minutes and 24 hours', 'error');
      return false;
    }

    // Validate content settings
    if (settings.content.maxImagesPerListing < 1 || settings.content.maxImagesPerListing > 20) {
      showNotification('Max images must be between 1 and 20', 'error');
      return false;
    }

    if (settings.content.minListingPrice >= settings.content.maxListingPrice) {
      showNotification('Maximum price must be greater than minimum price', 'error');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      return;
    }

    setSaving(true);
    
    try {
      // Save to localStorage first (immediate feedback)
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      // Try to save to API
      try {
        if (adminAPI.updateSettings) {
          await adminAPI.updateSettings(settings);
        }
      } catch (apiError) {
        console.warn('API save failed, but settings saved locally:', apiError);
      }
      
      // Update original settings to current settings
      setOriginalSettings(settings);
      setUnsavedChanges(false);
      
      showNotification('Settings saved successfully!', 'success');
      
      // Apply certain settings immediately
      applySettingsChanges(settings);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applySettingsChanges = (newSettings) => {
    // Apply maintenance mode
    if (newSettings.general.maintenanceMode) {
      // You could set a global flag or redirect users
      console.log('Maintenance mode enabled');
    }

    // Apply theme/language changes if needed
    if (newSettings.general.language !== originalSettings?.general?.language) {
      // Trigger language change
      console.log('Language changed to:', newSettings.general.language);
    }

    // Update document title
    document.title = `${newSettings.general.siteName} - Admin`;
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard all unsaved changes?')) {
      setSettings(originalSettings);
      setUnsavedChanges(false);
      showNotification('Changes discarded', 'info');
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset ALL settings to defaults? This cannot be undone.')) {
      const defaultSettings = getDefaultSettings();
      
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
      setUnsavedChanges(false);
      
      // Save defaults
      localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
      
      showNotification('Settings reset to defaults', 'success');
    }
  };

  const toggleSecretVisibility = (key) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(`${label} copied to clipboard`, 'success');
    } catch (err) {
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `babyresell-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Settings exported successfully', 'success');
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          
          // Validate imported settings structure
          if (importedSettings.general && importedSettings.notifications && 
              importedSettings.payments && importedSettings.security && importedSettings.content) {
            setSettings(importedSettings);
            setUnsavedChanges(true);
            showNotification('Settings imported successfully. Remember to save!', 'success');
          } else {
            showNotification('Invalid settings file format', 'error');
          }
        } catch (error) {
          showNotification('Failed to parse settings file', 'error');
        }
      };
      reader.readAsText(file);
    }
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
      transition: 'all 0.2s',
    },

    secondaryButton: {
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
    },

    saveButton: {
      backgroundColor: unsavedChanges ? themeColors.primary : '#10b981',
      opacity: unsavedChanges ? 1 : 0.8,
    },

    mainContent: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '200px 1fr' : '250px 1fr',
      gap: isMobile ? '16px' : '24px',
    },

    sidebar: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      padding: isMobile ? '12px' : '16px',
      height: 'fit-content',
      position: isMobile ? 'static' : 'sticky',
      top: '20px',
      order: isMobile ? 2 : 1,
    },

    sidebarTitle: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: isMobile ? '8px' : '12px',
    },

    sectionList: {
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      gap: isMobile ? '8px' : '4px',
      overflowX: isMobile ? 'auto' : 'visible',
    },

    sectionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: isMobile ? '8px 12px' : '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '500',
      color: themeColors.textSecondary,
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      minWidth: isMobile ? 'fit-content' : 'auto',
    },

    activeSectionItem: {
      backgroundColor: themeColors.primary,
      color: 'white',
    },

    settingsPanel: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      padding: isMobile ? '16px' : '24px',
      order: isMobile ? 1 : 2,
      minHeight: '400px',
    },

    sectionHeader: {
      marginBottom: isMobile ? '16px' : '24px',
      paddingBottom: '12px',
      borderBottom: `1px solid ${themeColors.secondary}`,
    },

    sectionTitle: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: '4px',
    },

    sectionDescription: {
      fontSize: isMobile ? '13px' : '14px',
      color: themeColors.textSecondary,
    },

    settingsGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '20px',
    },

    settingGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },

    settingItem: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '8px' : '16px',
      padding: '12px',
      backgroundColor: themeColors.background,
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
    },

    settingInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1,
    },

    settingLabel: {
      fontSize: isMobile ? '14px' : '15px',
      fontWeight: '500',
      color: themeColors.text,
    },

    settingDescription: {
      fontSize: isMobile ? '12px' : '13px',
      color: themeColors.textSecondary,
      lineHeight: '1.4',
    },

    settingControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: isMobile ? '100%' : '200px',
    },

    input: {
      padding: '8px 12px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '6px',
      color: themeColors.text,
      fontSize: '14px',
      width: '100%',
      outline: 'none',
      transition: 'background-color 0.2s',
    },

    select: {
      padding: '8px 12px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '6px',
      color: themeColors.text,
      fontSize: '14px',
      cursor: 'pointer',
      width: '100%',
      outline: 'none',
    },

    toggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    },

    toggleSwitch: (checked) => ({
      width: '44px',
      height: '24px',
      backgroundColor: checked ? themeColors.primary : themeColors.secondary,
      borderRadius: '12px',
      position: 'relative',
      transition: 'all 0.2s ease',
    }),

    toggleHandle: (checked) => ({
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      left: checked ? '22px' : '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }),

    secretInput: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    secretActions: {
      display: 'flex',
      gap: '4px',
      marginLeft: '8px',
    },

    iconButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      color: themeColors.textSecondary,
      transition: 'all 0.2s ease',
    },

    warningBanner: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      marginBottom: '16px',
    },

    warningText: {
      fontSize: '13px',
      color: '#92400e',
    },

    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: themeColors.textSecondary,
    },

    loadingState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: '16px',
    },

    loadingText: {
      color: themeColors.textSecondary,
      fontSize: '14px',
    },

    groupTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: themeColors.text,
      marginTop: '16px',
      marginBottom: '8px',
    },

    socialInputGroup: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '12px',
    },

    fileInput: {
      display: 'none',
    },

    importButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
  };

  const renderGeneralSettings = () => (
    <div style={styles.settingsGrid}>
      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Site Name</div>
          <div style={styles.settingDescription}>The name of your marketplace</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="text"
            style={styles.input}
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Site Description</div>
          <div style={styles.settingDescription}>Brief description of your marketplace</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="text"
            style={styles.input}
            value={settings.general.siteDescription}
            onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Support Email</div>
          <div style={styles.settingDescription}>Email address for customer support</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="email"
            style={styles.input}
            value={settings.general.supportEmail}
            onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Contact Phone</div>
          <div style={styles.settingDescription}>Phone number for customer support</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="tel"
            style={styles.input}
            value={settings.general.contactPhone}
            onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
            placeholder="(555) 123-4567"
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Business Address</div>
          <div style={styles.settingDescription}>Your business address (optional)</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="text"
            style={styles.input}
            value={settings.general.address}
            onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
            placeholder="123 Main St, City, State ZIP"
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Timezone</div>
          <div style={styles.settingDescription}>Default timezone for the application</div>
        </div>
        <div style={styles.settingControl}>
          <select
            style={styles.select}
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </select>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Language</div>
          <div style={styles.settingDescription}>Default language for the application</div>
        </div>
        <div style={styles.settingControl}>
          <select
            style={styles.select}
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Maintenance Mode</div>
          <div style={styles.settingDescription}>Temporarily disable public access to the site</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
          >
            <div style={styles.toggleSwitch(settings.general.maintenanceMode)}>
              <div style={styles.toggleHandle(settings.general.maintenanceMode)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.general.maintenanceMode ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.groupTitle}>Social Media Links</div>
      <div style={styles.socialInputGroup}>
        <div style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingLabel}>Facebook</div>
          </div>
          <div style={styles.settingControl}>
            <input
              type="url"
              style={styles.input}
              value={settings.general.socialMedia?.facebook || ''}
              onChange={(e) => handleSettingChange('general', 'socialMedia.facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
              onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
            />
          </div>
        </div>

        <div style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingLabel}>Twitter</div>
          </div>
          <div style={styles.settingControl}>
            <input
              type="url"
              style={styles.input}
              value={settings.general.socialMedia?.twitter || ''}
              onChange={(e) => handleSettingChange('general', 'socialMedia.twitter', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
              onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
            />
          </div>
        </div>

        <div style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingLabel}>Instagram</div>
          </div>
          <div style={styles.settingControl}>
            <input
              type="url"
              style={styles.input}
              value={settings.general.socialMedia?.instagram || ''}
              onChange={(e) => handleSettingChange('general', 'socialMedia.instagram', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
              onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div style={styles.settingsGrid}>
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </div>
            <div style={styles.settingDescription}>
              {key === 'emailNotifications' && 'Receive notifications via email'}
              {key === 'pushNotifications' && 'Receive push notifications in browser'}
              {key === 'smsNotifications' && 'Receive notifications via SMS (requires phone number)'}
              {key === 'transactionAlerts' && 'Get instant alerts for new transactions'}
              {key === 'securityAlerts' && 'Get alerts for security events and suspicious activity'}
              {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
              {key === 'newUserNotifications' && 'Get notified when new users register'}
              {key === 'lowStockAlerts' && 'Alert when inventory is running low'}
              {key === 'dailyReports' && 'Receive daily summary reports via email'}
              {key === 'weeklyReports' && 'Receive weekly performance reports'}
            </div>
          </div>
          <div style={styles.settingControl}>
            <div 
              style={styles.toggle}
              onClick={() => handleSettingChange('notifications', key, !value)}
            >
              <div style={styles.toggleSwitch(value)}>
                <div style={styles.toggleHandle(value)} />
              </div>
              <span style={{ fontSize: '14px', color: themeColors.text }}>
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPaymentSettings = () => (
    <div style={styles.settingsGrid}>
      <div style={styles.warningBanner}>
        <AlertTriangle size={16} color="#f59e0b" />
        <span style={styles.warningText}>
          Payment credentials are sensitive. Keep them secure and never share them publicly.
        </span>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Stripe Public Key</div>
          <div style={styles.settingDescription}>Your Stripe publishable key (starts with pk_)</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="text"
            style={styles.input}
            value={settings.payments.stripePublicKey}
            onChange={(e) => handleSettingChange('payments', 'stripePublicKey', e.target.value)}
            placeholder="pk_test_..."
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Stripe Secret Key</div>
          <div style={styles.settingDescription}>Your Stripe secret key (keep confidential)</div>
        </div>
        <div style={styles.settingControl}>
          <div style={styles.secretInput}>
            <input
              type={showSecrets.stripeSecret ? "text" : "password"}
              style={styles.input}
              value={settings.payments.stripeSecretKey}
              onChange={(e) => handleSettingChange('payments', 'stripeSecretKey', e.target.value)}
              placeholder="sk_test_..."
              onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
              onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
            />
            <div style={styles.secretActions}>
              <button
                style={styles.iconButton}
                onClick={() => toggleSecretVisibility('stripeSecret')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {showSecrets.stripeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                style={styles.iconButton}
                onClick={() => copyToClipboard(settings.payments.stripeSecretKey, 'Stripe secret key')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>PayPal Client ID</div>
          <div style={styles.settingDescription}>Your PayPal application client ID</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="text"
            style={styles.input}
            value={settings.payments.paypalClientId}
            onChange={(e) => handleSettingChange('payments', 'paypalClientId', e.target.value)}
            placeholder="AYSq3RDGsmBLJE..."
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>PayPal Secret Key</div>
          <div style={styles.settingDescription}>Your PayPal application secret</div>
        </div>
        <div style={styles.settingControl}>
          <div style={styles.secretInput}>
            <input
              type={showSecrets.paypalSecret ? "text" : "password"}
              style={styles.input}
              value={settings.payments.paypalSecretKey}
              onChange={(e) => handleSettingChange('payments', 'paypalSecretKey', e.target.value)}
              placeholder="EK-XXXXXXX..."
              onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
              onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
            />
            <div style={styles.secretActions}>
              <button
                style={styles.iconButton}
                onClick={() => toggleSecretVisibility('paypalSecret')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {showSecrets.paypalSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                style={styles.iconButton}
                onClick={() => copyToClipboard(settings.payments.paypalSecretKey, 'PayPal secret')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Transaction Fee (%)</div>
          <div style={styles.settingDescription}>Percentage fee charged on transactions (0-50%)</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="0"
            max="50"
            step="0.1"
            style={styles.input}
            value={settings.payments.transactionFeePercent}
            onChange={(e) => handleSettingChange('payments', 'transactionFeePercent', parseFloat(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Minimum Payout</div>
          <div style={styles.settingDescription}>Minimum amount required for seller payouts</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="1"
            step="5"
            style={styles.input}
            value={settings.payments.minimumPayout}
            onChange={(e) => handleSettingChange('payments', 'minimumPayout', parseFloat(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Payout Schedule</div>
          <div style={styles.settingDescription}>How often sellers receive their earnings</div>
        </div>
        <div style={styles.settingControl}>
          <select
            style={styles.select}
            value={settings.payments.payoutSchedule}
            onChange={(e) => handleSettingChange('payments', 'payoutSchedule', e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Currency</div>
          <div style={styles.settingDescription}>Default currency for transactions</div>
        </div>
        <div style={styles.settingControl}>
          <select
            style={styles.select}
            value={settings.payments.currency}
            onChange={(e) => handleSettingChange('payments', 'currency', e.target.value)}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="JPY">JPY - Japanese Yen</option>
          </select>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Enable Tax Collection</div>
          <div style={styles.settingDescription}>Automatically calculate and collect sales tax</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('payments', 'taxEnabled', !settings.payments.taxEnabled)}
          >
            <div style={styles.toggleSwitch(settings.payments.taxEnabled)}>
              <div style={styles.toggleHandle(settings.payments.taxEnabled)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.payments.taxEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {settings.payments.taxEnabled && (
        <div style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingLabel}>Tax Rate (%)</div>
            <div style={styles.settingDescription}>Default tax rate for transactions</div>
          </div>
          <div style={styles.settingControl}>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              style={styles.input}
              value={settings.payments.taxRate}
              onChange={(e) => handleSettingChange('payments', 'taxRate', parseFloat(e.target.value))}
              onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
              onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderSecuritySettings = () => (
    <div style={styles.settingsGrid}>
      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Require Two-Factor Authentication</div>
          <div style={styles.settingDescription}>Force all admin users to enable 2FA</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('security', 'twoFactorRequired', !settings.security.twoFactorRequired)}
          >
            <div style={styles.toggleSwitch(settings.security.twoFactorRequired)}>
              <div style={styles.toggleHandle(settings.security.twoFactorRequired)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.security.twoFactorRequired ? 'Required' : 'Optional'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Session Timeout (minutes)</div>
          <div style={styles.settingDescription}>Automatically log out inactive users (5-1440 min)</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="5"
            max="1440"
            style={styles.input}
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Password Minimum Length</div>
          <div style={styles.settingDescription}>Minimum characters required for passwords (6-32)</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="6"
            max="32"
            style={styles.input}
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Require Strong Password</div>
          <div style={styles.settingDescription}>Enforce uppercase, lowercase, numbers, and symbols</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('security', 'requireStrongPassword', !settings.security.requireStrongPassword)}
          >
            <div style={styles.toggleSwitch(settings.security.requireStrongPassword)}>
              <div style={styles.toggleHandle(settings.security.requireStrongPassword)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.security.requireStrongPassword ? 'Required' : 'Optional'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Max Login Attempts</div>
          <div style={styles.settingDescription}>Number of failed attempts before account lockout</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="3"
            max="10"
            style={styles.input}
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Account Lockout Duration (minutes)</div>
          <div style={styles.settingDescription}>How long to lock accounts after max failed attempts</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="5"
            max="60"
            style={styles.input}
            value={settings.security.accountLockoutDuration}
            onChange={(e) => handleSettingChange('security', 'accountLockoutDuration', parseInt(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Require Email Verification</div>
          <div style={styles.settingDescription}>Users must verify email before accessing account</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('security', 'requireEmailVerification', !settings.security.requireEmailVerification)}
          >
            <div style={styles.toggleSwitch(settings.security.requireEmailVerification)}>
              <div style={styles.toggleHandle(settings.security.requireEmailVerification)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.security.requireEmailVerification ? 'Required' : 'Optional'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Enable CAPTCHA</div>
          <div style={styles.settingDescription}>Add CAPTCHA to login and registration forms</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('security', 'enableCaptcha', !settings.security.enableCaptcha)}
          >
            <div style={styles.toggleSwitch(settings.security.enableCaptcha)}>
              <div style={styles.toggleHandle(settings.security.enableCaptcha)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.security.enableCaptcha ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div style={styles.settingsGrid}>
      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Auto-Moderate Posts</div>
          <div style={styles.settingDescription}>Automatically screen posts for inappropriate content</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('content', 'autoModeratePosts', !settings.content.autoModeratePosts)}
          >
            <div style={styles.toggleSwitch(settings.content.autoModeratePosts)}>
              <div style={styles.toggleHandle(settings.content.autoModeratePosts)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.content.autoModeratePosts ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Require Post Approval</div>
          <div style={styles.settingDescription}>All new listings must be manually approved</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('content', 'requirePostApproval', !settings.content.requirePostApproval)}
          >
            <div style={styles.toggleSwitch(settings.content.requirePostApproval)}>
              <div style={styles.toggleHandle(settings.content.requirePostApproval)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.content.requirePostApproval ? 'Required' : 'Auto-Publish'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Max Images Per Listing</div>
          <div style={styles.settingDescription}>Maximum number of images allowed per item (1-20)</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="1"
            max="20"
            style={styles.input}
            value={settings.content.maxImagesPerListing}
            onChange={(e) => handleSettingChange('content', 'maxImagesPerListing', parseInt(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Max Description Length</div>
          <div style={styles.settingDescription}>Maximum characters allowed in item descriptions</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="100"
            max="5000"
            step="100"
            style={styles.input}
            value={settings.content.maxDescriptionLength}
            onChange={(e) => handleSettingChange('content', 'maxDescriptionLength', parseInt(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Minimum Listing Price</div>
          <div style={styles.settingDescription}>Minimum price allowed for items</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="0"
            step="0.01"
            style={styles.input}
            value={settings.content.minListingPrice}
            onChange={(e) => handleSettingChange('content', 'minListingPrice', parseFloat(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Maximum Listing Price</div>
          <div style={styles.settingDescription}>Maximum price allowed for items</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="1"
            step="0.01"
            style={styles.input}
            value={settings.content.maxListingPrice}
            onChange={(e) => handleSettingChange('content', 'maxListingPrice', parseFloat(e.target.value))}
            onFocus={(e) => e.target.style.backgroundColor = themeColors.cardBackground}
            onBlur={(e) => e.target.style.backgroundColor = themeColors.secondary}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Allow Guest Browsing</div>
          <div style={styles.settingDescription}>Allow non-registered users to view listings</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('content', 'allowGuestBrowsing', !settings.content.allowGuestBrowsing)}
          >
            <div style={styles.toggleSwitch(settings.content.allowGuestBrowsing)}>
              <div style={styles.toggleHandle(settings.content.allowGuestBrowsing)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.content.allowGuestBrowsing ? 'Allowed' : 'Members Only'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Enable Categories</div>
          <div style={styles.settingDescription}>Allow items to be organized by categories</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('content', 'enableCategories', !settings.content.enableCategories)}
          >
            <div style={styles.toggleSwitch(settings.content.enableCategories)}>
              <div style={styles.toggleHandle(settings.content.enableCategories)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.content.enableCategories ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Enable Reviews</div>
          <div style={styles.settingDescription}>Allow buyers to leave reviews after purchases</div>
        </div>
        <div style={styles.settingControl}>
          <div 
            style={styles.toggle}
            onClick={() => handleSettingChange('content', 'enableReviews', !settings.content.enableReviews)}
          >
            <div style={styles.toggleSwitch(settings.content.enableReviews)}>
              <div style={styles.toggleHandle(settings.content.enableReviews)} />
            </div>
            <span style={{ fontSize: '14px', color: themeColors.text }}>
              {settings.content.enableReviews ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'payments': return renderPaymentSettings();
      case 'security': return renderSecuritySettings();
      case 'content': return renderContentSettings();
      default: return <div style={styles.emptyState}>Select a settings section</div>;
    }
  };

  const getSectionInfo = () => {
    const info = {
      general: { title: 'General Settings', description: 'Basic configuration and site information' },
      notifications: { title: 'Notification Settings', description: 'Configure email, push, and SMS notifications' },
      payments: { title: 'Payment Settings', description: 'Payment processing and fee configuration' },
      security: { title: 'Security Settings', description: 'Authentication and security policies' },
      content: { title: 'Content Settings', description: 'Content moderation and posting rules' }
    };
    return info[activeSection] || {};
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Admin Settings</h2>
        </div>
        <div style={styles.mainContent}>
          <div style={styles.settingsPanel}>
            <div style={styles.loadingState}>
              <Loader size={32} className="animate-spin" color={themeColors.primary} />
              <span style={styles.loadingText}>Loading settings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Settings</h2>
        <div style={styles.headerActions}>
          <input
            type="file"
            id="import-settings"
            style={styles.fileInput}
            accept=".json"
            onChange={importSettings}
          />
          <label htmlFor="import-settings" style={styles.importButton}>
            <Upload size={16} />
            Import
          </label>
          
          <button 
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={exportSettings}
          >
            <Download size={16} />
            Export
          </button>
          
          <button 
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleReset}
            disabled={!unsavedChanges}
          >
            <RefreshCw size={16} />
            Reset
          </button>
          
          <button 
            style={{ ...styles.button, ...styles.saveButton }}
            onClick={handleSave}
            disabled={saving || !unsavedChanges}
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : unsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Settings</h3>
          <div style={styles.sectionList}>
            {settingSections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  style={{
                    ...styles.sectionItem,
                    ...(activeSection === section.id ? styles.activeSectionItem : {})
                  }}
                  onClick={() => setActiveSection(section.id)}
                  onMouseEnter={(e) => !isMobile && (e.currentTarget.style.backgroundColor = activeSection !== section.id ? themeColors.secondary : '')}
                  onMouseLeave={(e) => !isMobile && (e.currentTarget.style.backgroundColor = activeSection !== section.id ? 'transparent' : '')}
                >
                  <Icon size={16} />
                  {!isMobile || isTablet ? section.label : ''}
                </div>
              );
            })}
          </div>
          
          {!isMobile && (
            <button
              style={{ ...styles.button, ...styles.secondaryButton, marginTop: '16px', width: '100%' }}
              onClick={handleResetToDefaults}
            >
              <AlertTriangle size={16} />
              Reset to Defaults
            </button>
          )}
        </div>

        <div style={styles.settingsPanel}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>{getSectionInfo().title}</h3>
            <p style={styles.sectionDescription}>{getSectionInfo().description}</p>
          </div>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;