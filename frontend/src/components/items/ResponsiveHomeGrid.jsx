import React, { useState, useEffect } from 'react';

const ResponsiveHomeGrid = ({ items = [], onItemClick }) => {
  const [columns, setColumns] = useState(2);
  
  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setColumns(2);
      } else if (width < 768) {
        setColumns(3);
      } else if (width < 1024) {
        setColumns(4);
      } else {
        setColumns(5);
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  
  // Sample items if none provided
  const displayItems = items.length > 0 ? items : [
    {
      id: 1,
      title: 'Baby Carrier',
      price: 45.00,
      image: 'https://via.placeholder.com/300x400?text=Baby+Carrier',
      condition: 'Like New',
      location: 'Seattle, WA',
      user: { username: 'parent123' }
    },
    {
      id: 2,
      title: 'Wooden Crib',
      price: 120.00,
      image: 'https://via.placeholder.com/300x350?text=Wooden+Crib',
      condition: 'Good',
      location: 'Federal Way, WA',
      user: { username: 'seller456' }
    },
    {
      id: 3,
      title: 'Baby Toys Bundle',
      price: 35.00,
      image: 'https://via.placeholder.com/300x450?text=Baby+Toys',
      condition: 'Good',
      location: 'Tacoma, WA',
      user: { username: 'toystore' }
    },
    {
      id: 4,
      title: 'Stroller',
      price: 75.00,
      image: 'https://via.placeholder.com/300x380?text=Stroller',
      condition: 'New',
      location: 'Bellevue, WA',
      user: { username: 'babygear' }
    },
  ];
  
  const styles = {
    container: {
      padding: '16px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '12px',
      '@media (min-width: 768px)': {
        gap: '20px',
      }
    },
    
    gridItem: {
      backgroundColor: '#1e1e1e',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    
    // Image container with fixed aspect ratio
    imageWrapper: {
      position: 'relative',
      width: '100%',
      paddingBottom: '120%', // 5:6 aspect ratio
      backgroundColor: '#2e2e2e',
      overflow: 'hidden', // This ensures nothing bleeds out
    },
    
    // Image fills the container
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    
    // Price tag - top right of image
    priceTag: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: '#e60023',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: 'bold',
      zIndex: 2,
    },
    
    // Condition tag - bottom left of image (inside image bounds)
    conditionTag: {
      position: 'absolute',
      bottom: '8px',
      left: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '500',
      zIndex: 2,
    },
    
    // Details section below image
    details: {
      padding: '12px',
      backgroundColor: '#1e1e1e',
    },
    
    title: {
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      lineHeight: '1.3',
    },
    
    locationInfo: {
      color: '#b0b0b0',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    
    avatar: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: '#444',
      marginRight: '4px',
    },
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {displayItems.map((item, index) => {
          // Calculate dynamic height for masonry effect
          const heights = [300, 350, 400, 450];
          const randomHeight = heights[index % heights.length];
          
          return (
            <div
              key={item.id || index}
              style={styles.gridItem}
              onClick={() => onItemClick && onItemClick(item)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Image wrapper with all overlays */}
              <div style={{
                ...styles.imageWrapper,
                paddingBottom: window.innerWidth < 480 ? '120%' : `${randomHeight / 3}%`
              }}>
                {/* The actual image */}
                <img 
                  src={item.image || item.thumbnail}
                  alt={item.title}
                  style={styles.image}
                  loading="lazy"
                />
                
                {/* Price tag overlay - top right */}
                {item.price && (
                  <div style={styles.priceTag}>
                    ${item.price.toFixed(2)}
                  </div>
                )}
                
                {/* Condition tag overlay - bottom left */}
                {item.condition && (
                  <div style={styles.conditionTag}>
                    {item.condition}
                  </div>
                )}
              </div>
              
              {/* Details section - separate from image */}
              <div style={styles.details}>
                <div style={styles.title}>
                  {item.title}
                </div>
                
                {/* Location info - now fully visible */}
                <div style={styles.locationInfo}>
                  {item.user && (
                    <>
                      <div style={styles.avatar} />
                      <span>{item.user.username}</span>
                      {item.location && <span> • {item.location}</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsiveHomeGrid;