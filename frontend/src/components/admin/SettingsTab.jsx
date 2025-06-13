import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
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
  Plus
} from 'lucide-react';

const SettingsTab = () => {
  const { themeColors } = useTheme();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'BabyResell',
      siteDescription: 'A marketplace for parents to buy and sell pre-loved baby items',
      supportEmail: 'support@babyresell.com',
      timezone: 'America/Los_Angeles',
      language: 'en',
      maintenanceMode: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      transactionAlerts: true,
      securityAlerts: true,
      marketingEmails: false
    },
    payments: {
      stripePublicKey: 'pk_test_...',
      stripeSecretKey: '••••••••••••••••',
      paypalClientId: 'AYSq3RDGsmBLJi...',
      transactionFeePercent: 5.0,
      minimumPayout: 25.00,
      payoutSchedule: 'weekly'
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 30,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      accountLockoutDuration: 15
    },
    content: {
      autoModeratePosts: true,
      requirePostApproval: false,
      maxImagesPerListing: 8,
      maxDescriptionLength: 1000,
      allowGuestBrowsing: true
    }
  });
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

  const settingSections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'content', label: 'Content', icon: Package }
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setUnsavedChanges(false);
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    // Reset to original values (would typically fetch from API)
    setUnsavedChanges(false);
  };

  const toggleSecretVisibility = (key) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
      disabled: saving,
    },

    secondaryButton: {
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
    },

    saveButton: {
      backgroundColor: unsavedChanges ? themeColors.primary : '#10b981',
      opacity: unsavedChanges ? 1 : 0.6,
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
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/New_York">Eastern Time</option>
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
              {key === 'smsNotifications' && 'Receive notifications via SMS'}
              {key === 'transactionAlerts' && 'Get alerts for new transactions'}
              {key === 'securityAlerts' && 'Get alerts for security events'}
              {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
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
          Payment credentials are sensitive. Keep them secure and never share them.
        </span>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Stripe Public Key</div>
          <div style={styles.settingDescription}>Your Stripe publishable key</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="text"
            style={styles.input}
            value={settings.payments.stripePublicKey}
            onChange={(e) => handleSettingChange('payments', 'stripePublicKey', e.target.value)}
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
            />
            <div style={styles.secretActions}>
              <button
                style={styles.iconButton}
                onClick={() => toggleSecretVisibility('stripeSecret')}
              >
                {showSecrets.stripeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                style={styles.iconButton}
                onClick={() => copyToClipboard(settings.payments.stripeSecretKey)}
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
          <div style={styles.settingDescription}>Percentage fee charged on transactions</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            style={styles.input}
            value={settings.payments.transactionFeePercent}
            onChange={(e) => handleSettingChange('payments', 'transactionFeePercent', parseFloat(e.target.value))}
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
            min="10"
            step="5"
            style={styles.input}
            value={settings.payments.minimumPayout}
            onChange={(e) => handleSettingChange('payments', 'minimumPayout', parseFloat(e.target.value))}
          />
        </div>
      </div>
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
          <div style={styles.settingDescription}>Automatically log out inactive users</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="5"
            max="120"
            style={styles.input}
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div style={styles.settingItem}>
        <div style={styles.settingInfo}>
          <div style={styles.settingLabel}>Password Minimum Length</div>
          <div style={styles.settingDescription}>Minimum characters required for passwords</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="6"
            max="20"
            style={styles.input}
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
          />
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
          />
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
          <div style={styles.settingDescription}>Maximum number of images allowed per item</div>
        </div>
        <div style={styles.settingControl}>
          <input
            type="number"
            min="1"
            max="20"
            style={styles.input}
            value={settings.content.maxImagesPerListing}
            onChange={(e) => handleSettingChange('content', 'maxImagesPerListing', parseInt(e.target.value))}
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
          />
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Settings</h2>
        <div style={styles.headerActions}>
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
            {saving ? <RefreshCw size={16} /> : <Save size={16} />}
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
                >
                  <Icon size={16} />
                  {!isMobile || isTablet ? section.label : ''}
                </div>
              );
            })}
          </div>
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