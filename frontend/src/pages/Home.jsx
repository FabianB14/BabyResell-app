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

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Mobile breakpoint management
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

  // CSS for Pinterest-style layout
  const containerStyle = {
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '20px'
  };

  // Desktop filters (hidden on mobile)
  const filtersStyle = {
    backgroundColor: themeColors.cardBackground,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: isMobile ? 'none' : 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  };

  // Mobile filter controls (visible only on mobile)
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

  // Mobile dropdown filters (shows/hides based on state)
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

  const filterInputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: themeColors.secondary,
    color: themeColors.text,
    fontSize: '14px',
    width: '100%'
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
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  });

  const imageStyle = {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '16px 16px 0 0'
  };

  const contentStyle = {
    padding: '12px'
  };

  const titleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: themeColors.text,
    marginBottom: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  };

  const priceStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: themeColors.primary,
    marginBottom: '4px'
  };

  const metaStyle = {
    fontSize: '12px',
    color: themeColors.textSecondary,
    marginBottom: '2px'
  };

  // Helper function to organize items into columns for masonry effect
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
        
        {/* Mobile Search and Filter Controls */}
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

        {/* Mobile Dropdown Filters */}
        <div style={mobileFiltersStyle}>
          <div style={mobileFilterGridStyle}>
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
        </div>

        {/* Desktop Search and Filters */}
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
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: themeColors.textSecondary 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${themeColors.secondary}`,
              borderTop: `3px solid ${themeColors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            Loading items...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: themeColors.textSecondary 
          }}>
            <p>Error: {error}</p>
            <button 
              onClick={() => fetchItems(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <div style={masonryStyle}>
            {columnsOfItems.map((columnItems, columnIndex) => (
              <div key={columnIndex}>
                {columnItems.map((item) => (
                  <div
                    key={item._id || item.id}
                    style={itemStyle(item)}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {item.photos && item.photos.length > 0 && (
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        style={imageStyle}
                        loading="lazy"
                      />
                    )}
                    <div style={contentStyle}>
                      <div style={priceStyle}>
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                      </div>
                      <div style={titleStyle}>{item.title}</div>
                      <div style={metaStyle}>
                        {item.condition} • {item.category}
                      </div>
                      {item.location && (
                        <div style={metaStyle}>{item.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && pagination.page < pagination.pages && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button
              onClick={loadMore}
              style={{
                padding: '12px 24px',
                backgroundColor: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Load More Items
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: themeColors.textSecondary 
          }}>
            <h3 style={{ marginBottom: '8px', color: themeColors.text }}>No Items Found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPurchase={() => handlePurchase(selectedItem)}
        />
      )}

      {/* Add keyframes for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Home;