// Enhanced Home.jsx with collapsible marketplace filters

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
  SlidersHorizontal
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

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
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

  // Fetch items logic (existing from your code)
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

  // Effects for fetching data (existing from your code)
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

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
    },

    // Search and Filter Section
    searchFilterSection: {
      backgroundColor: themeColors.cardBackground,
      borderBottom: `1px solid ${themeColors.secondary}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    },

    searchContainer: {
      padding: isMobile ? '16px' : '20px 24px',
      maxWidth: '1200px',
      margin: '0 auto',
    },

    searchInputWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: themeColors.secondary,
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      marginBottom: isMobile ? '12px' : '0',
      transition: 'all 0.2s ease',
    },

    searchInput: {
      background: 'none',
      border: 'none',
      outline: 'none',
      fontSize: '16px',
      color: themeColors.text,
      width: '100%',
      fontFamily: 'inherit',
    },

    clearSearchButton: {
      padding: '2px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: themeColors.textSecondary,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
    },

    // Mobile filter toggle
    mobileFilterToggle: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '12px 16px',
      backgroundColor: showMobileFilters ? themeColors.primary : 'transparent',
      color: showMobileFilters ? 'white' : themeColors.text,
      border: `1px solid ${showMobileFilters ? themeColors.primary : themeColors.secondary}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      position: 'relative',
    },

    mobileFilterContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    filterBadge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      backgroundColor: '#EF4444',
      color: 'white',
      borderRadius: '10px',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '600',
      minWidth: '18px',
      textAlign: 'center',
      display: activeFilterCount > 0 ? 'block' : 'none',
    },

    // Desktop filters
    desktopFilters: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 24px',
      borderTop: `1px solid ${themeColors.secondary}`,
      backgroundColor: themeColors.secondary,
      maxWidth: '1200px',
      margin: '0 auto',
      flexWrap: 'wrap',
    },

    // Mobile filters panel
    mobileFiltersPanel: {
      display: isMobile && showMobileFilters ? 'block' : 'none',
      backgroundColor: themeColors.cardBackground,
      borderTop: `1px solid ${themeColors.secondary}`,
      animation: showMobileFilters ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out',
    },

    mobileFiltersHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      borderBottom: `1px solid ${themeColors.secondary}`,
      backgroundColor: themeColors.secondary,
    },

    mobileFiltersTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: themeColors.text,
    },

    clearFiltersButton: {
      display: activeFilterCount > 0 ? 'flex' : 'none',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s ease',
    },

    mobileFiltersContent: {
      padding: '16px',
      display: 'grid',
      gap: '16px',
    },

    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },

    filterLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: themeColors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },

    filterSelect: {
      padding: '12px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      cursor: 'pointer',
      width: '100%',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
    },

    filterInput: {
      padding: '12px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      width: '100%',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
    },

    priceRange: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },

    // Results section
    resultsSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px',
    },

    resultsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px',
    },

    resultsCount: {
      color: themeColors.textSecondary,
      fontSize: '14px',
    },

    sortSelect: {
      padding: '8px 12px',
      backgroundColor: themeColors.cardBackground,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      cursor: 'pointer',
    },

    // Item grid
    itemGrid: {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    },

    '@media (min-width: 480px)': {
      itemGrid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      },
    },

    '@media (min-width: 768px)': {
      itemGrid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
      },
    },

    closeButton: {
      padding: '4px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: themeColors.textSecondary,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
    },
  };

  // Animation CSS
  const animationCSS = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 400px;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translateY(0);
        max-height: 400px;
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
        max-height: 0;
      }
    }

    @media (min-width: 480px) {
      .item-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      }
    }

    @media (min-width: 768px) {
      .item-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{animationCSS}</style>
      
      {/* Search and Filter Section */}
      <section style={styles.searchFilterSection}>
        {/* Search Container */}
        <div style={styles.searchContainer}>
          <div style={styles.searchInputWrapper}>
            <Search size={20} color={themeColors.textSecondary} />
            <input
              type="text"
              placeholder="Search baby items..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button
                style={styles.clearSearchButton}
                onClick={() => handleSearch('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            style={styles.mobileFilterToggle}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <div style={styles.mobileFilterContent}>
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <span style={styles.filterBadge}>{activeFilterCount}</span>
          </button>
        </div>

        {/* Desktop Filters */}
        <div style={styles.desktopFilters}>
          <select
            style={styles.filterSelect}
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
            style={styles.filterSelect}
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
            style={styles.filterInput}
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Price"
            style={styles.filterInput}
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />

          <select
            style={styles.filterSelect}
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
              style={styles.clearFiltersButton}
              onClick={clearAllFilters}
            >
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Mobile Filters Panel */}
        <div style={styles.mobileFiltersPanel}>
          <div style={styles.mobileFiltersHeader}>
            <span style={styles.mobileFiltersTitle}>Filter Items</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                style={styles.clearFiltersButton}
                onClick={clearAllFilters}
              >
                Clear All
              </button>
              <button
                style={styles.closeButton}
                onClick={() => setShowMobileFilters(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={styles.mobileFiltersContent}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <select
                style={styles.filterSelect}
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
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Condition</label>
              <select
                style={styles.filterSelect}
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <option value="">All Conditions</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Price Range</label>
              <div style={styles.priceRange}>
                <input
                  type="number"
                  placeholder="Min $"
                  style={styles.filterInput}
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max $"
                  style={styles.filterInput}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select
                style={styles.filterSelect}
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-views">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section style={styles.resultsSection}>
        <div style={styles.resultsHeader}>
          <span style={styles.resultsCount}>
            Showing {items.length} of {pagination.total} items
          </span>
          {!isMobile && (
            <select
              style={styles.sortSelect}
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

        {/* Items Grid */}
        <div className="item-grid" style={styles.itemGrid}>
          {items.map((item) => (
            <div key={item._id} onClick={() => setSelectedItem(item)}>
              {/* Your existing item card component */}
              <div style={{
                backgroundColor: themeColors.cardBackground,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}>
                <div style={{
                  height: '150px',
                  backgroundColor: themeColors.secondary,
                  position: 'relative',
                  backgroundImage: item.images?.[0] ? `url(${item.images[0]})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: themeColors.primary,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}>
                    ${item.price}
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: themeColors.text,
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: themeColors.textSecondary,
                  }}>
                    {item.condition}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading items...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#EF4444' }}>{error}</p>
          </div>
        )}
      </section>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Home;