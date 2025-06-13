import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Droplet,
  Type,
  Square,
  Circle,
  Save,
  RotateCcw,
  Eye,
  Download,
  Upload,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

const ThemeTab = () => {
  const { themeColors, currentTheme } = useTheme();
  
  const [selectedPreset, setSelectedPreset] = useState(currentTheme || 'dark');
  const [customColors, setCustomColors] = useState({
    primary: themeColors.primary || '#e60023',
    secondary: themeColors.secondary || '#2e2e2e',
    background: themeColors.background || '#121212',
    cardBackground: themeColors.cardBackground || '#1e1e1e',
    text: themeColors.text || '#ffffff',
    textSecondary: themeColors.textSecondary || '#b0b0b0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);
  
  const themePresets = [
    {
      id: 'dark',
      name: 'Dark Mode',
      description: 'Default dark theme',
      icon: Moon,
      colors: {
        primary: '#e60023',
        secondary: '#2e2e2e',
        background: '#121212',
        cardBackground: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#b0b0b0'
      }
    },
    {
      id: 'light',
      name: 'Light Mode',
      description: 'Clean and bright',
      icon: Sun,
      colors: {
        primary: '#e60023',
        secondary: '#f5f5f5',
        background: '#ffffff',
        cardBackground: '#f8f8f8',
        text: '#111111',
        textSecondary: '#666666'
      }
    },
    {
      id: 'midnight',
      name: 'Midnight Blue',
      description: 'Deep blue theme',
      icon: Moon,
      colors: {
        primary: '#3b82f6',
        secondary: '#1e293b',
        background: '#0f172a',
        cardBackground: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8'
      }
    },
    {
      id: 'forest',
      name: 'Forest Green',
      description: 'Nature inspired',
      icon: Droplet,
      colors: {
        primary: '#10b981',
        secondary: '#1f2937',
        background: '#111827',
        cardBackground: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#9ca3af'
      }
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      description: 'Elegant purple theme',
      icon: Sparkles,
      colors: {
        primary: '#8b5cf6',
        secondary: '#2d1b69',
        background: '#1a0f3a',
        cardBackground: '#2d1b69',
        text: '#f3f4f6',
        textSecondary: '#c4b5fd'
      }
    },
    {
      id: 'ocean',
      name: 'Ocean Blue',
      description: 'Calm ocean theme',
      icon: Droplet,
      colors: {
        primary: '#06b6d4',
        secondary: '#164e63',
        background: '#083344',
        cardBackground: '#164e63',
        text: '#f0fdfa',
        textSecondary: '#a5f3fc'
      }
    }
  ];
  
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '24px',
      '@media (max-width: 1024px)': {
        gridTemplateColumns: '1fr',
      }
    },
    
    mainSection: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${themeColors.secondary}`,
    },
    
    sidebarSection: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${themeColors.secondary}`,
      height: 'fit-content',
      position: 'sticky',
      top: '24px',
    },
    
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
      color: themeColors.text,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    
    presetGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px',
    },
    
    presetCard: {
      padding: '16px',
      borderRadius: '12px',
      border: `2px solid ${themeColors.secondary}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: themeColors.secondary,
    },
    
    selectedPreset: {
      borderColor: themeColors.primary,
      backgroundColor: `${themeColors.primary}20`,
    },
    
    presetHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    
    presetIcon: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      backgroundColor: themeColors.background,
    },
    
    presetInfo: {
      flex: 1,
    },
    
    presetName: {
      fontSize: '16px',
      fontWeight: '500',
      color: themeColors.text,
      marginBottom: '2px',
    },
    
    presetDescription: {
      fontSize: '12px',
      color: themeColors.textSecondary,
    },
    
    colorPreview: {
      display: 'flex',
      gap: '4px',
      marginTop: '8px',
    },
    
    colorDot: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: '2px solid transparent',
    },
    
    colorSection: {
      marginBottom: '32px',
    },
    
    colorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
    },
    
    colorGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    
    colorLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: themeColors.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    
    colorInputWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: themeColors.secondary,
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
    },
    
    colorSwatch: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    
    colorInput: {
      flex: 1,
      background: 'none',
      border: 'none',
      color: themeColors.text,
      fontSize: '14px',
      fontFamily: 'monospace',
      outline: 'none',
    },
    
    colorActions: {
      display: 'flex',
      gap: '8px',
    },
    
    iconButton: {
      padding: '6px',
      backgroundColor: 'transparent',
      border: 'none',
      color: themeColors.textSecondary,
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    preview: {
      backgroundColor: themeColors.secondary,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
    },
    
    previewMockup: {
      backgroundColor: customColors.background,
      borderRadius: '8px',
      padding: '16px',
      marginTop: '12px',
    },
    
    previewCard: {
      backgroundColor: customColors.cardBackground,
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
    },
    
    previewTitle: {
      color: customColors.text,
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px',
    },
    
    previewText: {
      color: customColors.textSecondary,
      fontSize: '14px',
      marginBottom: '8px',
    },
    
    previewButton: {
      backgroundColor: customColors.primary,
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px',
    },
    
    primaryButton: {
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
      flex: 1,
      justifyContent: 'center',
    },
    
    secondaryButton: {
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
      flex: 1,
      justifyContent: 'center',
    },
    
    helpText: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      marginTop: '4px',
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
  };
  
  const handleColorChange = (colorKey, value) => {
    setCustomColors(prev => ({ ...prev, [colorKey]: value }));
  };
  
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setCustomColors({
      ...customColors,
      ...preset.colors
    });
  };
  
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };
  
  const handleSaveTheme = () => {
    // This would save the theme settings
    alert('Theme settings would be saved here!');
  };
  
  const handleResetTheme = () => {
    if (confirm('Are you sure you want to reset to default theme?')) {
      const defaultPreset = themePresets.find(p => p.id === 'dark');
      handlePresetSelect(defaultPreset);
    }
  };
  
  const handleExportTheme = () => {
    const themeData = {
      name: 'Custom Theme',
      colors: customColors,
      preset: selectedPreset
    };
    const dataStr = JSON.stringify(themeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'babyresell-theme.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.mainSection}>
        <h2 style={styles.sectionTitle}>
          <Palette size={20} />
          Theme Customization
        </h2>
        
        {/* Theme Presets */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: themeColors.text }}>
            Theme Presets
          </h3>
          <div style={styles.presetGrid}>
            {themePresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <div
                  key={preset.id}
                  style={{
                    ...styles.presetCard,
                    ...(selectedPreset === preset.id ? styles.selectedPreset : {})
                  }}
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div style={styles.presetHeader}>
                    <div style={{
                      ...styles.presetIcon,
                      backgroundColor: preset.colors.primary + '20',
                      color: preset.colors.primary
                    }}>
                      <Icon size={20} />
                    </div>
                    <div style={styles.presetInfo}>
                      <div style={styles.presetName}>{preset.name}</div>
                      <div style={styles.presetDescription}>{preset.description}</div>
                    </div>
                  </div>
                  <div style={styles.colorPreview}>
                    {Object.values(preset.colors).slice(0, 6).map((color, index) => (
                      <div
                        key={index}
                        style={{
                          ...styles.colorDot,
                          backgroundColor: color,
                          border: color === '#ffffff' ? '2px solid #e5e5e5' : '2px solid transparent'
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Custom Colors */}
        <div style={styles.colorSection}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: themeColors.text }}>
            Customize Colors
          </h3>
          
          <div style={styles.warningBox}>
            <Monitor size={20} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '14px' }}>
                Live Preview Available
              </div>
              <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                Changes will be reflected in the preview panel. Save to apply changes globally.
              </div>
            </div>
          </div>
          
          <div style={styles.colorGrid}>
            {/* Primary Colors */}
            <div style={styles.colorGroup}>
              <label style={styles.colorLabel}>
                Primary Color
                <Type size={14} color={themeColors.textSecondary} />
              </label>
              <div style={styles.colorInputWrapper}>
                <input
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: customColors.primary,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    position: 'absolute',
                  }}
                />
                <div style={{
                  ...styles.colorSwatch,
                  backgroundColor: customColors.primary,
                }} />
                <input
                  type="text"
                  value={customColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  style={styles.colorInput}
                />
                <div style={styles.colorActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => copyToClipboard(customColors.primary)}
                  >
                    {copiedColor === customColors.primary ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <span style={styles.helpText}>Main brand color, used for buttons and links</span>
            </div>
            
            {/* Secondary Color */}
            <div style={styles.colorGroup}>
              <label style={styles.colorLabel}>
                Secondary Color
                <Square size={14} color={themeColors.textSecondary} />
              </label>
              <div style={styles.colorInputWrapper}>
                <input
                  type="color"
                  value={customColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: customColors.secondary,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    position: 'absolute',
                  }}
                />
                <div style={{
                  ...styles.colorSwatch,
                  backgroundColor: customColors.secondary,
                }} />
                <input
                  type="text"
                  value={customColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  style={styles.colorInput}
                />
                <div style={styles.colorActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => copyToClipboard(customColors.secondary)}
                  >
                    {copiedColor === customColors.secondary ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <span style={styles.helpText}>Used for input fields and borders</span>
            </div>
            
            {/* Background Color */}
            <div style={styles.colorGroup}>
              <label style={styles.colorLabel}>
                Background Color
                <Monitor size={14} color={themeColors.textSecondary} />
              </label>
              <div style={styles.colorInputWrapper}>
                <input
                  type="color"
                  value={customColors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: customColors.background,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    position: 'absolute',
                  }}
                />
                <div style={{
                  ...styles.colorSwatch,
                  backgroundColor: customColors.background,
                }} />
                <input
                  type="text"
                  value={customColors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  style={styles.colorInput}
                />
                <div style={styles.colorActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => copyToClipboard(customColors.background)}
                  >
                    {copiedColor === customColors.background ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <span style={styles.helpText}>Main page background color</span>
            </div>
            
            {/* Card Background */}
            <div style={styles.colorGroup}>
              <label style={styles.colorLabel}>
                Card Background
                <Square size={14} color={themeColors.textSecondary} />
              </label>
              <div style={styles.colorInputWrapper}>
                <input
                  type="color"
                  value={customColors.cardBackground}
                  onChange={(e) => handleColorChange('cardBackground', e.target.value)}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: customColors.cardBackground,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    position: 'absolute',
                  }}
                />
                <div style={{
                  ...styles.colorSwatch,
                  backgroundColor: customColors.cardBackground,
                }} />
                <input
                  type="text"
                  value={customColors.cardBackground}
                  onChange={(e) => handleColorChange('cardBackground', e.target.value)}
                  style={styles.colorInput}
                />
                <div style={styles.colorActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => copyToClipboard(customColors.cardBackground)}
                  >
                    {copiedColor === customColors.cardBackground ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <span style={styles.helpText}>Background for cards and modals</span>
            </div>
            
            {/* Text Color */}
            <div style={styles.colorGroup}>
              <label style={styles.colorLabel}>
                Text Color
                <Type size={14} color={themeColors.textSecondary} />
              </label>
              <div style={styles.colorInputWrapper}>
                <input
                  type="color"
                  value={customColors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: customColors.text,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    position: 'absolute',
                  }}
                />
                <div style={{
                  ...styles.colorSwatch,
                  backgroundColor: customColors.text,
                }} />
                <input
                  type="text"
                  value={customColors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  style={styles.colorInput}
                />
                <div style={styles.colorActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => copyToClipboard(customColors.text)}
                  >
                    {copiedColor === customColors.text ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <span style={styles.helpText}>Primary text color</span>
            </div>
            
            {/* Secondary Text */}
            <div style={styles.colorGroup}>
              <label style={styles.colorLabel}>
                Secondary Text
                <Type size={14} color={themeColors.textSecondary} />
              </label>
              <div style={styles.colorInputWrapper}>
                <input
                  type="color"
                  value={customColors.textSecondary}
                  onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: customColors.textSecondary,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    position: 'absolute',
                  }}
                />
                <div style={{
                  ...styles.colorSwatch,
                  backgroundColor: customColors.textSecondary,
                }} />
                <input
                  type="text"
                  value={customColors.textSecondary}
                  onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                  style={styles.colorInput}
                />
                <div style={styles.colorActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => copyToClipboard(customColors.textSecondary)}
                  >
                    {copiedColor === customColors.textSecondary ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <span style={styles.helpText}>Muted text and labels</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.primaryButton} onClick={handleSaveTheme}>
            <Save size={16} />
            Save Theme
          </button>
          <button style={styles.secondaryButton} onClick={handleResetTheme}>
            <RotateCcw size={16} />
            Reset to Default
          </button>
          <button style={styles.secondaryButton} onClick={handleExportTheme}>
            <Download size={16} />
            Export Theme
          </button>
        </div>
      </div>
      
      {/* Sidebar Preview */}
      <div style={styles.sidebarSection}>
        <h3 style={styles.sectionTitle}>
          <Eye size={20} />
          Live Preview
        </h3>
        
        <div style={styles.preview}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: themeColors.text }}>
            Theme Preview
          </div>
          
          <div style={styles.previewMockup}>
            <div style={styles.previewCard}>
              <div style={styles.previewTitle}>Sample Card Title</div>
              <div style={styles.previewText}>
                This is how your content will look with the selected theme colors.
              </div>
              <button style={styles.previewButton}>
                Primary Button
              </button>
            </div>
            
            <div style={styles.previewCard}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: customColors.primary,
                  borderRadius: '8px'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...styles.previewTitle, fontSize: '14px' }}>Item Name</div>
                  <div style={{ ...styles.previewText, fontSize: '12px' }}>$45.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Colors */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: themeColors.text }}>
            Status Colors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: customColors.success || '#10b981',
                borderRadius: '6px'
              }} />
              <span style={{ fontSize: '14px', color: themeColors.text }}>Success</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: customColors.warning || '#f59e0b',
                borderRadius: '6px'
              }} />
              <span style={{ fontSize: '14px', color: themeColors.text }}>Warning</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: customColors.error || '#ef4444',
                borderRadius: '6px'
              }} />
              <span style={{ fontSize: '14px', color: themeColors.text }}>Error</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: customColors.info || '#3b82f6',
                borderRadius: '6px'
              }} />
              <span style={{ fontSize: '14px', color: themeColors.text }}>Info</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTab;