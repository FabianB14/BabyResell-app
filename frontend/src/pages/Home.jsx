import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import ItemDetailModal from '../components/ItemDetailModal';

const Home = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated } = useAuth();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch baby items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        // Real API call
        const res = await itemsAPI.getAllItems({ 
          limit: 12,
          sort: '-createdAt'
        });
        
        if (res.data.success) {
          setItems(res.data.data);
        } else {
          // Fall back to sample data if API request was successful but returned no data
          setItems(generateSampleItems());
        }
      } catch (err) {
        console.error('Failed to fetch items:', err);
        // Fall back to sample data if API request failed
        setItems(generateSampleItems());
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  // Generate sample items if API is not available
  const generateSampleItems = () => {
    return [
      {
        id: 1,
        title: 'Baby Carrier - Like New',
        price: 45.00,
        image: 'https://via.placeholder.com/300x400?text=Baby+Carrier',
        height: 400,
        description: 'High-quality baby carrier in excellent condition. Used only a few times.',
        condition: 'Like New',
        category: 'Carriers & Wraps',
        ageGroup: 'Infant (3-12 months)',
        brand: 'BabyBjörn',
        color: 'Grey',
        tags: ['carrier', 'baby', 'bjorn'],
        user: {
          username: 'parent123',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Seattle, WA'
        }
      },
      {
        id: 2,
        title: 'Toddler Clothing Bundle',
        price: 25.00,
        image: 'https://via.placeholder.com/300x250?text=Clothing+Bundle',
        height: 250,
        description: 'Collection of gently used toddler clothes. Multiple sizes and styles included.',
        condition: 'Good',
        category: 'Clothes & Shoes',
        ageGroup: 'Toddler (1-3 years)',
        brand: 'Various',
        color: 'Multi',
        tags: ['clothes', 'toddler', 'bundle'],
        user: {
          username: 'parent456',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Portland, OR'
        }
      },
      {
        id: 3,
        title: 'Wooden Crib - Excellent Condition',
        price: 150.00,
        image: 'https://via.placeholder.com/300x350?text=Wooden+Crib',
        height: 350,
        description: 'Beautiful wooden crib with mattress included. Adjustable height settings.',
        condition: 'Excellent',
        category: 'Nursery',
        ageGroup: 'Newborn (0-3 months)',
        brand: 'Pottery Barn Kids',
        color: 'Natural Wood',
        tags: ['crib', 'bed', 'nursery', 'wood'],
        user: {
          username: 'parent789',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Bellevue, WA'
        }
      },
      // More sample items...
      {
        id: 4,
        title: 'Baby Toys Set',
        price: 20.00,
        image: 'https://via.placeholder.com/300x280?text=Baby+Toys',
        height: 280,
        description: 'Collection of 10 educational toys for babies 6-12 months. All in great condition.',
        condition: 'Good',
        category: 'Toys & Games',
        ageGroup: 'Infant (3-12 months)',
        brand: 'Various',
        color: 'Multi',
        tags: ['toys', 'educational', 'bundle'],
        user: {
          username: 'toystore',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Tacoma, WA'
        }
      },
      {
        id: 5,
        title: 'Stroller - High Quality',
        price: 85.00,
        image: 'https://via.placeholder.com/300x320?text=Stroller',
        height: 320,
        description: 'Compact, lightweight stroller that folds easily for travel. Good condition with minor wear.',
        condition: 'Good',
        category: 'Strollers & Car Seats',
        ageGroup: 'All Ages',
        brand: 'Chicco',
        color: 'Black',
        tags: ['stroller', 'travel', 'portable'],
        user: {
          username: 'strollerseller',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Seattle, WA'
        }
      },
      {
        id: 6,
        title: 'Baby Monitor',
        price: 35.00,
        image: 'https://via.placeholder.com/300x260?text=Baby+Monitor',
        height: 260,
        description: 'Digital baby monitor with night vision and temperature monitoring. Like new condition.',
        condition: 'Like New',
        category: 'Health & Safety',
        ageGroup: 'Newborn (0-3 months)',
        brand: 'Infant Optics',
        color: 'White',
        tags: ['monitor', 'safety', 'digital'],
        user: {
          username: 'techparent',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Redmond, WA'
        }
      },
      {
        id: 7,
        title: 'Nursing Pillow',
        price: 15.00,
        image: 'https://via.placeholder.com/300x220?text=Nursing+Pillow',
        height: 220,
        description: 'Comfortable nursing pillow with removable, washable cover. Barely used.',
        condition: 'Like New',
        category: 'Feeding',
        ageGroup: 'Newborn (0-3 months)',
        brand: 'Boppy',
        color: 'Grey',
        tags: ['nursing', 'feeding', 'pillow'],
        user: {
          username: 'newmom',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Kirkland, WA'
        }
      },
      {
        id: 8,
        title: 'Diaper Bag',
        price: 30.00,
        image: 'https://via.placeholder.com/300x300?text=Diaper+Bag',
        height: 300,
        description: 'Stylish diaper bag with multiple compartments. Looks like a regular handbag!',
        condition: 'Good',
        category: 'Diapering',
        ageGroup: 'All Ages',
        brand: 'Skip Hop',
        color: 'Black',
        tags: ['diaper', 'bag', 'storage'],
        user: {
          username: 'stylishmom',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Seattle, WA'
        }
      },
      {
        id: 9,
        title: 'Baby Bath Set',
        price: 18.00,
        image: 'https://via.placeholder.com/300x270?text=Bath+Set',
        height: 270,
        description: 'Complete bath set including infant tub, rinser, and bath toys.',
        condition: 'Good',
        category: 'Bathing & Skincare',
        ageGroup: 'Newborn (0-3 months)',
        brand: 'The First Years',
        color: 'Blue',
        tags: ['bath', 'tub', 'skincare'],
        user: {
          username: 'cleanbaby',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Everett, WA'
        }
      },
      {
        id: 10,
        title: 'Highchair',
        price: 55.00,
        image: 'https://via.placeholder.com/300x340?text=Highchair',
        height: 340,
        description: 'Adjustable highchair with removable tray and machine-washable seat pad.',
        condition: 'Good',
        category: 'Feeding',
        ageGroup: 'Infant (3-12 months)',
        brand: 'Graco',
        color: 'Grey',
        tags: ['highchair', 'feeding', 'chair'],
        user: {
          username: 'mealtime',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Tacoma, WA'
        }
      },
      {
        id: 11,
        title: 'Baby Books Collection',
        price: 12.00,
        image: 'https://via.placeholder.com/300x230?text=Baby+Books',
        height: 230,
        description: 'Collection of 10 board books for babies and toddlers. Great condition.',
        condition: 'Good',
        category: 'Toys & Games',
        ageGroup: 'All Ages',
        brand: 'Various',
        color: 'Multi',
        tags: ['books', 'reading', 'educational'],
        user: {
          username: 'bookworm',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Seattle, WA'
        }
      },
      {
        id: 12,
        title: 'Bottle Warmer',
        price: 22.00,
        image: 'https://via.placeholder.com/300x290?text=Bottle+Warmer',
        height: 290,
        description: 'Quick and even bottle warmer. Works with all bottle types and sizes.',
        condition: 'Like New',
        category: 'Feeding',
        ageGroup: 'Newborn (0-3 months)',
        brand: 'Philips AVENT',
        color: 'White',
        tags: ['bottle', 'warmer', 'feeding'],
        user: {
          username: 'feedingpro',
          profileImage: 'https://via.placeholder.com/40?text=User',
          location: 'Renton, WA'
        }
      }
    ];
  };

  // Dynamic columns based on window width
  const [columns, setColumns] = useState(getColumnCount());

  function getColumnCount() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  }

  // Update columns when window is resized
  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Open item detail modal
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Handle purchase from modal
  const handlePurchase = (item) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/item/${item.id || item._id}` } });
      return;
    }
    
    // In a real app, navigate to checkout or transaction page
    console.log('Processing purchase for item:', item);
    alert(`Purchase initiated for: ${item.title}`);
  };

  // CSS for Pinterest-style layout
  const containerStyle = {
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '20px'
  };

  const masonryStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridGap: '16px',
    margin: '0 auto'
  };

  const itemStyle = (item) => ({
    marginBottom: '16px',
    breakInside: 'avoid',
    backgroundColor: themeColors.cardBackground,
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  });

  const imageStyle = (height) => ({
    width: '100%',
    height: `${height}px`,
    objectFit: 'cover'
  });

  const cardContentStyle = {
    padding: '12px',
    color: themeColors.text
  };

  const priceTagStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: themeColors.primary,
    color: 'white',
    padding: '4px 10px',
    borderRadius: '16px',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const hoverEffect = (e) => {
    e.currentTarget.style.transform = 'scale(1.02)';
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
  };

  const removeHoverEffect = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  };

  // Group items into columns for the masonry layout
  const getItemsInColumns = () => {
    const itemsInColumns = Array.from({ length: columns }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % columns;
      itemsInColumns[columnIndex].push(item);
    });
    
    return itemsInColumns;
  };

  const columnsOfItems = getItemsInColumns();

  return (
    <div style={{ backgroundColor: themeColors.background, minHeight: '100vh' }}>
      <div style={containerStyle}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div style={{ 
            padding: '20px', 
            backgroundColor: themeColors.cardBackground, 
            borderRadius: '8px',
            color: themeColors.text
          }}>
            <h3>Error: {error}</h3>
            <p>Could not load items. Please try again later.</p>
          </div>
        ) : (
          <div style={masonryStyle}>
            {columnsOfItems.map((column, columnIndex) => (
              <div key={columnIndex}>
                {column.map(item => (
                  <div 
                    key={item.id || item._id} 
                    style={itemStyle(item)}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={hoverEffect}
                    onMouseLeave={removeHoverEffect}
                  >
                    <div style={priceTagStyle}>${item.price.toFixed(2)}</div>
                    <img 
                      src={item.image || item.thumbnail || item.images?.[0]?.thumbnail || `https://via.placeholder.com/300x${item.height || 300}?text=${encodeURIComponent(item.title)}`} 
                      alt={item.title} 
                      style={imageStyle(item.height || 300)} 
                    />
                    <div style={cardContentStyle}>
                      <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{item.title}</h3>
                      {item.user && (
                        <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                          by {item.user.username}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
};

export default Home;