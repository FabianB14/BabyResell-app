import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  X, 
  Save, 
  RefreshCw, 
  Eye, 
  Copy, 
  Palette,
  Wand2,
  Download
} from 'lucide-react';

const ThemeCreatorModal = ({ isOpen, onClose, onSave }) => {
  const { themeColors, predefinedThemes } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [themeType, setThemeType] = useState('custom');
  const [colors, setColors] = useState({
    primary: '#e60023',
    secondary: '#f3f4f6',
    accent: '#e2336b',
    background: '#ffffff',
    cardBackground: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280'
  });
  const [saving, setSaving] = useState(false);

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleColorChange = (colorKey, value) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const handlePresetLoad = (presetName) => {
    const preset = predefinedThemes[presetName];
    if (preset) {
      setColors(preset.colors);
      setDisplayName(preset.displayName);
      setDescription(`Theme based on ${preset.displayName}`);
    }
  };

  const handleSave = async () => {
    if (!themeName.trim() || !displayName.trim()) {
      alert('Please fill in theme name and display name');
      return;
    }

    setSaving(true);
    try {
      const themeData = {
        name: themeName.toLowerCase().replace(/\s+/g, '-'),
        displayName: displayName.trim(),
        description: description.trim(),
        colors,
        type: themeType,
        isCustom: true
      };

      await onSave(themeData);
      
      // Reset form
      setThemeName('');
      setDisplayName('');
      setDescription('');
      setColors({
        primary: '#e60023',
        secondary: '#f3f4f6',
        accent: '#e2336b',
        background: '#ffffff',
        cardBackground: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280'
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Failed to save theme. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const exportTheme = () => {
    const themeData = {
      name: themeName || 'custom-theme',
      displayName: displayName || 'Custom Theme',
      description,
      colors,
      type: themeType
    };
    
    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${themeName || 'custom-theme'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : '24px',
      zIndex: 1000,
    },

    modal: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '16px',
      maxWidth: isMobile ? '100%' : '800px',
      width: '100%',
      maxHeight: isMobile ? '100%' : '90vh',
      overflow: 'auto',
      border: `1px solid ${themeColors.secondary}`,
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '16px' : '24px',
      borderBottom: `1px solid ${themeColors.secondary}`,
    },

    title: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: 'bold',
      color: themeColors.text,
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
      color: themeColors.textSecondary,
    },

    content: {
      padding: isMobile ? '16px' : '24px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
      gap: isMobile ? '24px' : '32px',
    },

    formSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },

    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },

    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: themeColors.text,
    },

    input: {
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      backgroundColor: themeColors.secondary,
      color: themeColors.text,
      fontSize: '14px',
    },

    textarea: {
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      backgroundColor: themeColors.secondary,
      color: themeColors.text,
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
    },

    select: {
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      backgroundColor: themeColors.secondary,
      color: themeColors.text,
      fontSize: '14px',
      cursor: 'pointer',
    },

    colorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },

    colorInput: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },

    colorPickerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    colorPicker: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
    },

    colorValue: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '6px',
      border: `1px solid ${themeColors.secondary}`,
      backgroundColor: themeColors.secondary,
      color: themeColors.text,
      fontSize: '12px',
      fontFamily: 'monospace',
    },

    presetSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },

    presetButton: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: `1px solid ${themeColors.secondary}`,
      backgroundColor: 'transparent',
      color: themeColors.text,
      cursor: 'pointer',
      fontSize: '12px',
      textAlign: 'left',
      transition: 'all 0.2s ease',
    },

    previewSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      order: isMobile ? -1 : 1,
    },

    preview: {
      padding: '16px',
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      backgroundColor: colors.background,
      color: colors.text,
    },

    previewCard: {
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: colors.cardBackground,
      border: `1px solid ${colors.secondary}`,
      marginBottom: '12px',
    },

    previewButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      backgroundColor: colors.primary,
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
    },

    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '16px' : '24px',
      borderTop: `1px solid ${themeColors.secondary}`,
      gap: '12px',
      flexDirection: isMobile ? 'column' : 'row',
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
      minWidth: isMobile ? '100%' : 'auto',
      justifyContent: 'center',
    },

    primaryButton: {
      backgroundColor: themeColors.primary,
      color: 'white',
    },

    secondaryButton: {
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Custom Theme</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.formSection}>
            {/* Basic Information */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Theme Name *</label>
              <input
                type="text"
                style={styles.input}
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g., my-custom-theme"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Display Name *</label>
              <input
                type="text"
                style={styles.input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., My Custom Theme"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your theme..."
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Theme Type</label>
              <select
                style={styles.select}
                value={themeType}
                onChange={(e) => setThemeType(e.target.value)}
              >
                <option value="custom">Custom</option>
                <option value="seasonal">Seasonal</option>
                <option value="holiday">Holiday</option>
                <option value="brand">Brand</option>
              </select>
            </div>

            {/* Color Palette */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Color Palette</label>
              <div style={styles.colorGrid}>
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} style={styles.colorInput}>
                    <label style={{ ...styles.label, fontSize: '12px', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <div style={styles.colorPickerContainer}>
                      <input
                        type="color"
                        style={styles.colorPicker}
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                      />
                      <input
                        type="text"
                        style={styles.colorValue}
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                      />
                      <button
                        style={styles.closeButton}
                        onClick={() => copyToClipboard(value)}
                        title="Copy color"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preset Templates */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Load from Preset</label>
              <div style={styles.presetSection}>
                {Object.entries(predefinedThemes).map(([key, preset]) => (
                  <button
                    key={key}
                    style={styles.presetButton}
                    onClick={() => handlePresetLoad(key)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          backgroundColor: preset.colors.primary
                        }}
                      />
                      {preset.displayName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div style={styles.previewSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Eye size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Live Preview
              </label>
              <div style={styles.preview}>
                <div style={styles.previewCard}>
                  <h3 style={{ margin: '0 0 8px 0', color: colors.text }}>Sample Card</h3>
                  <p style={{ margin: '0 0 12px 0', color: colors.textSecondary, fontSize: '14px' }}>
                    This is how your content will look with the selected colors.
                  </p>
                  <button style={styles.previewButton}>
                    Primary Button
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  Secondary text and labels
                </div>
              </div>
            </div>

            {/* Color Swatches */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Color Swatches</label>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {Object.entries(colors).map(([name, color]) => (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: color,
                        border: '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }}
                      onClick={() => copyToClipboard(color)}
                      title={`${name}: ${color}`}
                    />
                    <span style={{
                      fontSize: '10px',
                      color: themeColors.textSecondary,
                      textAlign: 'center'
                    }}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton, flex: isMobile ? 1 : 'none' }}
              onClick={exportTheme}
            >
              <Download size={16} />
              Export
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton, flex: isMobile ? 1 : 'none' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              style={{ ...styles.button, ...styles.primaryButton, flex: isMobile ? 1 : 'none' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <RefreshCw size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCreatorModal;