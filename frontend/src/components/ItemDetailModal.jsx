import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, DollarSign, AlertCircle } from 'lucide-react';
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Added for login prompt
  const [loginAction, setLoginAction] = useState(''); // Added to track which action needs login
  
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
      setLoginAction('save');
      setShowLoginPrompt(true);
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
      setLoginAction('message');
      setShowLoginPrompt(true);
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
      setLoginAction('purchase');
      setShowLoginPrompt(true);
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
    padding: window.innerWidth < 768 ? '0' : '40px 0',
    overflowY: 'auto'
  };
  
  const modalContentStyle = {
    backgroundColor: '#fff',
    borderRadius: window.innerWidth < 768 ? '0' : '32px',
    maxWidth: '1100px',
    width: window.innerWidth < 768 ? '100%' : '95%',
    maxHeight: window.innerWidth < 768 ? '100vh' : '90vh',
    height: window.innerWidth < 768 ? '100vh' : 'auto',
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
    maxHeight: window.innerWidth < 768 ? '100vh' : '90vh',
    overflow: 'hidden'
  };
  
  const imageContainerStyle = {
    flex: '1',
    backgroundColor: '#000',
    position: 'relative',
    height: window.innerWidth >= 768 ? '90vh' : '50vh',
    borderRadius: window.innerWidth >= 768 ? '32px 0 0 32px' : '0',
    overflow: 'hidden'
  };
  
  const detailsContainerStyle = {
    flex: '1',
    padding: window.innerWidth < 768 ? '24px' : '32px',
    overflowY: 'auto',
    maxHeight: window.innerWidth < 768 ? '50vh' : '90vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    minWidth: window.innerWidth >= 768 ? '420px' : '100%',
    borderRadius: window.innerWidth >= 768 ? '0 32px 32px 0' : '0'
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
  
  // Update these style objects
  const buttonStyle = (primary = true) => ({
    backgroundColor: primary ? '#e60023' : '#efefef',
    color: primary ? '#fff' : '#111',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    height: '48px'
  });
  
  const tagStyle = {
    backgroundColor: '#efefef',
    color: '#111',
    padding: '8px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    marginRight: '8px',
    marginBottom: '8px',
    display: 'inline-block',
    fontWeight: '500'
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

  // Login prompt styles
  const loginPromptStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    zIndex: 1002,
    maxWidth: '90%',
    width: '400px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)'
  };

  const loginPromptOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1001
  };
  
  return (
    <>
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
            <div style={imageContainerStyle}>
              {/* Main Image Container */}
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000'
              }}>
                <img 
                  src={itemImages[currentImageIndex].fullSize} 
                  alt={item.title} 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain' // Changed from 'cover' to prevent cropping
                  }}
                />
                
                {/* Condition Tag - Pinterest Style (Bottom Left) */}
                {item.condition && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    zIndex: 6
                  }}>
                    {item.condition}
                  </div>
                )}
                
                {/* Navigation Arrows - Pinterest Style */}
                {itemImages.length > 1 && (
                  <>
                    <button 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '16px',
                        transform: 'translateY(-50%)',
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
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.2s',
                        opacity: 0.9
                      }}
                      onClick={handlePrevImage}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <button 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '16px',
                        transform: 'translateY(-50%)',
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
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.2s',
                        opacity: 0.9
                      }}
                      onClick={handleNextImage}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* Image dots indicator - Pinterest style */}
                {itemImages.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '6px'
                  }}>
                    {itemImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: index === currentImageIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          padding: 0
                        }}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right: Item Details */}
            <div style={detailsContainerStyle}>
              <div style={{ marginBottom: 'auto' }}>
                {/* Price and Title Section */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    color: '#e60023', 
                    fontSize: '36px', 
                    fontWeight: '700',
                    marginBottom: '8px'
                  }}>
                    ${item.price?.toFixed(2)}
                  </div>
                  <h1 style={{ 
                    color: '#111', 
                    fontSize: '20px', 
                    fontWeight: '600',
                    lineHeight: '1.4'
                  }}>
                    {item.title}
                  </h1>
                </div>

                {/* Action buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '24px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid #efefef'
                }}>
                  <button 
                    style={{ ...buttonStyle(true), flex: 1 }}
                    onClick={handleBuyNow}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ad081b'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e60023'}
                  >
                    Buy Now
                  </button>
                  
                  <button 
                    style={{
                      ...buttonStyle(false),
                      width: '48px',
                      padding: '0'
                    }}
                    onClick={handleSave}
                    aria-label={saved ? 'Unsave item' : 'Save item'}
                  >
                    <Heart 
                      size={20} 
                      fill={saved ? '#e60023' : 'none'} 
                      color={saved ? '#e60023' : '#111'} 
                    />
                  </button>
                  
                  <button 
                    style={{
                      ...buttonStyle(false),
                      width: '48px',
                      padding: '0'
                    }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        setLoginAction('message');
                        setShowLoginPrompt(true);
                      } else {
                        setShowContactForm(!showContactForm);
                      }
                    }}
                  >
                    <MessageCircle size={20} color="#111" />
                  </button>
                  
                  <button 
                    style={{
                      ...buttonStyle(false),
                      width: '48px',
                      padding: '0'
                    }}
                    onClick={handleShare}
                    aria-label="Share item"
                  >
                    <Share2 size={20} color="#111" />
                  </button>
                </div>

                {/* Seller info - Pinterest style */}
                <div style={{ 
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={item.user?.profileImage || 'https://via.placeholder.com/48?text=User'} 
                      alt={item.user?.username} 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '12px'
                      }}
                    />
                    <div>
                      <div style={{ color: '#111', fontWeight: '600', fontSize: '16px' }}>
                        {item.user?.username || 'Anonymous'}
                      </div>
                      {item.user?.location && (
                        <div style={{ color: '#767676', fontSize: '14px' }}>
                          {item.user.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    style={{
                      backgroundColor: '#efefef',
                      color: '#111',
                      border: 'none',
                      borderRadius: '24px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => console.log('Follow user')}
                  >
                    Follow
                  </button>
                </div>

                {/* Posted date */}
                <div style={{ 
                  color: '#767676', 
                  fontSize: '14px',
                  marginBottom: '24px'
                }}>
                  Posted {formatDate(item.createdAt)}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: '#111', lineHeight: '1.6', fontSize: '16px' }}>
                    {item.description}
                  </p>
                </div>
                
                {/* Details Grid */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#111', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Details
                  </h3>
                  <div style={{ 
                    backgroundColor: '#f8f8f8',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    {item.brand && (
                      <div style={{ color: '#111', fontSize: '14px' }}>
                        <span style={{ color: '#767676' }}>Brand:</span> {item.brand}
                      </div>
                    )}
                    {item.category && (
                      <div style={{ color: '#111', fontSize: '14px' }}>
                        <span style={{ color: '#767676' }}>Category:</span> {item.category}
                      </div>
                    )}
                    {item.ageGroup && (
                      <div style={{ color: '#111', fontSize: '14px' }}>
                        <span style={{ color: '#767676' }}>Age:</span> {item.ageGroup}
                      </div>
                    )}
                    {item.color && (
                      <div style={{ color: '#111', fontSize: '14px' }}>
                        <span style={{ color: '#767676' }}>Color:</span> {item.color}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {item.tags.map((tag, index) => (
                        <span key={index} style={tagStyle}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contact form - Pinterest style */}
              {showContactForm && (
                <div style={{ 
                  marginTop: '16px',
                  padding: '20px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '16px'
                }}>
                  {messageSent ? (
                    <div style={{ 
                      color: '#0a7955', 
                      fontWeight: '600', 
                      textAlign: 'center',
                      padding: '20px'
                    }}>
                      ✓ Message sent successfully!
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage}>
                      <h3 style={{ color: '#111', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                        Message Seller
                      </h3>
                      {errorMessage && (
                        <div style={{ 
                          color: '#cc0000', 
                          marginBottom: '12px', 
                          fontSize: '14px',
                          padding: '8px 12px',
                          backgroundColor: '#fee',
                          borderRadius: '8px'
                        }}>
                          {errorMessage}
                        </div>
                      )}
                      <textarea
                        placeholder="Hi! Is this item still available?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          backgroundColor: '#fff',
                          color: '#111',
                          border: '1px solid #ddd',
                          resize: 'vertical',
                          minHeight: '100px',
                          marginBottom: '12px',
                          fontSize: '14px'
                        }}
                        required
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => setShowContactForm(false)}
                          style={{
                            backgroundColor: '#efefef',
                            color: '#111',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                          disabled={sendingMessage}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          style={{
                            backgroundColor: '#e60023',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                          disabled={sendingMessage}
                        >
                          {sendingMessage ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <>
          <div style={loginPromptOverlayStyle} onClick={() => setShowLoginPrompt(false)} />
          <div style={loginPromptStyle}>
            <AlertCircle size={48} color="#e60023" style={{ marginBottom: '16px' }} />
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#111'
            }}>
              Login Required
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#767676', 
              marginBottom: '24px',
              lineHeight: '1.4'
            }}>
              {loginAction === 'purchase' && 'Please log in to purchase items on BabyResell'}
              {loginAction === 'save' && 'Please log in to save items to your collection'}
              {loginAction === 'message' && 'Please log in to message sellers'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                style={{
                  backgroundColor: '#e60023',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '120px'
                }}
                onClick={() => window.location.href = '/login'}
              >
                Log In
              </button>
              <button 
                style={{
                  backgroundColor: '#efefef',
                  color: '#111',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '120px'
                }}
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancel
              </button>
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: '#767676', 
              marginTop: '16px'
            }}>
              Don't have an account?{' '}
              <a 
                href="/register" 
                style={{ 
                  color: '#e60023', 
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Sign up
              </a>
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default ItemDetailModal;