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
      user: { username: 'parent123' }
    },
    {
      id: 2,
      title: 'Wooden Crib',
      price: 120.00,
      image: 'https://via.placeholder.com/300x350?text=Wooden+Crib',
      condition: 'Good',
      user: { username: 'seller456' }
    },
    {
      id: 3,
      title: 'Baby Toys Bundle',
      price: 35.00,
      image: 'https://via.placeholder.com/300x450?text=Baby+Toys',
      condition: 'Good',
      user: { username: 'toystore' }
    },
    {
      id: 4,
      title: 'Stroller',
      price: 75.00,
      image: 'https://via.placeholder.com/300x380?text=Stroller',
      condition: 'Good',
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
    
    imageContainer: {
      position: 'relative',
      width: '100%',
      paddingBottom: '120%', // 5:6 aspect ratio
      overflow: 'hidden',
      backgroundColor: '#2e2e2e',
    },
    
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    
    priceTag: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: '#e60023',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    
    conditionTag: {
      position: 'absolute',
      bottom: '8px',
      left: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '8px',
      fontSize: '11px',
    },
    
    details: {
      padding: '12px',
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
    
    user: {
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
    },
    
    // Mobile-specific styles
    mobileOptimizations: {
      '@media (max-width: 480px)': {
        padding: '8px',
        gap: '8px',
      }
    }
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
              <div style={{
                ...styles.imageContainer,
                paddingBottom: window.innerWidth < 480 ? '120%' : `${randomHeight / 3}%`
              }}>
                <img 
                  src={item.image || item.thumbnail}
                  alt={item.title}
                  style={styles.image}
                  loading="lazy"
                />
                
                {item.price && (
                  <div style={styles.priceTag}>
                    ${item.price.toFixed(2)}
                  </div>
                )}
                
                {item.condition && (
                  <div style={styles.conditionTag}>
                    {item.condition}
                  </div>
                )}
              </div>
              
              <div style={styles.details}>
                <div style={styles.title}>
                  {item.title}
                </div>
                {item.user && (
                  <div style={styles.user}>
                    <div style={styles.avatar} />
                    <span>{item.user.username}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsiveHomeGrid;