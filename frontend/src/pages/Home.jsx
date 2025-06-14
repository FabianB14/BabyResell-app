// Restored Home.jsx with original Pinterest-style grid and proper image handling

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import ItemDetailModal from '../components/ItemDetailModal';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X,
  SlidersHorizontal,
  Heart,
  MapPin,
  User
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated } = useAuth();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  // Responsive columns - matching original
  const [columns, setColumns] = useState(getColumnCount());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  function getColumnCount() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  }

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnCount());
      setIsMobile(window.innerWidth < 768);
      
      // Auto-close mobile filters when switching to desktop
      if (window.innerWidth >= 768) {
        setShowMobileFilters(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.category) count++;
    if (filters.condition) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sort: '-createdAt'
    });
  };

  // Fetch items logic
  const fetchItems = async (resetItems = false) => {
    try {
      setLoading(true);
      setError(null);
      
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

      const response = await itemsAPI.getAllItems(params);
      
      if (response.data.success) {
        const newItems = response.data.data || [];
        const paginationData = response.data.pagination || {};
        
        setItems(resetItems ? newItems : [...items, ...newItems]);
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 20,
          total: paginationData.total || 0,
          pages: paginationData.pages || 0
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load items');
      if (resetItems) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

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

  // Open item detail modal
  const handleItemClick = (item) => {
    console.log('Item clicked:', item);
    setSelectedItem(item);
  };

  // Handle purchase from modal
  const handlePurchase = (item) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/item/${item.id || item._id}` } });
      return;
    }
    
    navigate('/checkout', { state: { item } });
  };

  // Effects for fetching data
  useEffect(() => {
    fetchItems(true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems(true);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  const activeFilterCount = getActiveFilterCount();

  // Group items into columns for masonry layout (original logic)
  const getItemsInColumns = () => {
    const itemsInColumns = Array.from({ length: columns }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % columns;
      itemsInColumns[columnIndex].push(item);
    });
    
    return itemsInColumns;
  };

  // Styles - matching original design
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
    display: isMobile ? 'none' : 'grid',
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

  const itemStyle = {
    marginBottom: '16px',
    breakInside: 'avoid',
    backgroundColor: themeColors.cardBackground,
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  };

  const imageStyle = (height = 300) => ({
    width: '100%',
    height: `${height}px`,
    objectFit: 'cover',
    pointerEvents: 'none'
  });

  const cardContentStyle = {
    padding: '12px',
    color: themeColors.text,
    pointerEvents: 'none'
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
    pointerEvents: 'none'
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
    pointerEvents: 'none'
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

  // Mobile filter styles
  const mobileFilterToggleStyle = {
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: showMobileFilters ? themeColors.primary : 'transparent',
    color: showMobileFilters ? 'white' : themeColors.text,
    border: `1px solid ${showMobileFilters ? themeColors.primary : themeColors.secondary}`,
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '16px',
    position: 'relative',
  };

  const mobileFiltersStyle = {
    display: isMobile && showMobileFilters ? 'block' : 'none',
    backgroundColor: themeColors.cardBackground,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    border: `1px solid ${themeColors.secondary}`,
  };

  const hoverEffect = (e) => {
    e.currentTarget.style.transform = 'scale(1.02)';
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
  };

  const removeHoverEffect = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  };

  const itemsInColumns = getItemsInColumns();

  return (
    <div style={containerStyle}>
      {/* Search Section */}
      <div style={{
        backgroundColor: themeColors.cardBackground,
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: themeColors.secondary,
          padding: '12px 16px',
          borderRadius: '24px',
          marginBottom: isMobile ? '16px' : '0'
        }}>
          <Search size={20} color={themeColors.textSecondary} />
          <input
            type="text"
            placeholder="Search baby items..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: themeColors.text,
              width: '100%',
              fontFamily: 'inherit',
            }}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: themeColors.textSecondary,
              }}
              onClick={() => handleSearch('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          style={mobileFilterToggleStyle}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#EF4444',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: '600',
              minWidth: '20px',
              textAlign: 'center',
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Mobile Filters */}
        <div style={mobileFiltersStyle}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <select
              style={filterInputStyle}
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="clothing">Clothing</option>
              <option value="toys">Toys</option>
              <option value="feeding">Feeding</option>
              <option value="gear">Gear</option>
              <option value="books">Books</option>
            </select>

            <select
              style={filterInputStyle}
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
            >
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                type="number"
                placeholder="Min Price"
                style={filterInputStyle}
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max Price"
                style={filterInputStyle}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>

            <select
              style={filterInputStyle}
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-views">Most Popular</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                style={{
                  ...filterInputStyle,
                  backgroundColor: '#EF4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                onClick={clearAllFilters}
              >
                Clear All Filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Filters */}
      <div style={filtersStyle}>
        <select
          style={filterInputStyle}
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="clothing">Clothing</option>
          <option value="toys">Toys</option>
          <option value="feeding">Feeding</option>
          <option value="gear">Gear</option>
          <option value="books">Books</option>
        </select>

        <select
          style={filterInputStyle}
          value={filters.condition}
          onChange={(e) => handleFilterChange('condition', e.target.value)}
        >
          <option value="">All Conditions</option>
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          style={filterInputStyle}
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Price"
          style={filterInputStyle}
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />

        <select
          style={filterInputStyle}
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
        >
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-views">Most Popular</option>
        </select>

        {activeFilterCount > 0 && (
          <button
            style={{
              ...filterInputStyle,
              backgroundColor: '#EF4444',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
            }}
            onClick={clearAllFilters}
          >
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Results Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        color: themeColors.textSecondary,
        fontSize: '14px'
      }}>
        <span>Showing {items.length} of {pagination.total} items</span>
        {!isMobile && (
          <select
            style={filterInputStyle}
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-views">Most Popular</option>
          </select>
        )}
      </div>

      {/* Pinterest-style Masonry Grid - Original Layout */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: themeColors.textSecondary }}>
          Loading items...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>
          {error}
        </div>
      ) : (
        <div style={masonryStyle}>
          {itemsInColumns.map((columnItems, columnIndex) => (
            <div key={columnIndex} style={{ display: 'flex', flexDirection: 'column' }}>
              {columnItems.map((item, itemIndex) => {
                // Dynamic heights for masonry effect
                const heights = [250, 300, 350, 400, 450];
                const randomHeight = heights[(columnIndex + itemIndex) % heights.length];

                return (
                  <div
                    key={item._id || item.id}
                    style={itemStyle}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={hoverEffect}
                    onMouseLeave={removeHoverEffect}
                  >
                    {/* Image with overlays */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={item.images?.[0] || item.image || item.thumbnail || '/api/placeholder/300/250'}
                        alt={item.title || item.name}
                        style={imageStyle(randomHeight)}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/250';
                        }}
                      />
                      
                      {/* Price tag overlay */}
                      {item.price && (
                        <div style={priceTagStyle}>
                          ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                        </div>
                      )}
                      
                      {/* Condition tag overlay */}
                      {item.condition && (
                        <div style={conditionTagStyle}>
                          {item.condition}
                        </div>
                      )}
                    </div>

                    {/* Card content */}
                    <div style={cardContentStyle}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        lineHeight: '1.3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {item.title || item.name}
                      </h3>
                      
                      {/* Seller info */}
                      {(item.seller || item.user) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: themeColors.textSecondary,
                          fontSize: '12px',
                          marginBottom: '4px',
                        }}>
                          <User size={12} />
                          <span>by {item.seller?.name || item.seller?.username || item.user?.name || item.user?.username}</span>
                        </div>
                      )}
                      
                      {/* Location */}
                      {item.location && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: themeColors.textSecondary,
                          fontSize: '12px',
                        }}>
                          <MapPin size={12} />
                          <span>{item.location}</span>
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
      {pagination.page < pagination.pages && !loading && (
        <button
          style={loadMoreButtonStyle}
          onClick={() => fetchItems(false)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Load More Items
        </button>
      )}

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