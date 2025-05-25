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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    sort: '-createdAt'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch baby items from the backend
  const fetchItems = async (resetItems = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page: resetItems ? 1 : pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category && { category: filters.category }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: parseFloat(filters.maxPrice) }),
      };

      console.log('Fetching items with params:', params);
      
      const response = await itemsAPI.getAllItems(params);
      
      if (response.data.success) {
        const newItems = response.data.data || [];
        const paginationData = response.data.pagination || {};
        
        // Process items to ensure they have valid image URLs
        const processedItems = newItems.map(item => {
          // Get the best available image URL
          let imageUrl = null;
          
          if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            const primaryImage = item.images.find(img => img.isPrimary);
            if (primaryImage) {
              imageUrl = primaryImage.thumbnail || primaryImage.fullSize;
            } else {
              imageUrl = item.images[0].thumbnail || item.images[0].fullSize;
            }
          } else if (item.thumbnail) {
            imageUrl = item.thumbnail;
          } else if (item.image) {
            imageUrl = item.image;
          }
          
          // Use a working placeholder service
          const placeholderUrl = `https://placehold.co/300x400/e0e0e0/666666?text=${encodeURIComponent(item.title || 'Baby Item')}`;
          
          console.log(`Item "${item.title}": imageUrl = ${imageUrl}`);
          
          return {
            ...item,
            displayImage: imageUrl || placeholderUrl
          };
        });
        
        // If resetting (new search/filter), replace items; otherwise append for pagination
        setItems(resetItems ? processedItems : [...items, ...processedItems]);
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 20,
          total: paginationData.total || 0,
          pages: paginationData.pages || 0
        });
        
        console.log('Items fetched successfully:', { 
          count: processedItems.length, 
          total: paginationData.total 
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch items');
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load items');
      
      // If it's the first load and the API fails, use sample data
      if (resetItems) {
        // Sample data for testing
        const sampleItems = [
          {
            _id: 'sample1',
            title: 'Baby Carrier - Like New',
            price: 45.00,
            condition: 'Like New',
            displayImage: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=300&h=400&fit=crop',
            user: { username: 'parent123' }
          },
          {
            _id: 'sample2',
            title: 'Wooden Crib with Mattress',
            price: 120.00,
            condition: 'Good',
            displayImage: 'https://images.unsplash.com/photo-1566479117908-8e369a60d57a?w=300&h=350&fit=crop',
            user: { username: 'parent456' }
          },
          {
            _id: 'sample3',
            title: 'Baby Toys Bundle',
            price: 35.00,
            condition: 'Good',
            displayImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=380&fit=crop',
            user: { username: 'parent789' }
          },
          {
            _id: 'sample4',
            title: 'Baby Stroller - Foldable',
            price: 75.00,
            condition: 'Good',
            displayImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=320&fit=crop',
            user: { username: 'parent321' }
          },
          {
            _id: 'sample5',
            title: 'Diaper Bag - Designer',
            price: 50.00,
            condition: 'Like New',
            displayImage: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=300&h=360&fit=crop',
            user: { username: 'parent654' }
          },
          {
            _id: 'sample6',
            title: 'Baby Bath Set',
            price: 25.00,
            condition: 'Good',
            displayImage: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=340&fit=crop',
            user: { username: 'parent987' }
          }
        ];
        setItems(sampleItems);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchItems(true);
  }, []);

  // Refetch when search or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems(true);
    }, 500); // Debounce search queries

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Load more items (pagination)
  const loadMore = () => {
    if (loading || pagination.page >= pagination.pages) return;
    
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    fetchItems(false);
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
    
    // Navigate to item detail page or show purchase flow
    navigate(`/item/${item._id || item.id}`);
  };

  // CSS for Pinterest-style layout
  const containerStyle = {
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '20px'
  };

  const filtersStyle = {
    backgroundColor: themeColors.cardBackground,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  };

  const filterInputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: themeColors.secondary,
    color: themeColors.text,
    fontSize: '14px'
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

  const imageContainerStyle = (height = 300) => ({
    width: '100%',
    height: `${height}px`,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

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

  const conditionTagStyle = {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  };

  const loadMoreButtonStyle = {
    backgroundColor: themeColors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'block',
    margin: '24px auto',
    transition: 'transform 0.2s'
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
        {/* Search and Filters */}
        <div style={filtersStyle}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={filterInputStyle}
          />
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={filterInputStyle}
          >
            <option value="">All Categories</option>
            <option value="Clothes & Shoes">Clothes & Shoes</option>
            <option value="Toys & Games">Toys & Games</option>
            <option value="Feeding">Feeding</option>
            <option value="Diapering">Diapering</option>
            <option value="Bathing & Skincare">Bathing & Skincare</option>
            <option value="Health & Safety">Health & Safety</option>
            <option value="Nursery">Nursery</option>
            <option value="Strollers & Car Seats">Strollers & Car Seats</option>
            <option value="Carriers & Wraps">Carriers & Wraps</option>
            <option value="Activity & Entertainment">Activity & Entertainment</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>
          
          <select
            value={filters.condition}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            style={filterInputStyle}
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
          
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            style={filterInputStyle}
            min="0"
            step="0.01"
          />
          
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            style={filterInputStyle}
            min="0"
            step="0.01"
          />
          
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            style={filterInputStyle}
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="title">Name: A to Z</option>
            <option value="-title">Name: Z to A</option>
          </select>
        </div>

        {/* Results Count */}
        {!loading && (
          <div style={{ 
            color: themeColors.textSecondary, 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {pagination.total > 0 
              ? `Showing ${items.length} of ${pagination.total} items`
              : 'No items found'
            }
          </div>
        )}

        {/* Loading State */}
        {loading && items.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="loader"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && items.length === 0 && (
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            color: '#ef4444',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h3>Error: {error}</h3>
            <p>Please try again or check your connection.</p>
            <button 
              style={loadMoreButtonStyle}
              onClick={() => fetchItems(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Items Grid */}
        {!loading && items.length > 0 && (
          <div style={masonryStyle}>
            {columnsOfItems.map((column, columnIndex) => (
              <div key={columnIndex}>
                {column.map(item => {
                  // Calculate dynamic height based on image aspect ratio or random
                  const height = item.height || (250 + Math.floor(Math.random() * 150));
                  
                  return (
                    <div 
                      key={item._id || item.id} 
                      style={itemStyle(item)}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={hoverEffect}
                      onMouseLeave={removeHoverEffect}
                    >
                      {/* Price Tag */}
                      {item.price && (
                        <div style={priceTagStyle}>
                          ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                        </div>
                      )}
                      
                      {/* Item Image - Direct implementation */}
                      <div style={imageContainerStyle(height)}>
                        <img 
                          src={item.displayImage}
                          alt={item.title || 'Baby item'} 
                          style={{
                            ...imageStyle,
                            display: 'block'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.target.src = `https://placehold.co/300x${height}/e0e0e0/666666?text=${encodeURIComponent(item.title || 'No Image')}`;
                            e.target.onerror = null; // Prevent infinite loop
                          }}
                        />
                      </div>
                      
                      {/* Condition Tag */}
                      {item.condition && (
                        <div style={conditionTagStyle}>
                          {item.condition}
                        </div>
                      )}
                      
                      {/* Item Details */}
                      <div style={cardContentStyle}>
                        <h3 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: '600' }}>
                          {item.title || 'Untitled Item'}
                        </h3>
                        {item.user && (
                          <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                            by {item.user.username || 'Anonymous'}
                          </div>
                        )}
                        {item.location && (
                          <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && items.length > 0 && pagination.page < pagination.pages && (
          <button 
            style={loadMoreButtonStyle}
            onClick={loadMore}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Load More Items ({pagination.total - items.length} remaining)
          </button>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && !error && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: themeColors.textSecondary
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              🍼
            </div>
            <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
              No items found
            </h3>
            <p style={{ marginBottom: '24px' }}>
              {searchQuery || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search or filters'
                : 'Be the first to list an item!'
              }
            </p>
            {isAuthenticated && (
              <button 
                style={loadMoreButtonStyle}
                onClick={() => navigate('/create-listing')}
              >
                Create Your First Listing
              </button>
            )}
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