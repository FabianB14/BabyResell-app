import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Archive,
  DollarSign,
  Tag,
  Calendar,
  Image as ImageIcon,
  Package,
  TrendingUp,
  Heart
} from 'lucide-react';

const ItemsTab = () => {
  const { themeColors } = useTheme();
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Baby Carrier',
      category: 'Carriers & Wraps',
      price: 45.00,
      condition: 'Like New',
      status: 'active',
      listedDate: '2025-06-10',
      views: 125,
      saves: 8,
      seller: 'parent123',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 2,
      title: 'Wooden Crib',
      category: 'Nursery',
      price: 120.00,
      condition: 'Good',
      status: 'active',
      listedDate: '2025-06-08',
      views: 89,
      saves: 12,
      seller: 'seller456',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 3,
      title: 'Baby Bottle Set',
      category: 'Feeding',
      price: 25.00,
      condition: 'New',
      status: 'sold',
      listedDate: '2025-06-05',
      views: 203,
      saves: 15,
      seller: 'parent123',
      image: 'https://via.placeholder.com/60'
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  
  const styles = {
    container: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${themeColors.secondary}`,
    },
    
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: themeColors.text,
    },
    
    controls: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: themeColors.secondary,
      padding: '8px 16px',
      borderRadius: '8px',
      minWidth: '250px',
    },
    
    searchInput: {
      background: 'none',
      border: 'none',
      color: themeColors.text,
      fontSize: '14px',
      outline: 'none',
      width: '100%',
    },
    
    filterSelect: {
      padding: '8px 16px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '8px',
      color: themeColors.text,
      fontSize: '14px',
      cursor: 'pointer',
    },
    
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      backgroundColor: themeColors.primary,
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    
    tableHeader: {
      borderBottom: `1px solid ${themeColors.secondary}`,
    },
    
    th: {
      padding: '12px',
      textAlign: 'left',
      color: themeColors.textSecondary,
      fontSize: '14px',
      fontWeight: '500',
    },
    
    td: {
      padding: '16px 12px',
      color: themeColors.text,
      fontSize: '14px',
      borderBottom: `1px solid ${themeColors.secondary}`,
    },
    
    itemInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    
    itemImage: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      objectFit: 'cover',
    },
    
    itemDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    
    itemTitle: {
      fontWeight: '500',
      color: themeColors.text,
    },
    
    itemCategory: {
      fontSize: '12px',
      color: themeColors.textSecondary,
    },
    
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
    },
    
    activeStatus: {
      backgroundColor: '#10b98120',
      color: '#10b981',
    },
    
    soldStatus: {
      backgroundColor: '#f59e0b20',
      color: '#f59e0b',
    },
    
    draftStatus: {
      backgroundColor: '#6b728020',
      color: '#6b7280',
    },
    
    actions: {
      display: 'flex',
      gap: '8px',
    },
    
    actionButton: {
      padding: '6px',
      backgroundColor: 'transparent',
      border: 'none',
      color: themeColors.textSecondary,
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
    },
    
    statsSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    
    statCard: {
      backgroundColor: themeColors.secondary,
      padding: '16px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    
    statIcon: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      backgroundColor: themeColors.background,
    },
    
    statContent: {
      flex: 1,
    },
    
    statLabel: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      marginBottom: '4px',
    },
    
    statValue: {
      fontSize: '20px',
      fontWeight: '600',
      color: themeColors.text,
    },
    
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    
    metricsContainer: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
    },
    
    metric: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: themeColors.textSecondary,
    },
  };
  
  const categories = [
    'All Categories',
    'Clothes & Shoes',
    'Toys & Games',
    'Feeding',
    'Nursery',
    'Carriers & Wraps',
    'Strollers & Car Seats',
    'Other'
  ];
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    sold: items.filter(i => i.status === 'sold').length,
    totalValue: items.reduce((sum, i) => sum + i.price, 0)
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredItems.map(i => i.id));
    } else {
      setSelectedItems([]);
    }
  };
  
  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };
  
  return (
    <div>
      {/* Stats Section */}
      <div style={styles.statsSection}>
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#3b82f620',
            color: '#3b82f6'
          }}>
            <Package size={20} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Total Items</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#10b98120',
            color: '#10b981'
          }}>
            <Tag size={20} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Active Listings</div>
            <div style={styles.statValue}>{stats.active}</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#f59e0b20',
            color: '#f59e0b'
          }}>
            <Archive size={20} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Sold Items</div>
            <div style={styles.statValue}>{stats.sold}</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#8b5cf620',
            color: '#8b5cf6'
          }}>
            <DollarSign size={20} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Total Value</div>
            <div style={styles.statValue}>${stats.totalValue.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      {/* Main Table Section */}
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Item Management</h2>
          <div style={styles.controls}>
            <div style={styles.searchBar}>
              <Search size={18} color={themeColors.textSecondary} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <select 
              style={styles.filterSelect}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select 
              style={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
            </select>
            <button style={styles.addButton}>
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    onChange={handleSelectAll}
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  />
                </th>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Condition</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Listed</th>
                <th style={styles.th}>Metrics</th>
                <th style={styles.th}>Seller</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.itemInfo}>
                      <img 
                        src={item.image} 
                        alt={item.title}
                        style={styles.itemImage}
                      />
                      <div style={styles.itemDetails}>
                        <span style={styles.itemTitle}>{item.title}</span>
                        <span style={styles.itemCategory}>{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>${item.price.toFixed(2)}</td>
                  <td style={styles.td}>{item.condition}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(item.status === 'active' ? styles.activeStatus : 
                         item.status === 'sold' ? styles.soldStatus : 
                         styles.draftStatus)
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color={themeColors.textSecondary} />
                      {new Date(item.listedDate).toLocaleDateString()}
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
                  <td style={styles.td}>{item.seller}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button 
                        style={styles.actionButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        style={styles.actionButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        style={styles.actionButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemsTab;