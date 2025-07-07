import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { itemsAPI } from '../../services/api';
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
  const [stats, setStats] = useState({
    active: 0,
    sold: 0,
    pending: 0,
    draft: 0,
    totalViews: 0,
    totalSaves: 0
  });
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

  // Helper function to determine item status
  const getItemStatus = (item) => {
    // If item already has a status field, use it
    if (item.status) {
      return item.status;
    }
    
    // Otherwise, derive it from other fields
    if (item.sold) return 'sold';
    if (item.active === false) return 'inactive';
    if (item.approved === false) return 'pending';
    if (item.draft === true) return 'draft';
    return 'active';
  };

  // Load items from API
  const loadItems = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pagination.limit,
        sort: sortBy === 'createdAt' ? '-createdAt' : 
              sortBy === 'price' ? '-price' :
              sortBy === 'views' ? '-views' :
              sortBy === 'saves' ? '-saves' : sortBy
      };

      // Add search if provided
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add category filter
      if (filterCategory !== 'all') {
        params.category = filterCategory;
      }

      // Add status filter
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      console.log('Loading items with params:', params);
      const response = await itemsAPI.getAllItems(params);
      
      if (response.data.success) {
        // Transform the data to include computed fields
        const transformedItems = response.data.data.map(item => ({
          id: item.id || item._id,
          _id: item._id || item.id,
          title: item.title || 'Untitled Item',
          description: item.description || '',
          price: item.price || 0,
          category: item.category || 'Uncategorized',
          condition: item.condition || 'Good',
          status: item.status || getItemStatus(item),
          listedDate: item.listedDate || item.createdAt,
          images: item.images || [],
          ageGroup: item.ageGroup || 'All Ages',
          brand: item.brand || '',
          seller: item.seller || item.user?.username || item.user?.firstName || 'Unknown',
          sellerId: item.sellerId || item.user?._id,
          views: item.views || 0,
          saves: item.saves || 0,
          featured: item.featured || false,
          thumbnail: item.thumbnail || item.images?.[0] || null,
          active: item.active !== false,
          approved: item.approved !== false,
          sold: item.sold || false
        }));

        setItems(transformedItems);
        
        // Calculate stats
        const newStats = transformedItems.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          acc.totalViews += item.views;
          acc.totalSaves += item.saves;
          return acc;
        }, { active: 0, sold: 0, pending: 0, draft: 0, inactive: 0, totalViews: 0, totalSaves: 0 });
        
        setStats(newStats);
        
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
      
      // Set empty data on error
      setItems([]);
      setStats({ active: 0, sold: 0, pending: 0, draft: 0, totalViews: 0, totalSaves: 0 });
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
      setCategories([
        'All Categories',
        'Strollers',
        'Car Seats', 
        'Furniture',
        'Clothing',
        'Feeding',
        'Carriers',
        'Toys',
        'Safety',
        'Bath & Care',
        'Nursery',
        'Diapering'
      ]);
    }
  };

  // Initial load
  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  // Reload when sort changes
  useEffect(() => {
    if (!loading) {
      loadItems(1);
    }
  }, [sortBy]);

  // Search debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (!loading) {
        loadItems(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filterCategory, filterStatus]);

  const handleItemAction = async (action, itemId) => {
    console.log(`${action} item ${itemId}`);
    try {
      switch (action) {
        case 'view':
          // Open item in new tab
          window.open(`/item/${itemId}`, '_blank');
          break;
          
        case 'edit':
          // Navigate to edit page or open edit modal
          window.location.href = `/admin/items/edit/${itemId}`;
          break;
          
        case 'delete':
          if (window.confirm('Are you sure you want to delete this item?')) {
            setLoading(true);
            const response = await itemsAPI.deleteItem(itemId);
            if (response.data.success) {
              alert('Item deleted successfully!');
              await loadItems(pagination.page);
            } else {
              throw new Error(response.data.message || 'Failed to delete item');
            }
          }
          break;
          
        case 'feature':
          // Toggle featured status
          setLoading(true);
          const item = items.find(i => i.id === itemId || i._id === itemId);
          const featuredResponse = await itemsAPI.updateItem(itemId, { 
            featured: !item.featured 
          });
          if (featuredResponse.data.success) {
            alert(`Item ${item.featured ? 'unfeatured' : 'featured'} successfully!`);
            await loadItems(pagination.page);
          }
          break;
          
        case 'approve':
          // Approve pending item
          setLoading(true);
          const approveResponse = await itemsAPI.updateItem(itemId, { 
            approved: true, 
            active: true,
            status: 'active'
          });
          if (approveResponse.data.success) {
            alert('Item approved successfully!');
            await loadItems(pagination.page);
          }
          break;
          
        case 'more':
          // Show more options menu (implement as needed)
          console.log('Show more options for item:', itemId);
          break;
          
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error(`Error performing ${action} on item ${itemId}:`, error);
      setError(`Failed to ${action} item. Please try again.`);
      setLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    console.log(`${action} items:`, selectedItems);
    
    if (selectedItems.length === 0) {
      alert('Please select items first');
      return;
    }
    
    try {
      setLoading(true);
      switch (action) {
        case 'feature':
          if (window.confirm(`Feature ${selectedItems.length} items?`)) {
            const promises = selectedItems.map(itemId => 
              itemsAPI.updateItem(itemId, { featured: true })
            );
            await Promise.all(promises);
            alert(`${selectedItems.length} items featured successfully!`);
          }
          break;
          
        case 'archive':
          if (window.confirm(`Archive ${selectedItems.length} items?`)) {
            const promises = selectedItems.map(itemId => 
              itemsAPI.updateItem(itemId, { active: false, status: 'inactive' })
            );
            await Promise.all(promises);
            alert(`${selectedItems.length} items archived successfully!`);
          }
          break;
          
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items? This cannot be undone.`)) {
            const promises = selectedItems.map(itemId => itemsAPI.deleteItem(itemId));
            await Promise.all(promises);
            alert(`${selectedItems.length} items deleted successfully!`);
          }
          break;
          
        case 'export':
          // Export selected items to CSV
          const itemsToExport = items.filter(item => 
            selectedItems.includes(item.id) || selectedItems.includes(item._id)
          );
          const csv = convertToCSV(itemsToExport);
          downloadCSV(csv, 'items-export.csv');
          setLoading(false);
          return; // Don't reload for export
          
        default:
          console.log('Unknown bulk action:', action);
      }
      
      // Refresh data and clear selection
      await loadItems(pagination.page);
      setSelectedItems([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      setError(`Failed to ${action} items. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const convertToCSV = (items) => {
    const headers = ['ID', 'Title', 'Category', 'Price', 'Condition', 'Status', 'Seller', 'Views', 'Saves', 'Listed Date'];
    const rows = items.map(item => [
      item._id || item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      item.category,
      item.price,
      item.condition,
      item.status,
      item.seller,
      item.views,
      item.saves,
      formatDate(item.listedDate)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddItem = () => {
    window.location.href = '/admin/items/create';
  };

  const handleExportAll = () => {
    const csv = convertToCSV(items);
    downloadCSV(csv, `all-items-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleRefresh = () => {
    loadItems(pagination.page);
  };

  const handlePageChange = (newPage) => {
    loadItems(newPage);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'sold': return '#3b82f6';
      case 'draft': return '#f59e0b';
      case 'pending': return '#8b5cf6';
      case 'inactive': return '#6b7280';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'sold': return DollarSign;
      case 'draft': return Clock;
      case 'pending': return Clock;
      case 'inactive': return XCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getConditionColor = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('new') || conditionLower.includes('excellent')) return '#10b981';
    if (conditionLower.includes('good')) return '#3b82f6';
    if (conditionLower.includes('fair')) return '#f59e0b';
    if (conditionLower.includes('poor')) return '#ef4444';
    return '#6b7280';
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

    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px',
      color: themeColors.textSecondary,
    },

    errorContainer: {
      backgroundColor: '#fee',
      color: '#c00',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
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
      overflow: 'hidden',
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
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
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
      textTransform: 'capitalize',
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

    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      padding: '16px',
      borderTop: `1px solid ${themeColors.secondary}`,
    },

    pageButton: {
      padding: '6px 12px',
      backgroundColor: 'transparent',
      border: `1px solid ${themeColors.secondary}`,
      borderRadius: '6px',
      color: themeColors.text,
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease',
    },

    activePageButton: {
      backgroundColor: themeColors.primary,
      color: 'white',
      borderColor: themeColors.primary,
    },
  };

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.errorContainer}>
          <AlertTriangle size={16} />
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

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
              <option value="inactive">Inactive</option>
            </select>

            <select 
              style={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Listed Date</option>
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

          <button 
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {!isMobile && 'Refresh'}
          </button>

          <button 
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleExportAll}
          >
            <Download size={16} />
            {!isMobile && 'Export'}
          </button>

          <button 
            style={styles.button}
            onClick={handleAddItem}
          >
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
          <option value="inactive">Inactive</option>
        </select>

        <select 
          style={styles.filterSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Sort by Listed Date</option>
          <option value="price">Sort by Price</option>
          <option value="views">Sort by Views</option>
          <option value="saves">Sort by Saves</option>
        </select>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.active}</div>
          <div style={styles.statLabel}>Active Items</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.sold}</div>
          <div style={styles.statLabel}>Sold Items</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalViews}</div>
          <div style={styles.statLabel}>Total Views</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalSaves}</div>
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
        <button 
          style={{ ...styles.button, ...styles.secondaryButton, padding: '6px 12px' }}
          onClick={() => handleBulkAction('export')}
        >
          <Download size={14} />
          Export Selected
        </button>
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader size={32} className="animate-spin" />
            <span style={{ marginLeft: '12px' }}>Loading items...</span>
          </div>
        ) : items.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={48} />
            <p>No items found matching your criteria.</p>
            <button 
              style={{ ...styles.button, marginTop: '16px' }}
              onClick={handleAddItem}
            >
              <Plus size={16} />
              Add First Item
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>
                    <input 
                      type="checkbox"
                      checked={selectedItems.length === items.length && items.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(items.map(item => item._id || item.id));
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
                {items.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  const itemId = item._id || item.id;
                  return (
                    <tr key={itemId}>
                      <td style={styles.td}>
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(itemId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, itemId]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== itemId));
                            }
                          }}
                        />
                      </td>
                      <td style={styles.td}>
                        <div style={styles.itemInfo}>
                          <div style={styles.itemImage}>
                            {item.thumbnail ? (
                              <img 
                                src={item.thumbnail} 
                                alt={item.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Image size={20} />
                            )}
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
                            onClick={() => handleItemAction('view', itemId)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="View Item"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            style={styles.actionButton}
                            onClick={() => handleItemAction('edit', itemId)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Edit Item"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            style={styles.actionButton}
                            onClick={() => handleItemAction('feature', itemId)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title={item.featured ? 'Unfeature Item' : 'Feature Item'}
                          >
                            <Star size={16} fill={item.featured ? themeColors.primary : 'none'} />
                          </button>
                          {item.status === 'pending' && (
                            <button 
                              style={styles.actionButton}
                              onClick={() => handleItemAction('approve', itemId)}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              title="Approve Item"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button 
                            style={styles.actionButton}
                            onClick={() => handleItemAction('delete', itemId)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Delete Item"
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
              {items.map((item) => {
                const StatusIcon = getStatusIcon(item.status);
                const itemId = item._id || item.id;
                return (
                  <div key={itemId} style={styles.mobileCard}>
                    <div style={styles.mobileCardHeader}>
                      <div style={styles.mobileCardItem}>
                        <div style={styles.itemImage}>
                          {item.thumbnail ? (
                            <img 
                              src={item.thumbnail} 
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Image size={20} />
                          )}
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
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(itemId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, itemId]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== itemId));
                          }
                        }}
                      />
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
                        onClick={() => handleItemAction('view', itemId)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button 
                        style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                        onClick={() => handleItemAction('edit', itemId)}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleItemAction('more', itemId)}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={styles.pagination}>
                <button 
                  style={styles.pageButton}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      style={{
                        ...styles.pageButton,
                        ...(pageNum === pagination.page ? styles.activePageButton : {})
                      }}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {pagination.pages > 5 && (
                  <>
                    <span style={{ color: themeColors.textSecondary }}>...</span>
                    <button
                      style={styles.pageButton}
                      onClick={() => handlePageChange(pagination.pages)}
                    >
                      {pagination.pages}
                    </button>
                  </>
                )}
                
                <button 
                  style={styles.pageButton}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ItemsTab;