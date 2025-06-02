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
  
  return (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
        }}
      />
      
      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '1100px',
        height: '85vh',
        backgroundColor: themeColors.cardBackground || '#1e1e1e',
        borderRadius: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={24} />
        </button>
        
        {/* Left Side - Image */}
        <div style={{
          width: '55%',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0
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
          
          {/* Image Navigation */}
          {itemImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft size={24} color="#000" />
              </button>
              
              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={24} color="#000" />
              </button>
              
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                {currentImageIndex + 1} / {itemImages.length}
              </div>
            </>
          )}
        </div>
        
        {/* Right Side - Details */}
        <div style={{
          width: '45%',
          padding: '32px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Title and Price */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: themeColors.text || '#ffffff',
            marginBottom: '8px'
          }}>
            {item.title}
          </h1>
          
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: themeColors.primary || '#e60023',
            marginBottom: '16px'
          }}>
            ${item.price?.toFixed(2)}
          </div>
          
          <div style={{
            fontSize: '14px',
            color: themeColors.textSecondary || '#999',
            marginBottom: '24px'
          }}>
            Posted {formatDate(item.createdAt)}
          </div>
          
          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: themeColors.text || '#ffffff',
              marginBottom: '12px'
            }}>
              Description
            </h3>
            <p style={{
              color: themeColors.textSecondary || '#ccc',
              lineHeight: '1.6'
            }}>
              {item.description}
            </p>
          </div>
          
          {/* Details Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: themeColors.text || '#ffffff',
              marginBottom: '12px'
            }}>
              Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              color: themeColors.textSecondary || '#ccc'
            }}>
              <div>
                <strong>Condition:</strong> {item.condition || 'Not specified'}
              </div>
              {item.category && (
                <div>
                  <strong>Category:</strong> {item.category}
                </div>
              )}
              {item.brand && (
                <div>
                  <strong>Brand:</strong> {item.brand}
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
              {item.location && (
                <div>
                  <strong>Location:</strong> {item.location}
                </div>
              )}
            </div>
          </div>
          
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: themeColors.text || '#ffffff',
                marginBottom: '12px'
              }}>
                Tags
              </h3>
              <div>
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      backgroundColor: themeColors.secondary || '#333',
                      color: themeColors.textSecondary || '#ccc',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      marginRight: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Seller Info */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            marginTop: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: themeColors.text || '#ffffff',
              marginBottom: '12px'
            }}>
              Seller
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <img
                src={item.user?.profileImage || 'https://via.placeholder.com/48'}
                alt={item.user?.username}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  marginRight: '12px',
                  objectFit: 'cover'
                }}
              />
              <div>
                <div style={{
                  fontWeight: '600',
                  color: themeColors.text || '#ffffff'
                }}>
                  {item.user?.username || 'Anonymous'}
                </div>
                {item.user?.location && (
                  <div style={{
                    fontSize: '14px',
                    color: themeColors.textSecondary || '#999'
                  }}>
                    {item.user.location}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleBuyNow}
                style={{
                  flex: '1 1 60%',
                  minWidth: '150px',
                  padding: '14px 20px',
                  backgroundColor: themeColors.primary || '#e60023',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarSign size={20} style={{ marginRight: '8px' }} />
                Buy Now
              </button>
              
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                style={{
                  flex: '1 1 30%',
                  minWidth: '100px',
                  padding: '14px 20px',
                  backgroundColor: 'transparent',
                  color: themeColors.text || '#ffffff',
                  border: `1px solid ${themeColors.text || '#ffffff'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={20} style={{ marginRight: '8px' }} />
                Contact
              </button>
              
              <button
                onClick={handleSave}
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'transparent',
                  color: saved ? (themeColors.primary || '#e60023') : (themeColors.text || '#ffffff'),
                  border: `1px solid ${themeColors.text || '#ffffff'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Heart
                  size={20}
                  fill={saved ? (themeColors.primary || '#e60023') : 'none'}
                />
              </button>
              
              <button
                onClick={handleShare}
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'transparent',
                  color: themeColors.text || '#ffffff',
                  border: `1px solid ${themeColors.text || '#ffffff'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
          
          {/* Contact Form */}
          {showContactForm && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: themeColors.secondary || '#333',
              borderRadius: '8px'
            }}>
              {messageSent ? (
                <div style={{
                  color: '#22c55e',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Message sent successfully!
                </div>
              ) : (
                <form onSubmit={handleSendMessage}>
                  <h3 style={{
                    color: themeColors.text || '#ffffff',
                    fontSize: '16px',
                    marginBottom: '8px'
                  }}>
                    Contact Seller
                  </h3>
                  {errorMessage && (
                    <div style={{
                      color: '#ef4444',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
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
                      backgroundColor: themeColors.cardBackground || '#1e1e1e',
                      color: themeColors.text || '#ffffff',
                      border: 'none',
                      resize: 'vertical',
                      minHeight: '100px',
                      marginBottom: '10px'
                    }}
                    required
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: themeColors.textSecondary || '#999',
                        border: 'none',
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
                        padding: '8px 16px',
                        backgroundColor: themeColors.primary || '#e60023',
                        color: 'white',
                        border: 'none',
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
        </div>
      </div>
    </>
  );
};

export default ItemDetailModal;