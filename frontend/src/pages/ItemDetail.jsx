import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, messageAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

const ItemDetailModal = ({ item, onClose, onPurchase }) => {
  const { themeColors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Check if item is saved by current user
  useEffect(() => {
    if (isAuthenticated && item && item.saves && user) {
      setSaved(item.saves.includes(user._id));
    }
  }, [isAuthenticated, item, user]);
  
  if (!item) return null;
  
  // Format images for gallery
  const itemImages = item.images && item.images.length > 0 
    ? item.images 
    : [{ fullSize: item.image || item.thumbnail || 'https://via.placeholder.com/600x400?text=No+Image', isPrimary: true }];
  
  // Handle image navigation
  const handlePrevImage = () => {
    if (itemImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? itemImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    if (itemImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === itemImages.length - 1 ? 0 : prev + 1));
  };
  
  // Handle save/unsave
  const handleSave = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      if (saved) {
        await itemsAPI.unsaveItem(item._id);
        setSaved(false);
      } else {
        await itemsAPI.saveItem(item._id);
        setSaved(true);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      setErrorMessage('Failed to save item. Please try again.');
    }
  };
  
  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      return;
    }
    
    if (!message.trim()) {
      setErrorMessage('Please enter a message.');
      return;
    }
    
    try {
      setSendingMessage(true);
      await messageAPI.sendMessage({
        recipientId: item.user._id,
        content: message,
        pinId: item._id
      });
      
      setMessage('');
      setMessageSent(true);
      setSendingMessage(false);
      setTimeout(() => {
        setShowContactForm(false);
        setMessageSent(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send message. Please try again.');
      setSendingMessage(false);
    }
  };
  
  // Handle buy now
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      return;
    }
    
    if (onPurchase) {
      onPurchase(item);
    }
    
    onClose();
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this item: ${item.title}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  // CSS styles as objects
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '1000px',
      height: '90vh',
      maxHeight: '600px',
      display: 'flex',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden'
    },
    closeButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 10
    },
    content: {
      display: 'flex',
      width: '100%',
      height: '100%'
    },
    imageSection: {
      width: '50%',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '20px'
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    },
    detailsSection: {
      width: '50%',
      padding: '30px',
      overflowY: 'auto',
      backgroundColor: '#ffffff'
    },
    navButton: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#333333'
    },
    price: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#e60023',
      marginBottom: '20px'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#333333'
    },
    sectionContent: {
      color: '#666666',
      lineHeight: '1.6'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      color: '#666666'
    },
    tag: {
      display: 'inline-block',
      backgroundColor: '#f0f0f0',
      color: '#666666',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      marginRight: '8px',
      marginBottom: '8px'
    },
    sellerInfo: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px'
    },
    sellerImage: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      marginRight: '12px',
      objectFit: 'cover'
    },
    buttonContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: 'auto',
      paddingTop: '20px'
    },
    primaryButton: {
      flex: 2,
      backgroundColor: '#e60023',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: '#ffffff',
      color: '#333333',
      border: '1px solid #dddddd',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconButton: {
      width: '48px',
      height: '48px',
      backgroundColor: '#ffffff',
      color: '#333333',
      border: '1px solid #dddddd',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  };
  
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button style={styles.closeButton} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        
        <div style={styles.content}>
          {/* Left: Image Gallery */}
          <div style={styles.imageSection}>
            <img 
              src={itemImages[currentImageIndex].fullSize} 
              alt={item.title} 
              style={styles.image}
            />
            
            {/* Navigation arrows */}
            {itemImages.length > 1 && (
              <>
                <button 
                  style={{ ...styles.navButton, left: '20px' }}
                  onClick={handlePrevImage}
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  style={{ ...styles.navButton, right: '20px' }}
                  onClick={handleNextImage}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          
          {/* Right: Item Details */}
          <div style={styles.detailsSection}>
            <h2 style={styles.title}>{item.title}</h2>
            <div style={styles.price}>${item.price?.toFixed(2)}</div>
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Description</h3>
              <p style={styles.sectionContent}>{item.description}</p>
            </div>
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Details</h3>
              <div style={styles.detailsGrid}>
                <div><strong>Condition:</strong> {item.condition || 'Not specified'}</div>
                {item.category && <div><strong>Category:</strong> {item.category}</div>}
                {item.brand && <div><strong>Brand:</strong> {item.brand}</div>}
                {item.ageGroup && <div><strong>Age:</strong> {item.ageGroup}</div>}
              </div>
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Tags</h3>
                <div>
                  {item.tags.map((tag, index) => (
                    <span key={index} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div style={styles.sellerInfo}>
              <img 
                src={item.user?.profileImage || 'https://via.placeholder.com/48'} 
                alt={item.user?.username} 
                style={styles.sellerImage}
              />
              <div>
                <div style={{ fontWeight: '600', color: '#333333' }}>
                  {item.user?.username || 'Anonymous'}
                </div>
                {item.user?.location && (
                  <div style={{ fontSize: '14px', color: '#666666' }}>
                    {item.user.location}
                  </div>
                )}
              </div>
            </div>
            
            <div style={styles.buttonContainer}>
              <button style={styles.primaryButton} onClick={handleBuyNow}>
                <DollarSign size={20} style={{ marginRight: '8px' }} />
                Buy Now
              </button>
              <button style={styles.secondaryButton} onClick={() => setShowContactForm(!showContactForm)}>
                <MessageCircle size={20} style={{ marginRight: '8px' }} />
                Contact
              </button>
              <button style={styles.iconButton} onClick={handleSave}>
                <Heart size={20} fill={saved ? '#e60023' : 'none'} color={saved ? '#e60023' : '#333333'} />
              </button>
              <button style={styles.iconButton} onClick={handleShare}>
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;