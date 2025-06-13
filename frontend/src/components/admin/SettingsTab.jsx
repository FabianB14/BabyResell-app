import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Settings, 
  DollarSign, 
  Mail, 
  Shield, 
  Bell,
  Database,
  Globe,
  Zap,
  AlertTriangle,
  Save,
  RotateCcw,
  Toggle,
  Info,
  Lock,
  Clock,
  Users,
  Package
} from 'lucide-react';

const SettingsTab = () => {
  const { themeColors } = useTheme();
  
  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'BabyResell',
    platformFeePercentage: 8,
    minListingPrice: 1,
    maxListingPrice: 10000,
    listingDuration: 30,
    autoArchiveAfterDays: 90,
    maxImagesPerListing: 8,
    maxListingsPerUser: 100,
    requireEmailVerification: true,
    requireListingApproval: false,
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back later.'
  });
  
  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    sendWelcomeEmail: true,
    sendTransactionEmails: true,
    sendNewsletters: false,
    adminNotificationEmail: 'admin@babyresell.com',
    supportEmail: 'support@babyresell.com',
    emailProvider: 'sendgrid'
  });
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPasswords: true,
    sessionTimeout: 7, // days
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    enableCaptcha: true,
    blockSuspiciousIPs: true,
    enableRateLimiting: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15 // minutes
  });
  
  // Backup Settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30, // days
    backupLocation: 'cloud',
    lastBackup: '2025-06-12 03:00:00'
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const styles = {
    container: {
      display: 'grid',
      gap: '24px',
    },
    
    section: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${themeColors.secondary}`,
    },
    
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    
    sectionIcon: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      backgroundColor: themeColors.secondary,
    },
    
    sectionTitle: {
      flex: 1,
    },
    
    sectionName: {
      fontSize: '18px',
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: '4px',
    },
    
    sectionDescription: {
      fontSize: '14px',
      color: themeColors.textSecondary,
    },
    
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
    },
    
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: themeColors.text,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    
    input: {
      padding: '10px 14px',
      backgroundColor: themeColors.secondary,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    
    select: {
      padding: '10px 14px',
      backgroundColor: themeColors.secondary,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      cursor: 'pointer',
      outline: 'none',
    },
    
    textarea: {
      padding: '10px 14px',
      backgroundColor: themeColors.secondary,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px',
    },
    
    helpText: {
      fontSize: '12px',
      color: themeColors.textSecondary,
    },
    
    switchContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
    },
    
    switchLabel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1,
    },
    
    switch: {
      width: '48px',
      height: '24px',
      backgroundColor: themeColors.secondary,
      borderRadius: '12px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    
    switchActive: {
      backgroundColor: themeColors.primary,
    },
    
    switchThumb: {
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      transition: 'transform 0.2s',
      transform: 'translateX(2px)',
    },
    
    switchThumbActive: {
      transform: 'translateX(26px)',
    },
    
    infoBox: {
      backgroundColor: '#3b82f620',
      border: '1px solid #3b82f640',
      borderRadius: '8px',
      padding: '12px 16px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      marginBottom: '20px',
    },
    
    warningBox: {
      backgroundColor: '#f59e0b20',
      border: '1px solid #f59e0b40',
      borderRadius: '8px',
      padding: '12px 16px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      marginBottom: '20px',
    },
    
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px',
      paddingTop: '32px',
      borderTop: `1px solid ${themeColors.secondary}`,
    },
    
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: themeColors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
    
    resetButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: themeColors.secondary,
      color: themeColors.text,
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    
    statValue: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      marginTop: '4px',
    },
  };
  
  const handleInputChange = (section, field, value) => {
    setHasChanges(true);
    switch(section) {
      case 'platform':
        setPlatformSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'email':
        setEmailSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecuritySettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'backup':
        setBackupSettings(prev => ({ ...prev, [field]: value }));
        break;
    }
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      alert('Settings saved successfully!');
    }, 1000);
  };
  
  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset logic here
      setHasChanges(false);
    }
  };
  
  const ToggleSwitch = ({ enabled, onChange }) => (
    <div 
      style={{
        ...styles.switch,
        ...(enabled ? styles.switchActive : {})
      }}
      onClick={onChange}
    >
      <div style={{
        ...styles.switchThumb,
        ...(enabled ? styles.switchThumbActive : {})
      }} />
    </div>
  );
  
  return (
    <div style={styles.container}>
      {/* Platform Settings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={{
            ...styles.sectionIcon,
            backgroundColor: '#3b82f620',
            color: '#3b82f6'
          }}>
            <Globe size={20} />
          </div>
          <div style={styles.sectionTitle}>
            <div style={styles.sectionName}>Platform Settings</div>
            <div style={styles.sectionDescription}>
              Configure general platform settings and policies
            </div>
          </div>
        </div>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Platform Name</label>
            <input
              type="text"
              style={styles.input}
              value={platformSettings.platformName}
              onChange={(e) => handleInputChange('platform', 'platformName', e.target.value)}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Platform Fee (%)
              <Info size={14} color={themeColors.textSecondary} />
            </label>
            <input
              type="number"
              style={styles.input}
              value={platformSettings.platformFeePercentage}
              onChange={(e) => handleInputChange('platform', 'platformFeePercentage', Number(e.target.value))}
              min="0"
              max="100"
            />
            <span style={styles.helpText}>
              Percentage charged on each transaction
            </span>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Min Listing Price ($)</label>
            <input
              type="number"
              style={styles.input}
              value={platformSettings.minListingPrice}
              onChange={(e) => handleInputChange('platform', 'minListingPrice', Number(e.target.value))}
              min="0"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Max Listing Price ($)</label>
            <input
              type="number"
              style={styles.input}
              value={platformSettings.maxListingPrice}
              onChange={(e) => handleInputChange('platform', 'maxListingPrice', Number(e.target.value))}
              min="0"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Listing Duration (days)</label>
            <input
              type="number"
              style={styles.input}
              value={platformSettings.listingDuration}
              onChange={(e) => handleInputChange('platform', 'listingDuration', Number(e.target.value))}
              min="1"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Max Images per Listing</label>
            <input
              type="number"
              style={styles.input}
              value={platformSettings.maxImagesPerListing}
              onChange={(e) => handleInputChange('platform', 'maxImagesPerListing', Number(e.target.value))}
              min="1"
              max="20"
            />
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Require Email Verification</span>
              <span style={styles.helpText}>
                Users must verify their email before listing items
              </span>
            </div>
            <ToggleSwitch 
              enabled={platformSettings.requireEmailVerification}
              onChange={() => handleInputChange('platform', 'requireEmailVerification', !platformSettings.requireEmailVerification)}
            />
          </div>
          
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Require Listing Approval</span>
              <span style={styles.helpText}>
                Admin must approve listings before they go live
              </span>
            </div>
            <ToggleSwitch 
              enabled={platformSettings.requireListingApproval}
              onChange={() => handleInputChange('platform', 'requireListingApproval', !platformSettings.requireListingApproval)}
            />
          </div>
          
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>
                <AlertTriangle size={16} color="#f59e0b" />
                Maintenance Mode
              </span>
              <span style={styles.helpText}>
                Temporarily disable the platform for maintenance
              </span>
            </div>
            <ToggleSwitch 
              enabled={platformSettings.maintenanceMode}
              onChange={() => handleInputChange('platform', 'maintenanceMode', !platformSettings.maintenanceMode)}
            />
          </div>
        </div>
        
        {platformSettings.maintenanceMode && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Maintenance Message</label>
            <textarea
              style={styles.textarea}
              value={platformSettings.maintenanceMessage}
              onChange={(e) => handleInputChange('platform', 'maintenanceMessage', e.target.value)}
            />
          </div>
        )}
      </div>
      
      {/* Email Settings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={{
            ...styles.sectionIcon,
            backgroundColor: '#10b98120',
            color: '#10b981'
          }}>
            <Mail size={20} />
          </div>
          <div style={styles.sectionTitle}>
            <div style={styles.sectionName}>Email Settings</div>
            <div style={styles.sectionDescription}>
              Configure email notifications and providers
            </div>
          </div>
        </div>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Admin Notification Email</label>
            <input
              type="email"
              style={styles.input}
              value={emailSettings.adminNotificationEmail}
              onChange={(e) => handleInputChange('email', 'adminNotificationEmail', e.target.value)}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Support Email</label>
            <input
              type="email"
              style={styles.input}
              value={emailSettings.supportEmail}
              onChange={(e) => handleInputChange('email', 'supportEmail', e.target.value)}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Provider</label>
            <select
              style={styles.select}
              value={emailSettings.emailProvider}
              onChange={(e) => handleInputChange('email', 'emailProvider', e.target.value)}
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="aws-ses">AWS SES</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Send Welcome Emails</span>
              <span style={styles.helpText}>
                Send welcome email to new users
              </span>
            </div>
            <ToggleSwitch 
              enabled={emailSettings.sendWelcomeEmail}
              onChange={() => handleInputChange('email', 'sendWelcomeEmail', !emailSettings.sendWelcomeEmail)}
            />
          </div>
          
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Send Transaction Emails</span>
              <span style={styles.helpText}>
                Notify users about purchases and sales
              </span>
            </div>
            <ToggleSwitch 
              enabled={emailSettings.sendTransactionEmails}
              onChange={() => handleInputChange('email', 'sendTransactionEmails', !emailSettings.sendTransactionEmails)}
            />
          </div>
        </div>
      </div>
      
      {/* Security Settings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={{
            ...styles.sectionIcon,
            backgroundColor: '#ef444420',
            color: '#ef4444'
          }}>
            <Shield size={20} />
          </div>
          <div style={styles.sectionTitle}>
            <div style={styles.sectionName}>Security Settings</div>
            <div style={styles.sectionDescription}>
              Configure platform security and access controls
            </div>
          </div>
        </div>
        
        <div style={styles.infoBox}>
          <Info size={20} color="#3b82f6" />
          <div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              Security Best Practices
            </div>
            <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
              Enable all recommended security features to protect your platform and users.
            </div>
          </div>
        </div>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Session Timeout (days)</label>
            <input
              type="number"
              style={styles.input}
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', Number(e.target.value))}
              min="1"
              max="30"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Max Login Attempts</label>
            <input
              type="number"
              style={styles.input}
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => handleInputChange('security', 'maxLoginAttempts', Number(e.target.value))}
              min="3"
              max="10"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Rate Limit (requests)</label>
            <input
              type="number"
              style={styles.input}
              value={securitySettings.rateLimitRequests}
              onChange={(e) => handleInputChange('security', 'rateLimitRequests', Number(e.target.value))}
              min="10"
              max="1000"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Rate Limit Window (minutes)</label>
            <input
              type="number"
              style={styles.input}
              value={securitySettings.rateLimitWindow}
              onChange={(e) => handleInputChange('security', 'rateLimitWindow', Number(e.target.value))}
              min="1"
              max="60"
            />
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Enforce Strong Passwords</span>
              <span style={styles.helpText}>
                Require minimum 8 characters, numbers, and special characters
              </span>
            </div>
            <ToggleSwitch 
              enabled={securitySettings.enforceStrongPasswords}
              onChange={() => handleInputChange('security', 'enforceStrongPasswords', !securitySettings.enforceStrongPasswords)}
            />
          </div>
          
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Enable CAPTCHA</span>
              <span style={styles.helpText}>
                Protect forms from bots and spam
              </span>
            </div>
            <ToggleSwitch 
              enabled={securitySettings.enableCaptcha}
              onChange={() => handleInputChange('security', 'enableCaptcha', !securitySettings.enableCaptcha)}
            />
          </div>
          
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Block Suspicious IPs</span>
              <span style={styles.helpText}>
                Automatically block IPs with suspicious activity
              </span>
            </div>
            <ToggleSwitch 
              enabled={securitySettings.blockSuspiciousIPs}
              onChange={() => handleInputChange('security', 'blockSuspiciousIPs', !securitySettings.blockSuspiciousIPs)}
            />
          </div>
        </div>
      </div>
      
      {/* Backup Settings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={{
            ...styles.sectionIcon,
            backgroundColor: '#8b5cf620',
            color: '#8b5cf6'
          }}>
            <Database size={20} />
          </div>
          <div style={styles.sectionTitle}>
            <div style={styles.sectionName}>Backup Settings</div>
            <div style={styles.sectionDescription}>
              Configure automatic backups and data retention
            </div>
          </div>
        </div>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Backup Frequency</label>
            <select
              style={styles.select}
              value={backupSettings.backupFrequency}
              onChange={(e) => handleInputChange('backup', 'backupFrequency', e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Backup Retention (days)</label>
            <input
              type="number"
              style={styles.input}
              value={backupSettings.backupRetention}
              onChange={(e) => handleInputChange('backup', 'backupRetention', Number(e.target.value))}
              min="7"
              max="365"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Backup Location</label>
            <select
              style={styles.select}
              value={backupSettings.backupLocation}
              onChange={(e) => handleInputChange('backup', 'backupLocation', e.target.value)}
            >
              <option value="cloud">Cloud Storage</option>
              <option value="local">Local Storage</option>
              <option value="both">Both Cloud & Local</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Backup</label>
            <div style={styles.statValue}>
              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {backupSettings.lastBackup}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <div style={styles.switchContainer}>
            <div style={styles.switchLabel}>
              <span style={styles.label}>Enable Automatic Backups</span>
              <span style={styles.helpText}>
                Automatically backup database and user files
              </span>
            </div>
            <ToggleSwitch 
              enabled={backupSettings.autoBackupEnabled}
              onChange={() => handleInputChange('backup', 'autoBackupEnabled', !backupSettings.autoBackupEnabled)}
            />
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div style={styles.actions}>
        <button 
          style={{
            ...styles.saveButton,
            opacity: saving ? 0.7 : 1,
          }}
          onClick={handleSaveSettings}
          disabled={saving || !hasChanges}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        
        <button 
          style={styles.resetButton}
          onClick={handleResetSettings}
        >
          <RotateCcw size={16} />
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;