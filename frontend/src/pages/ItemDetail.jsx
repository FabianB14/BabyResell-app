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
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: themeColors.cardBackground,
          borderRadius: '16px',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        {/* Modal Content - Flex Container */}
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          {/* Left: Image Gallery */}
          <div style={{
            flex: '0 0 50%',
            backgroundColor: '#000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
            
            {/* Navigation arrows */}
            {itemImages.length > 1 && (
              <>
                <button 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '16px',
                    transform: 'translateY(-50%)',
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
                  }}
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '16px',
                    transform: 'translateY(-50%)',
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
                  }}
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
                
                {/* Image counter */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                >
                  {currentImageIndex + 1} / {itemImages.length}
                </div>
              </>
            )}
          </div>
          
          {/* Right: Item Details */}
          <div style={{
            flex: '0 0 50%',
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
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
                  gridTemplateColumns: 'repeat(2, 1fr)', 
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
                      <span 
                        key={index} 
                        style={{
                          backgroundColor: themeColors.secondary,
                          color: themeColors.textSecondary,
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          marginRight: '8px',
                          marginBottom: '8px',
                          display: 'inline-block'
                        }}
                      >
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
                style={{
                  backgroundColor: themeColors.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 2
                }}
                onClick={handleBuyNow}
              >
                <DollarSign size={20} style={{ marginRight: '8px' }} />
                Buy Now - ${item.price?.toFixed(2)}
              </button>
              
              <button 
                style={{
                  backgroundColor: 'transparent',
                  color: themeColors.text,
                  border: `1px solid ${themeColors.text}`,
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1
                }}
                onClick={() => setShowContactForm(!showContactForm)}
              >
                <MessageCircle size={20} style={{ marginRight: '8px' }} />
                Contact
              </button>
              
              <button 
                style={{
                  backgroundColor: 'transparent',
                  color: themeColors.text,
                  border: `1px solid ${themeColors.text}`,
                  borderRadius: '8px',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
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
                  backgroundColor: 'transparent',
                  color: themeColors.text,
                  border: `1px solid ${themeColors.text}`,
                  borderRadius: '8px',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
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