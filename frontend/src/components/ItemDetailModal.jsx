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
      // To be handled later - show login prompt
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
      // To be handled later - show login prompt
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
      // Hide contact form after a delay
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
      // To be handled later - show login prompt
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
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
// Update the style objects section with these new styles:

  // Style objects
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '40px 0',
    overflowY: 'auto'
  };
  
  const modalContentStyle = {
    backgroundColor: '#fff',
    borderRadius: '32px',
    maxWidth: '1100px',
    width: '95%',
    maxHeight: '90vh',
    height: 'auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
    margin: 'auto'
  };
  
  const modalBodyStyle = {
    display: 'flex',
    flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
    height: '100%',
    maxHeight: '90vh',
    overflow: 'hidden'
  };
  
  const imageContainerStyle = {
    flex: '1',
    backgroundColor: '#000',
    position: 'relative',
    height: window.innerWidth >= 768 ? '90vh' : '400px',
    borderRadius: window.innerWidth >= 768 ? '32px 0 0 32px' : '32px 32px 0 0',
    overflow: 'hidden'
  };
  
  const detailsContainerStyle = {
    flex: '1',
    padding: '32px',
    overflowY: 'auto',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    minWidth: window.innerWidth >= 768 ? '420px' : '100%',
    borderRadius: window.innerWidth >= 768 ? '0 32px 32px 0' : '0 0 32px 32px'
  };
  
  const closeButtonStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#fff',
    color: '#111',
    border: 'none',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.2s'
  };
  
  const navigationButtonStyle = (direction) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [direction]: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#000',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 5
  });
  
  const buttonStyle = (primary = true) => ({
    backgroundColor: primary ? themeColors.primary : 'transparent',
    color: primary ? '#fff' : themeColors.text,
    border: primary ? 'none' : `1px solid ${themeColors.text}`,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '8px'
  });
  
  const tagStyle = {
    backgroundColor: themeColors.secondary,
    color: themeColors.textSecondary,
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    marginRight: '8px',
    marginBottom: '8px',
    display: 'inline-block'
  };
  
  // Thumbnail selector
  const thumbnailsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    position: 'absolute',
    bottom: '16px',
    left: '0',
    right: '0',
    zIndex: 5
  };
  
  const thumbnailStyle = (isActive) => ({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    overflow: 'hidden',
    opacity: isActive ? 1 : 0.6,
    border: isActive ? `2px solid ${themeColors.primary}` : 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });
  
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div 
        style={modalContentStyle} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        <div style={modalBodyStyle}>
          {/* Left: Image Gallery */}
          <div style={{ 
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000',
            position: 'relative',
            height: window.innerWidth >= 768 ? '100%' : '400px'
          }}>
            {/* Main Image Container */}
            <div style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src={itemImages[currentImageIndex].fullSize} 
                alt={item.title} 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            {/* Navigation Controls - Outside the image */}
            {itemImages.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Previous Button */}
                <button 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  <ChevronLeft size={24} />
                </button>
                
                {/* Thumbnails or Counter */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  justifyContent: 'center',
                  margin: '0 16px'
                }}>
                  {itemImages.length <= 5 ? (
                    // Show thumbnails for 5 or fewer images
                    itemImages.map((img, index) => (
                      <button
                        key={index}
                        style={{
                          width: '50px',
                          height: '50px',
                          border: currentImageIndex === index ? `2px solid ${themeColors.primary}` : '2px solid transparent',
                          borderRadius: '8px',
                          padding: '0',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={img.thumbnail}
                          alt={`Thumbnail ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </button>
                    ))
                  ) : (
                    // Show counter for more than 5 images
                    <div style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {currentImageIndex + 1} / {itemImages.length}
                    </div>
                  )}
                </div>
                
                {/* Next Button */}
                <button 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={handleNextImage}
                  aria-label="Next image"
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
          
          {/* Right: Item Details */}
          <div style={detailsContainerStyle}>
            <div style={{ marginBottom: 'auto' }}>
              <h2 style={{ color: themeColors.text, fontSize: '24px', marginBottom: '8px' }}>
                {item.title}
              </h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ color: themeColors.textSecondary, fontSize: '14px' }}>
                  Posted {formatDate(item.createdAt)}
                </div>
                <div style={{ color: themeColors.primary, fontSize: '24px', fontWeight: 'bold' }}>
                  ${item.price?.toFixed(2)}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>Description</h3>
                <p style={{ color: themeColors.textSecondary, lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>Details</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: '10px',
                  color: themeColors.textSecondary 
                }}>
                  <div>
                    <strong>Condition:</strong> {item.condition || 'Not specified'}
                  </div>
                  {item.brand && (
                    <div>
                      <strong>Brand:</strong> {item.brand}
                    </div>
                  )}
                  {item.category && (
                    <div>
                      <strong>Category:</strong> {item.category}
                    </div>
                  )}
                  {item.ageGroup && (
                    <div>
                      <strong>Age Group:</strong> {item.ageGroup}
                    </div>
                  )}
                  {item.color && (
                    <div>
                      <strong>Color:</strong> {item.color}
                    </div>
                  )}
                </div>
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>Tags</h3>
                  <div>
                    {item.tags.map((tag, index) => (
                      <span key={index} style={tagStyle}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Seller info */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>Seller</h3>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={item.user?.profileImage || 'https://via.placeholder.com/40?text=User'} 
                    alt={item.user?.username} 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '12px'
                    }}
                  />
                  <div>
                    <div style={{ color: themeColors.text, fontWeight: '600' }}>
                      {item.user?.username || 'Anonymous'}
                    </div>
                    {item.user?.location && (
                      <div style={{ color: themeColors.textSecondary, fontSize: '14px' }}>
                        {item.user.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact form */}
            {showContactForm && (
              <div style={{ 
                marginTop: '16px',
                padding: '16px',
                backgroundColor: themeColors.secondary,
                borderRadius: '8px'
              }}>
                {messageSent ? (
                  <div style={{ color: '#22c55e', fontWeight: '600', textAlign: 'center' }}>
                    Message sent successfully!
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage}>
                    <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>
                      Contact Seller
                    </h3>
                    {errorMessage && (
                      <div style={{ color: '#ef4444', marginBottom: '8px', fontSize: '14px' }}>
                        {errorMessage}
                      </div>
                    )}
                    <textarea
                      placeholder="What would you like to know about this item?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: themeColors.cardBackground,
                        color: themeColors.text,
                        border: 'none',
                        resize: 'vertical',
                        minHeight: '100px',
                        marginBottom: '10px'
                      }}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowContactForm(false)}
                        style={{
                          backgroundColor: 'transparent',
                          color: themeColors.textSecondary,
                          border: 'none',
                          padding: '8px 16px',
                          marginRight: '8px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        disabled={sendingMessage}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{
                          backgroundColor: themeColors.primary,
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        disabled={sendingMessage}
                      >
                        {sendingMessage ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                style={{ ...buttonStyle(true), flex: 2 }}
                onClick={handleBuyNow}
              >
                <DollarSign size={20} style={{ marginRight: '8px' }} />
                Buy Now - ${item.price?.toFixed(2)}
              </button>
              
              <button 
                style={{ ...buttonStyle(false), flex: 1 }}
                onClick={() => setShowContactForm(!showContactForm)}
              >
                <MessageCircle size={20} style={{ marginRight: '8px' }} />
                Contact
              </button>
              
              <button 
                style={{
                  ...buttonStyle(false),
                  flex: 'none',
                  width: '50px',
                  padding: '0'
                }}
                onClick={handleSave}
                aria-label={saved ? 'Unsave item' : 'Save item'}
              >
                <Heart 
                  size={20} 
                  fill={saved ? themeColors.primary : 'none'} 
                  color={saved ? themeColors.primary : themeColors.text} 
                />
              </button>
              
              <button 
                style={{
                  ...buttonStyle(false),
                  flex: 'none',
                  width: '50px',
                  padding: '0'
                }}
                onClick={handleShare}
                aria-label="Share item"
              >
                <Share2 size={20} color={themeColors.text} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;