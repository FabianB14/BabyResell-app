import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import ItemDetailModal from '../components/ItemDetailModal';
import { Filter } from 'lucide-react';

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

  // ONLY ADDITION: Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ONLY ADDITION: Mobile breakpoint management
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        
        // DEBUG: Log the first item to see its structure
        if (newItems.length > 0) {
          console.log('First item structure:', newItems[0]);
          console.log('Images field:', newItems[0].images);
          console.log('Thumbnail field:', newItems[0].thumbnail);
        }
        
        // If resetting (new search/filter), replace items; otherwise append for pagination
        setItems(resetItems ? newItems : [...items, ...newItems]);
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 20,
          total: paginationData.total || 0,
          pages: paginationData.pages || 0
        });
        
        console.log('Items fetched successfully:', { 
          count: newItems.length, 
          total: paginationData.total 
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch items');
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load items');
      
      // If it's the first load and the API fails, don't show any items
      if (resetItems) {
        setItems([]);
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
    console.log('Item clicked:', item); // Debug log
    setSelectedItem(item);
  };

  // Handle purchase from modal
  const handlePurchase = (item) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/item/${item.id || item._id}` } });
      return;
    }
    
    // Navigate to checkout
    navigate('/checkout', { state: { item } });
  };

  // Get the proper image URL from item data
  const getItemImageUrl = (item) => {
    // Check if item has images array
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // If images are objects with thumbnail property, use thumbnail for list view
      if (typeof item.images[0] === 'object' && item.images[0].thumbnail) {
        const primaryImage = item.images.find(img => img.isPrimary) || item.images[0];
        return primaryImage.thumbnail; // Use thumbnail for better performance in list view
      }
      // If images are just URL strings
      else if (typeof item.images[0] === 'string') {
        return item.images[0];
      }
    }
    
    // Check for thumbnail field
    if (item.thumbnail) {
      return item.thumbnail;
    }
    
    // Check for single image field
    if (item.image) {
      return item.image;
    }
    
    return '';
  };

  // CSS for Pinterest-style layout
  const containerStyle = {
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '20px'
  };

  // MODIFIED: Hide desktop filters on mobile
  const filtersStyle = {
    backgroundColor: themeColors.cardBackground,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: isMobile ? 'none' : 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  };

  // ONLY ADDITION: Mobile filter styles
  const mobileFilterControlsStyle = {
    display: isMobile ? 'flex' : 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '12px'
  };

  const mobileFiltersButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: themeColors.textSecondary,
    border: `1px solid ${themeColors.secondary}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const mobileFiltersStyle = {
    display: isMobile && showMobileFilters ? 'block' : 'none',
    backgroundColor: themeColors.cardBackground,
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: `1px solid ${themeColors.secondary}`
  };

  const mobileFilterGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px'
  };

  const mobileSearchStyle = {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: themeColors.secondary,
    color: themeColors.text,
    fontSize: '14px'
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

  const imageStyle = (height = 300) => ({
    width: '100%',
    height: `${height}px`,
    objectFit: 'cover',
    pointerEvents: 'none', // This ensures clicks pass through to the parent div
    backgroundColor: themeColors.secondary // Background color while loading
  });

  const placeholderImageStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.secondary,
    color: themeColors.textSecondary,
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px'
  };

  const cardContentStyle = {
    padding: '12px',
    color: themeColors.text,
    pointerEvents: 'none' // Ensure clicks pass through to parent
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
    fontSize: '14px',
    pointerEvents: 'none' // This ensures clicks pass through
  };

  const conditionTagStyle = {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    pointerEvents: 'none' // This ensures clicks pass through
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
        
        {/* ONLY ADDITION: Mobile Search and Filter Controls */}
        <div style={mobileFilterControlsStyle}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={mobileSearchStyle}
          />
          <button
            style={mobileFiltersButtonStyle}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* ONLY ADDITION: Mobile Dropdown Filters */}
        <div style={mobileFiltersStyle}>
          <div style={mobileFilterGridStyle}>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={filterInputStyle}
            >
              <option value="">All Categories</option>
              <option value="Strollers">Strollers</option>
              <option value="Car Seats">Car Seats</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Feeding">Feeding</option>
              <option value="Carriers">Carriers</option>
              <option value="Toys">Toys</option>
              <option value="Safety">Safety</option>
              <option value="Bath & Care">Bath & Care</option>
              <option value="Nursery">Nursery</option>
              <option value="Diapering">Diapering</option>
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
              <option value="Excellent">Excellent</option>
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
        </div>

        {/* UNCHANGED: Desktop Search and Filters */}
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
            <option value="Strollers">Strollers</option>
            <option value="Car Seats">Car Seats</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Feeding">Feeding</option>
            <option value="Carriers">Carriers</option>
            <option value="Toys">Toys</option>
            <option value="Safety">Safety</option>
            <option value="Bath & Care">Bath & Care</option>
            <option value="Nursery">Nursery</option>
            <option value="Diapering">Diapering</option>
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
            <option value="Excellent">Excellent</option>
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
        {error && !loading && (
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
                  // Get the proper image URL
                  const imageUrl = getItemImageUrl(item);
                  
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
                      {/* Image Container - This wraps the image and its overlays */}
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: `${height}px`,
                        overflow: 'hidden'
                      }}>
                        {/* Price Tag - now inside image container */}
                        {item.price && (
                          <div style={priceTagStyle}>
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                          </div>
                        )}
                        
                        {/* Item Image or Placeholder */}
                        {imageUrl ? (
                          <img 
                            src={imageUrl}
                            alt={item.title || 'Baby item'} 
                            style={imageStyle(height)}
                            onError={(e) => {
                              console.error('Image failed to load:', imageUrl);
                              console.error('Error:', e);
                              // Hide broken image
                              e.target.style.display = 'none';
                              // Show placeholder div instead
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', imageUrl);
                            }}
                          />
                        ) : null}
                        
                        {/* Placeholder div - shown when no image or image fails to load */}
                        <div style={{
                          ...placeholderImageStyle,
                          height: `${height}px`,
                          display: imageUrl ? 'none' : 'flex'
                        }}>
                          <div>
                            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🍼</div>
                            <div>{item.title || 'Baby Item'}</div>
                          </div>
                        </div>
                        
                        {/* Condition Tag - now inside image container */}
                        {item.condition && (
                          <div style={conditionTagStyle}>
                            {item.condition}
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details - separate from image container */}
                      <div style={cardContentStyle}>
                        <h3 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: '600' }}>
                          {item.title || 'Untitled Item'}
                        </h3>
                        {item.user && (
                          <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                            by {item.user.username || item.user.firstName || 'Anonymous'}
                          </div>
                        )}
                        {(item.location?.city || item.user?.location) && (
                          <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                            📍 {item.location?.city || item.user?.location || 'Unknown'}
                          </div>
                        )}
                        {item.category && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: themeColors.textSecondary,
                            marginTop: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {item.category}
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