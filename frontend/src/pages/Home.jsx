import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, DollarSign } from 'lucide-react';

// Mock theme colors (dark theme)
const themeColors = {
  primary: '#e60023',
  secondary: '#2e2e2e',
  accent: '#e2336b',
  background: '#121212',
  cardBackground: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0'
};

// Item Detail Modal Component
const ItemDetailModal = ({ item, onClose, onPurchase }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  
  if (!item) return null;
  
  const itemImages = item.images && item.images.length > 0 
    ? item.images 
    : [{ fullSize: item.image || item.thumbnail || 'https://via.placeholder.com/600x400?text=No+Image', isPrimary: true }];
  
  const handlePrevImage = () => {
    if (itemImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? itemImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    if (itemImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev === itemImages.length - 1 ? 0 : prev + 1));
  };
  
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  };
  
  const modalContentStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '16px',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
    position: 'relative',
    zIndex: 10000
  };
  
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
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
        >
          <X size={24} />
        </button>
        
        {/* Image Section */}
        <div style={{
          flex: '1',
          backgroundColor: '#000',
          position: 'relative',
          minHeight: '300px'
        }}>
          <img 
            src={itemImages[currentImageIndex].fullSize} 
            alt={item.title} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          
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
                  cursor: 'pointer'
                }}
                onClick={handlePrevImage}
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
                  cursor: 'pointer'
                }}
                onClick={handleNextImage}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
        
        {/* Details Section */}
        <div style={{
          flex: '1',
          padding: '24px',
          overflowY: 'auto',
          maxHeight: '100%'
        }}>
          <h2 style={{ color: themeColors.text, fontSize: '24px', marginBottom: '8px' }}>
            {item.title}
          </h2>
          
          <div style={{ color: themeColors.primary, fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            ${item.price?.toFixed(2)}
          </div>
          
          <p style={{ color: themeColors.textSecondary, marginBottom: '20px', lineHeight: '1.6' }}>
            {item.description || 'No description available'}
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: themeColors.text, marginBottom: '8px' }}>
              <strong>Condition:</strong> {item.condition || 'Not specified'}
            </div>
            {item.category && (
              <div style={{ color: themeColors.text, marginBottom: '8px' }}>
                <strong>Category:</strong> {item.category}
              </div>
            )}
            {item.brand && (
              <div style={{ color: themeColors.text, marginBottom: '8px' }}>
                <strong>Brand:</strong> {item.brand}
              </div>
            )}
          </div>
          
          {/* Seller info */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>Seller</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={item.user?.profileImage || 'https://via.placeholder.com/40?text=User'} 
                alt={item.user?.username} 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginRight: '12px'
                }}
              />
              <div>
                <div style={{ color: themeColors.text }}>
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
          
          {showContactForm && (
            <div style={{ 
              marginTop: '16px',
              padding: '16px',
              backgroundColor: themeColors.secondary,
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
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
                  minHeight: '100px'
                }}
              />
              <button 
                style={{
                  marginTop: '8px',
                  backgroundColor: themeColors.primary,
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  alert('Message sent!');
                  setShowContactForm(false);
                  setMessage('');
                }}
              >
                Send Message
              </button>
            </div>
          )}
          
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              style={{
                backgroundColor: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => {
                alert(`Purchase initiated for: ${item.title}`);
                onPurchase && onPurchase(item);
              }}
            >
              <DollarSign size={20} style={{ marginRight: '8px' }} />
              Buy Now
            </button>
            
            <button 
              style={{
                backgroundColor: 'transparent',
                color: themeColors.text,
                border: `1px solid ${themeColors.text}`,
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                flex: 1
              }}
              onClick={() => setShowContactForm(!showContactForm)}
            >
              <MessageCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Contact
            </button>
            
            <button 
              style={{
                backgroundColor: 'transparent',
                color: saved ? themeColors.primary : themeColors.text,
                border: `1px solid ${saved ? themeColors.primary : themeColors.text}`,
                borderRadius: '8px',
                width: '50px',
                cursor: 'pointer'
              }}
              onClick={() => setSaved(!saved)}
            >
              <Heart size={20} fill={saved ? themeColors.primary : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Home Component
const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: ''
  });

  // Generate sample items
  useEffect(() => {
    const generateSampleItems = () => {
      const sampleItems = [];
      const categories = ['Clothes & Shoes', 'Toys & Games', 'Feeding', 'Nursery', 'Strollers & Car Seats'];
      const conditions = ['New', 'Like New', 'Good', 'Fair'];
      
      for (let i = 1; i <= 20; i++) {
        sampleItems.push({
          _id: `item-${i}`,
          title: `Baby Item ${i}`,
          price: Math.floor(Math.random() * 100) + 10,
          description: `This is a great baby item in excellent condition. Perfect for your little one!`,
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          brand: ['Fisher-Price', 'Graco', 'Chicco', 'BabyBjörn'][Math.floor(Math.random() * 4)],
          thumbnail: `https://picsum.photos/300/${250 + Math.floor(Math.random() * 150)}?random=${i}`,
          image: `https://picsum.photos/600/400?random=${i}`,
          images: [
            { 
              fullSize: `https://picsum.photos/800/600?random=${i}`, 
              thumbnail: `https://picsum.photos/300/300?random=${i}`,
              isPrimary: true 
            },
            { 
              fullSize: `https://picsum.photos/800/600?random=${i+100}`, 
              thumbnail: `https://picsum.photos/300/300?random=${i+100}`,
              isPrimary: false 
            }
          ],
          user: {
            _id: `user-${i}`,
            username: `parent${i}`,
            profileImage: `https://i.pravatar.cc/40?img=${i}`,
            location: 'Seattle, WA'
          },
          height: 250 + Math.floor(Math.random() * 150)
        });
      }
      setItems(sampleItems);
      setLoading(false);
    };

    setTimeout(generateSampleItems, 1000);
  }, []);

  const handleItemClick = (item) => {
    console.log('Item clicked:', item);
    setSelectedItem(item);
  };

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.minPrice && item.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && item.price > parseFloat(filters.maxPrice)) return false;
    return true;
  });

  // Group items into columns
  const columns = window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 4;
  const itemsInColumns = Array.from({ length: columns }, () => []);
  filteredItems.forEach((item, index) => {
    itemsInColumns[index % columns].push(item);
  });

  return (
    <div style={{ backgroundColor: themeColors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '20px' }}>
        {/* Filters */}
        <div style={{
          backgroundColor: themeColors.cardBackground,
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: themeColors.secondary,
              color: themeColors.text
            }}
          />
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: themeColors.secondary,
              color: themeColors.text
            }}
          >
            <option value="">All Categories</option>
            <option value="Clothes & Shoes">Clothes & Shoes</option>
            <option value="Toys & Games">Toys & Games</option>
            <option value="Feeding">Feeding</option>
            <option value="Nursery">Nursery</option>
            <option value="Strollers & Car Seats">Strollers & Car Seats</option>
          </select>
          
          <select
            value={filters.condition}
            onChange={(e) => setFilters({...filters, condition: e.target.value})}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: themeColors.secondary,
              color: themeColors.text
            }}
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="loader">Loading...</div>
          </div>
        )}

        {/* Items Grid */}
        {!loading && filteredItems.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridGap: '16px'
          }}>
            {itemsInColumns.map((column, columnIndex) => (
              <div key={columnIndex}>
                {column.map(item => (
                  <div 
                    key={item._id}
                    style={{
                      marginBottom: '16px',
                      backgroundColor: themeColors.cardBackground,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Price Tag */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: themeColors.primary,
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      pointerEvents: 'none'
                    }}>
                      ${item.price.toFixed(2)}
                    </div>
                    
                    {/* Image */}
                    <img 
                      src={item.thumbnail}
                      alt={item.title} 
                      style={{
                        width: '100%',
                        height: `${item.height}px`,
                        objectFit: 'cover',
                        pointerEvents: 'none'
                      }}
                    />
                    
                    {/* Condition Tag */}
                    <div style={{
                      position: 'absolute',
                      bottom: '60px',
                      left: '12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}>
                      {item.condition}
                    </div>
                    
                    {/* Item Details */}
                    <div style={{
                      padding: '12px',
                      pointerEvents: 'none'
                    }}>
                      <h3 style={{ 
                        fontSize: '16px', 
                        marginBottom: '4px', 
                        fontWeight: '600',
                        color: themeColors.text
                      }}>
                        {item.title}
                      </h3>
                      <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                        by {item.user.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: themeColors.textSecondary
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍼</div>
            <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>No items found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPurchase={(item) => {
            console.log('Purchase:', item);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;