import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { itemsAPI } from '../../services/api'; // Import your existing API
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Heart,
  DollarSign,
  Tag,
  Star,
  MoreVertical,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Image,
  RefreshCw,
  Loader,
  AlertTriangle
} from 'lucide-react';

const ItemsTab = () => {
  const { themeColors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load items from API
  const loadItems = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pagination.limit,
        sort: sortBy === 'createdAt' ? '-createdAt' : sortBy
      };

      // Add search if provided
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add category filter
      if (filterCategory !== 'all') {
        params.category = filterCategory;
      }

      const response = await itemsAPI.getAllItems(params);
      
      if (response.data.success) {
        // Transform the data to include computed fields
        const transformedItems = response.data.data.map(item => ({
          id: item._id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          condition: item.condition,
          status: getItemStatus(item), // Custom function to determine status
          listedDate: item.createdAt,
          images: item.images || [],
          ageGroup: item.ageGroup,
          brand: item.brand,
          seller: item.user?.username || item.user?.firstName || 'Unknown',
          sellerId: item.user?._id,
          views: item.views || 0,
          saves: item.saves?.length || 0,
          featured: item.featured || false,
          thumbnail: item.images?.[0] || null
        }));

        setItems(transformedItems);
        setPagination({
          page: response.data.pagination?.page || page,
          limit: response.data.pagination?.limit || 20,
          total: response.data.pagination?.total || transformedItems.length,
          pages: response.data.pagination?.pages || Math.ceil(transformedItems.length / 20)
        });
      }
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await itemsAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.warn('Failed to load categories:', error);
      // Fallback categories
      setCategories(['Strollers', 'Furniture', 'Clothing', 'Feeding', 'Carriers', 'Toys', 'Safety']);
    }
  };

  // Helper function to determine item status
  const getItemStatus = (item) => {
    if (item.sold) return 'sold';
    if (item.active === false) return 'inactive';
    if (item.approved === false) return 'pending';
    return 'active';
  };

  // Initial load
  useEffect(() => {
    loadItems();
    loadCategories();
  }, [sortBy]);

  // Search debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '' || items.length === 0) {
        loadItems(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filterCategory]);

  const filteredItems = items.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesStatus;
  });

  const handleItemAction = async (action, itemId) => {
    console.log(`${action} item ${itemId}`);
    try {
      switch (action) {
        case 'view':
          // Navigate to item detail or open modal
          console.log('View item:', itemId);
          break;
        case 'edit':
          // Open edit modal or navigate to edit page
          console.log('Edit item:', itemId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this item?')) {
            await itemsAPI.deleteItem(itemId);
            await loadItems(pagination.page);
          }
          break;
        case 'feature':
          // TODO: Implement item featuring
          console.log('Feature item:', itemId);
          break;
        case 'approve':
          // TODO: Implement item approval
          console.log('Approve item:', itemId);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error(`Error performing ${action} on item ${itemId}:`, error);
      setError(`Failed to ${action} item. Please try again.`);
    }
  };

  const handleBulkAction = async (action) => {
    console.log(`${action} items:`, selectedItems);
    try {
      switch (action) {
        case 'feature':
          // TODO: Implement bulk featuring
          console.log('Bulk feature items:', selectedItems);
          break;
        case 'archive':
          // TODO: Implement bulk archiving
          console.log('Bulk archive items:', selectedItems);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
            // TODO: Implement bulk deletion
            console.log('Bulk delete items:', selectedItems);
          }
          break;
        case 'export':
          // TODO: Implement item export
          console.log('Export items:', selectedItems);
          break;
        default:
          console.log('Unknown bulk action:', action);
      }
      
      // Refresh data after bulk action
      await loadItems(pagination.page);
      setSelectedItems([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      setError(`Failed to ${action} items. Please try again.`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'sold': return '#3b82f6';
      case 'draft': return '#f59e0b';
      case 'pending': return '#8b5cf6';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'sold': return CheckCircle;
      case 'draft': return Clock;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '24px',
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '16px' : '24px',
    },

    title: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: 'bold',
      color: themeColors.text,
      margin: 0,
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      width: isMobile ? '100%' : 'auto',
    },

    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: themeColors.secondary,
      padding: '8px 12px',
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      minWidth: isMobile ? '100%' : '250px',
      order: isMobile ? 1 : 0,
    },

    searchInput: {
      background: 'none',
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      color: themeColors.text,
      width: '100%',
      placeholder: themeColors.textSecondary,
    },

    filtersContainer: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    mobileFiltersButton: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      order: 2,
    },

    mobileFilters: {
      display: isMobile && showMobileFilters ? 'flex' : 'none',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      backgroundColor: themeColors.cardBackground,
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      marginBottom: '16px',
    },

    filterSelect: {
      padding: '8px 12px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      cursor: 'pointer',
      minWidth: isMobile ? '100%' : '120px',
    },

    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: isMobile ? '8px 12px' : '8px 16px',
      backgroundColor: themeColors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
    },

    secondaryButton: {
      backgroundColor: 'transparent',
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.secondary}`,
    },

    statsRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '8px' : '12px',
      marginBottom: isMobile ? '16px' : '20px',
    },

    statCard: {
      backgroundColor: themeColors.cardBackground,
      padding: isMobile ? '12px' : '16px',
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      textAlign: 'center',
    },

    statValue: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: '4px',
    },

    statLabel: {
      fontSize: isMobile ? '11px' : '12px',
      color: themeColors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },

    bulkActions: {
      display: selectedItems.length > 0 ? 'flex' : 'none',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: themeColors.cardBackground,
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      marginBottom: '16px',
      flexWrap: 'wrap',
    },

    tableContainer: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      overflow: 'hidden',
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      display: isMobile ? 'none' : 'table',
    },

    tableHeader: {
      backgroundColor: themeColors.secondary,
    },

    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: '600',
      color: themeColors.text,
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },

    td: {
      padding: '16px',
      borderBottom: `1px solid ${themeColors.secondary}`,
      color: themeColors.text,
      fontSize: '14px',
      verticalAlign: 'middle',
    },

    itemInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    itemImage: {
      width: '50px',
      height: '50px',
      borderRadius: '8px',
      backgroundColor: themeColors.secondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: themeColors.textSecondary,
      flexShrink: 0,
    },

    itemDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: 0,
    },

    itemTitle: {
      fontWeight: '500',
      color: themeColors.text,
      fontSize: '14px',
      lineHeight: '1.3',
    },

    itemMeta: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    statusBadge: (status) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      backgroundColor: `${getStatusColor(status)}15`,
      color: getStatusColor(status),
    }),

    conditionBadge: (condition) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 6px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '500',
      backgroundColor: `${getConditionColor(condition)}15`,
      color: getConditionColor(condition),
      textTransform: 'capitalize',
    }),

    metricsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    metric: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: themeColors.textSecondary,
    },

    actionButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      color: themeColors.textSecondary,
      transition: 'all 0.2s ease',
    },

    mobileCards: {
      display: isMobile ? 'flex' : 'none',
      flexDirection: 'column',
      gap: '12px',
    },

    mobileCard: {
      backgroundColor: themeColors.cardBackground,
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '12px',
      padding: '16px',
    },

    mobileCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },

    mobileCardItem: {
      display: 'flex',
      gap: '12px',
      flex: 1,
    },

    mobileCardContent: {
      flex: 1,
      minWidth: 0,
    },

    mobileCardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: '4px',
      lineHeight: '1.3',
    },

    mobileCardPrice: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: themeColors.primary,
      marginBottom: '8px',
    },

    mobileCardMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '12px',
    },

    mobileCardDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '12px',
    },

    mobileCardStat: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },

    mobileCardLabel: {
      fontSize: '11px',
      color: themeColors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },

    mobileCardValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: themeColors.text,
    },

    mobileCardActions: {
      display: 'flex',
      gap: '8px',
      paddingTop: '12px',
      borderTop: `1px solid ${themeColors.secondary}`,
    },

    featuredBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '500',
      backgroundColor: '#fbbf2415',
      color: '#f59e0b',
    },

    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: themeColors.textSecondary,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Item Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <Search size={16} color={themeColors.textSecondary} />
            <input
              type="text"
              placeholder="Search items..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Desktop Filters */}
          <div style={styles.filtersContainer}>
            <select 
              style={styles.filterSelect}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select 
              style={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
            </select>

            <select 
              style={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="listedDate">Listed Date</option>
              <option value="price">Price</option>
              <option value="views">Views</option>
              <option value="saves">Saves</option>
            </select>
          </div>

          {/* Mobile Filters Button */}
          <button 
            style={styles.mobileFiltersButton}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter size={16} />
            Filters
          </button>

          <button style={{ ...styles.button, ...styles.secondaryButton }}>
            <Download size={16} />
            {!isMobile && 'Export'}
          </button>

          <button style={styles.button}>
            <Plus size={16} />
            {!isMobile && 'Add Item'}
          </button>
        </div>
      </div>

      {/* Mobile Filters */}
      <div style={styles.mobileFilters}>
        <select 
          style={styles.filterSelect}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.slice(1).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select 
          style={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="sold">Sold</option>
          <option value="pending">Pending</option>
        </select>

        <select 
          style={styles.filterSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="listedDate">Sort by Listed Date</option>
          <option value="price">Sort by Price</option>
          <option value="views">Sort by Views</option>
          <option value="saves">Sort by Saves</option>
        </select>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{items.filter(i => i.status === 'active').length}</div>
          <div style={styles.statLabel}>Active Items</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{items.filter(i => i.status === 'sold').length}</div>
          <div style={styles.statLabel}>Sold Items</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{items.reduce((sum, i) => sum + i.views, 0)}</div>
          <div style={styles.statLabel}>Total Views</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{items.reduce((sum, i) => sum + i.saves, 0)}</div>
          <div style={styles.statLabel}>Total Saves</div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div style={styles.bulkActions}>
        <span style={{ fontSize: '14px', color: themeColors.text }}>
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </span>
        <button 
          style={{ ...styles.button, ...styles.secondaryButton, padding: '6px 12px' }}
          onClick={() => handleBulkAction('feature')}
        >
          <Star size={14} />
          Feature
        </button>
        <button 
          style={{ ...styles.button, ...styles.secondaryButton, padding: '6px 12px' }}
          onClick={() => handleBulkAction('archive')}
        >
          <Package size={14} />
          Archive
        </button>
        <button 
          style={{ ...styles.button, ...styles.secondaryButton, padding: '6px 12px' }}
          onClick={() => handleBulkAction('delete')}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div style={styles.tableContainer}>
        {/* Desktop Table */}
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filteredItems.map(item => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Listed</th>
              <th style={styles.th}>Metrics</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              return (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.itemInfo}>
                      <div style={styles.itemImage}>
                        <Image size={20} />
                      </div>
                      <div style={styles.itemDetails}>
                        <div style={styles.itemTitle}>
                          {item.title}
                          {item.featured && (
                            <span style={styles.featuredBadge}>
                              <Star size={8} />
                              Featured
                            </span>
                          )}
                        </div>
                        <div style={styles.itemMeta}>
                          <span>{item.category}</span>
                          <span style={styles.conditionBadge(item.condition)}>
                            {item.condition}
                          </span>
                          <span>by {item.seller}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600', color: themeColors.primary }}>
                      ${item.price}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(item.status)}>
                      <StatusIcon size={12} />
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color={themeColors.textSecondary} />
                      {formatDate(item.listedDate)}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.metricsContainer}>
                      <div style={styles.metric}>
                        <Eye size={14} />
                        {item.views}
                      </div>
                      <div style={styles.metric}>
                        <Heart size={14} />
                        {item.saves}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleItemAction('view', item.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleItemAction('edit', item.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleItemAction('delete', item.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div style={styles.mobileCards}>
          {filteredItems.length === 0 ? (
            <div style={styles.emptyState}>
              <Package size={48} />
              <p>No items found matching your criteria.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              return (
                <div key={item.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardHeader}>
                    <div style={styles.mobileCardItem}>
                      <div style={styles.itemImage}>
                        <Image size={20} />
                      </div>
                      <div style={styles.mobileCardContent}>
                        <div style={styles.mobileCardTitle}>
                          {item.title}
                          {item.featured && (
                            <span style={styles.featuredBadge}>
                              <Star size={8} />
                            </span>
                          )}
                        </div>
                        <div style={styles.mobileCardPrice}>${item.price}</div>
                        <div style={styles.mobileCardMeta}>
                          <span style={styles.statusBadge(item.status)}>
                            <StatusIcon size={10} />
                            {item.status}
                          </span>
                          <span style={styles.conditionBadge(item.condition)}>
                            {item.condition}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.mobileCardDetails}>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Category</div>
                      <div style={styles.mobileCardValue}>{item.category}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Listed</div>
                      <div style={styles.mobileCardValue}>{formatDate(item.listedDate)}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Views</div>
                      <div style={styles.mobileCardValue}>{item.views}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Saves</div>
                      <div style={styles.mobileCardValue}>{item.saves}</div>
                    </div>
                  </div>

                  <div style={styles.mobileCardActions}>
                    <button 
                      style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                      onClick={() => handleItemAction('view', item.id)}
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button 
                      style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                      onClick={() => handleItemAction('edit', item.id)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleItemAction('more', item.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemsTab;