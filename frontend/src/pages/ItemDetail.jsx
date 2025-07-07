import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Share2, ChevronLeft, ChevronRight, ArrowLeft, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, messageAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import PinItem from '../components/items/PinItem';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch item details
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        
        const res = await itemsAPI.getItem(id);
        
        if (res.data.success) {
          setItem(res.data.data);
          setSimilarItems(res.data.similarItems || []);
          
          // Check if user has saved this item
          if (isAuthenticated && res.data.data.saves) {
            setSaved(res.data.data.saves.some(saveId => saveId === user?._id || saveId._id === user?._id));
          }
        } else {
          setError('Item not found');
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Unable to load item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [id, isAuthenticated, user]);

  // Handle image navigation
  const handlePrevImage = () => {
    if (!item || !item.images || item.images.length <= 1) return;
    
    setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    if (!item || !item.images || item.images.length <= 1) return;
    
    setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1));
  };

  // Handle save/unsave
  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/item/${id}` } });
      return;
    }

    try {
      if (saved) {
        await itemsAPI.unsaveItem(id);
        setSaved(false);
      } else {
        await itemsAPI.saveItem(id);
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
      navigate('/login', { state: { from: `/item/${id}` } });
      return;
    }
    
    if (!message.trim()) {
      setErrorMessage('Please enter a message.');
      return;
    }
    
    try {
      setSendingMessage(true);
      setErrorMessage('');
      
      await messageAPI.sendMessage({
        recipientId: item.user._id || item.user.id,
        content: message,
        pinId: item._id || item.id
      });
      
      setMessage('');
      setMessageSent(true);
      setTimeout(() => {
        setShowContactForm(false);
        setMessageSent(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/item/${id}` } });
      return;
    }
    
    // Navigate to checkout with item data
    navigate('/checkout', { state: { item } });
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

  // Get proper image URLs from item data
  const getItemImages = () => {
    if (!item) return [];
    
    // If images is an array
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // If images are objects with fullSize property - use fullSize for detail view
      if (typeof item.images[0] === 'object' && item.images[0].fullSize) {
        return item.images.map(img => img.fullSize); // Use fullSize for better quality in detail view
      }
      // If images are strings
      else if (typeof item.images[0] === 'string') {
        return item.images;
      }
    }
    
    // Fallback to thumbnail or single image field
    if (item.thumbnail) return [item.thumbnail];
    if (item.image) return [item.image];
    
    return [];
  };
  
  // Get thumbnail URLs for the thumbnail navigation
  const getItemThumbnails = () => {
    if (!item) return [];
    
    // If images is an array with thumbnail URLs
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      if (typeof item.images[0] === 'object' && item.images[0].thumbnail) {
        return item.images.map(img => img.thumbnail || img.fullSize);
      }
    }
    
    // Otherwise return the same as main images
    return getItemImages();
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 120px)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: themeColors.background
      }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 120px)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: themeColors.background,
        padding: '20px'
      }}>
        <div style={{ 
          backgroundColor: themeColors.cardBackground,
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: themeColors.text, marginBottom: '12px' }}>
            {error || 'Item not found'}
          </h2>
          <p style={{ color: themeColors.textSecondary, marginBottom: '20px' }}>
            We couldn't find the item you're looking for.
          </p>
          <button 
            style={{
              backgroundColor: themeColors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const itemImages = getItemImages();
  const itemThumbnails = getItemThumbnails();
  const hasImages = itemImages.length > 0;

  return (
    <div style={{ backgroundColor: themeColors.background, minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'transparent',
            color: themeColors.text,
            border: 'none',
            marginBottom: '20px',
            padding: '8px 0',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Back
        </button>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          '@media (min-width: 768px)': {
            gridTemplateColumns: '1fr 1fr'
          }
        }}>
          {/* Left: Image Gallery */}
          <div style={{
            backgroundColor: '#000',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            height: '400px',
            '@media (min-width: 768px)': {
              height: '500px'
            }
          }}>
            {hasImages ? (
              <>
                <img 
                  src={itemImages[currentImageIndex]} 
                  alt={item.title} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: themeColors.secondary,
                  color: themeColors.textSecondary,
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🍼</div>
                    <div>Image not available</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: themeColors.secondary,
                color: themeColors.textSecondary,
                fontSize: '16px',
                textAlign: 'center',
                padding: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🍼</div>
                  <div>{item.title || 'No image available'}</div>
                </div>
              </div>
            )}
            
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
            
            {/* Thumbnail navigation */}
            {itemImages.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '60px',
                left: '16px',
                right: '16px',
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 5
              }}>
                {itemThumbnails.map((image, index) => (
                  <button
                    key={index}
                    style={{
                      width: '48px',
                      height: '48px',
                      border: currentImageIndex === index ? `2px solid ${themeColors.primary}` : '2px solid transparent',
                      borderRadius: '8px',
                      padding: '0',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: themeColors.secondary
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '🍼';
                        e.target.parentElement.style.display = 'flex';
                        e.target.parentElement.style.alignItems = 'center';
                        e.target.parentElement.style.justifyContent = 'center';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Right: Item Details */}
          <div style={{
            backgroundColor: themeColors.cardBackground,
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: 'auto' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <h1 style={{ 
                  color: themeColors.text, 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  maxWidth: '70%'
                }}>
                  {item.title}
                </h1>
                <div style={{ 
                  color: themeColors.primary, 
                  fontSize: '24px', 
                  fontWeight: 'bold' 
                }}>
                  ${item.price?.toFixed(2) || '0.00'}
                </div>
              </div>
              
              <div style={{ 
                color: themeColors.textSecondary, 
                fontSize: '14px',
                marginBottom: '24px'
              }}>
                Posted {formatDate(item.createdAt)}
                {(item.location?.city || item.user?.location) && 
                  ` • ${item.location?.city || item.user?.location}`}
              </div>
              
              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ 
                  color: themeColors.text, 
                  fontSize: '18px', 
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  Description
                </h2>
                <p style={{ 
                  color: themeColors.text, 
                  lineHeight: '1.6'
                }}>
                  {item.description || 'No description provided.'}
                </p>
              </div>
              
              {/* Details */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ 
                  color: themeColors.text, 
                  fontSize: '18px', 
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  Details
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: '16px',
                  color: themeColors.text 
                }}>
                  <div>
                    <span style={{ color: themeColors.textSecondary }}>Condition:</span>
                    <div>{item.condition || 'Not specified'}</div>
                  </div>
                  {item.category && (
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Category:</span>
                      <div>{item.category}</div>
                    </div>
                  )}
                  {item.ageGroup && (
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Age Group:</span>
                      <div>{item.ageGroup}</div>
                    </div>
                  )}
                  {item.brand && (
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Brand:</span>
                      <div>{item.brand}</div>
                    </div>
                  )}
                  {item.color && (
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Color:</span>
                      <div>{item.color}</div>
                    </div>
                  )}
                  {item.size && (
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Size:</span>
                      <div>{item.size}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ 
                    color: themeColors.text, 
                    fontSize: '18px', 
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    Tags
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {item.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          backgroundColor: themeColors.secondary,
                          color: themeColors.textSecondary,
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '14px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Seller */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ 
                  color: themeColors.text, 
                  fontSize: '18px', 
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  Seller
                </h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: themeColors.secondary,
                      marginRight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      overflow: 'hidden'
                    }}
                  >
                    {item.user?.profileImage ? (
                      <img 
                        src={item.user.profileImage} 
                        alt={item.user?.username || 'Seller'} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '👤';
                        }}
                      />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div>
                    <div style={{ 
                      color: themeColors.text, 
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {item.user?.username || item.user?.firstName || 'Anonymous'}
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
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                {messageSent ? (
                  <div style={{ 
                    color: '#22c55e', 
                    fontWeight: '600', 
                    textAlign: 'center',
                    padding: '16px'
                  }}>
                    Message sent successfully!
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage}>
                    <h3 style={{ 
                      color: themeColors.text, 
                      fontSize: '16px', 
                      marginBottom: '12px' 
                    }}>
                      Contact Seller
                    </h3>
                    {errorMessage && (
                      <div style={{ 
                        color: '#ef4444', 
                        marginBottom: '12px', 
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
                        backgroundColor: themeColors.cardBackground,
                        color: themeColors.text,
                        border: 'none',
                        resize: 'vertical',
                        minHeight: '100px',
                        marginBottom: '16px'
                      }}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowContactForm(false)}
                        style={{
                          backgroundColor: 'transparent',
                          color: themeColors.textSecondary,
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
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
                          padding: '10px 20px',
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
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                style={{
                  backgroundColor: themeColors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
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
                Buy Now - ${item.price?.toFixed(2) || '0.00'}
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
                <MessageSquare size={20} style={{ marginRight: '8px' }} />
                Contact
              </button>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  style={{
                    backgroundColor: 'transparent',
                    color: themeColors.text,
                    border: `1px solid ${themeColors.text}`,
                    borderRadius: '8px',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
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
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={handleShare}
                  aria-label="Share item"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Items Section */}
        {similarItems && similarItems.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ 
              color: themeColors.text, 
              fontSize: '20px', 
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              Similar Items
            </h2>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {similarItems.map((similarItem) => (
                <div 
                  key={similarItem._id || similarItem.id}
                  style={{
                    backgroundColor: themeColors.cardBackground,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    height: '100%'
                  }}
                  onClick={() => navigate(`/item/${similarItem._id || similarItem.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'relative', height: '180px', backgroundColor: themeColors.secondary }}>
                    {(() => {
                      let imageUrl = null;
                      
                      // Check for images array with objects
                      if (similarItem.images && Array.isArray(similarItem.images) && similarItem.images.length > 0) {
                        const firstImage = similarItem.images[0];
                        imageUrl = firstImage.thumbnail || firstImage.fullSize || firstImage;
                      }
                      // Check for thumbnail field
                      else if (similarItem.thumbnail) {
                        imageUrl = similarItem.thumbnail;
                      }
                      
                      return imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={similarItem.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: (() => {
                        let hasImage = false;
                        if (similarItem.images && Array.isArray(similarItem.images) && similarItem.images.length > 0) {
                          hasImage = true;
                        } else if (similarItem.thumbnail) {
                          hasImage = true;
                        }
                        return hasImage ? 'none' : 'flex';
                      })(),
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>
                      🍼
                    </div>
                    <div style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      right: '8px', 
                      backgroundColor: themeColors.primary,
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      ${similarItem.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ 
                      color: themeColors.text, 
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {similarItem.title}
                    </h3>
                    <div style={{ 
                      color: themeColors.textSecondary,
                      fontSize: '14px'
                    }}>
                      {similarItem.condition || 'Good'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;