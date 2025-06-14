import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import ItemDetailModal from '../components/ItemDetailModal';
import { Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated } = useAuth();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false); // NEW: Mobile filter toggle
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
      // Close mobile filters when switching to desktop
      if (window.innerWidth >= 768) {
        setShowMobileFilters(false);
      }
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

  // Check if mobile view
  const isMobile = window.innerWidth < 768;

  // CSS for Pinterest-style layout
  const containerStyle = {
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '20px'
  };

  // UPDATED: Enhanced filters with mobile responsiveness
  const filtersStyle = {
    backgroundColor: themeColors.cardBackground,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  // NEW: Mobile search bar with filter toggle
  const mobileSearchStyle = {
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  };

  const searchBoxStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    border: `1px solid ${themeColors.secondary}`,
    borderRadius: '12px',
    padding: '12px 16px',
    gap: '8px',
  };

  const searchInputStyle = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '16px',
    color: themeColors.text,
  };

  const mobileFilterToggleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: themeColors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  };

  // UPDATED: Desktop filters (always visible)
  const desktopFiltersStyle = {
    display: isMobile ? 'none' : 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  };

  // NEW: Mobile filters (collapsible)
  const mobileFiltersContainerStyle = {
    display: isMobile ? 'block' : 'none',
    maxHeight: showMobileFilters ? '500px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
  };

  const mobileFiltersStyle = {
    padding: showMobileFilters ? '16px 0 0 0' : '0',
    transition: 'padding 0.3s ease-in-out',
  };

  const mobileFiltersGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  };

  const filterInputStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${themeColors.secondary}`,
    backgroundColor: themeColors.background,
    color: themeColors.text,
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  };

  const priceContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
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
    pointerEvents: 'none' // This ensures clicks pass through to the parent div
  });

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
        {/* Search and Filters */}
        <div style={filtersStyle}>
          {/* Mobile Search Bar with Filter Toggle */}
          <div style={mobileSearchStyle}>
            <div style={searchBoxStyle}>
              <Search size={20} color={themeColors.textSecondary} />
              <input
                type="text"
                placeholder="Search for baby items..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <button
              style={mobileFilterToggleStyle}
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter size={16} />
              Filters
              {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Desktop Filters (Always Visible) */}
          <div style={desktopFiltersStyle}>
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

          {/* Mobile Filters (Collapsible) */}
          <div style={mobileFiltersContainerStyle}>
            <div style={mobileFiltersStyle}>
              <div style={mobileFiltersGridStyle}>
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

                <div style={priceContainerStyle}>
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
                </div>

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
          </div>
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

        {/* Loading state */}
        {loading && items.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: themeColors.textSecondary 
          }}>
            <h2>Loading items...</h2>
          </div>
        )}

        {/* Error state */}
        {error && items.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: themeColors.primary 
          }}>
            <h2>Failed to load items</h2>
            <p>{error}</p>
            <button 
              onClick={() => fetchItems(true)}
              style={loadMoreButtonStyle}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Masonry Grid */}
        {items.length > 0 && (
          <div style={masonryStyle}>
            {columnsOfItems.map((column, columnIndex) => (
              <div key={columnIndex}>
                {column.map((item, index) => {
                  // Calculate random height for masonry effect
                  const baseHeight = 200;
                  const randomHeight = baseHeight + (Math.random() * 200);
                  
                  return (
                    <div
                      key={item._id || item.id}
                      style={itemStyle(item)}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={hoverEffect}
                      onMouseLeave={removeHoverEffect}
                    >
                      {/* Price Tag */}
                      <div style={priceTagStyle}>
                        ${item.price}
                      </div>
                      
                      {/* Condition Tag */}
                      <div style={conditionTagStyle}>
                        {item.condition}
                      </div>
                      
                      {/* Item Image */}
                      {item.images && item.images.length > 0 && (
                        <img
                          src={item.images[0].thumbnail || item.images[0].fullSize || '/placeholder-image.png'}
                          alt={item.title}
                          style={imageStyle(randomHeight)}
                          loading="lazy"
                        />
                      )}
                      
                      {/* Item Details */}
                      <div style={cardContentStyle}>
                        <h3 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '16px',
                          lineHeight: '1.3',
                          color: themeColors.text
                        }}>
                          {item.title}
                        </h3>
                        
                        <p style={{ 
                          margin: 0, 
                          fontSize: '14px',
                          color: themeColors.textSecondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {item.description}
                        </p>
                        
                        {item.category && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: themeColors.primary,
                            fontWeight: '500'
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
        {pagination.page < pagination.pages && items.length > 0 && (
          <button
            onClick={loadMore}
            style={loadMoreButtonStyle}
            disabled={loading}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {loading ? 'Loading...' : 'Load More Items'}
          </button>
        )}

        {/* No more items message */}
        {pagination.page >= pagination.pages && items.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: themeColors.textSecondary,
            fontSize: '14px'
          }}>
            You've reached the end! ✨
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
};

export default Home;