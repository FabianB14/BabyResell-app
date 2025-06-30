import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { userAPI } from '../../services/api'; 
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Package,
  CreditCard,
  MoreVertical,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader
} from 'lucide-react';

const UsersTab = () => {
  const { themeColors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Load users from API
  const loadUsers = async (page = 1) => {
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

      const response = await userAPI.getAllUsers(params);
      
      if (response.data.success) {
        // Transform the data to include computed fields
        const transformedUsers = response.data.data.map(user => ({
          id: user._id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          email: user.email,
          username: user.username,
          status: user.isActive !== false ? 'active' : 'suspended',
          joinDate: user.createdAt,
          lastActive: user.lastLoginAt || user.updatedAt,
          avatar: user.profileImage,
          location: user.location || 'Not specified',
          verified: user.isEmailVerified || false,
          isAdmin: user.isAdmin || false,
          // These would need to be calculated or fetched from additional endpoints
          items: 0, // TODO: Add actual count from pins/items
          transactions: 0, // TODO: Add actual transaction count
          revenue: 0 // TODO: Add actual revenue calculation
        }));

        setUsers(transformedUsers);
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit || 20,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [sortBy]);

  // Search debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '' || users.length === 0) {
        loadUsers(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const filteredUsers = users.filter(user => {
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesFilter;
  });

  const handleUserAction = async (action, userId) => {
  console.log(`${action} user ${userId}`);
  try {
    switch (action) {
      case 'view':
        // Open user profile in new tab
        window.open(`/user/${userId}`, '_blank');
        break;
        
      case 'edit':
        // Navigate to edit user page
        window.location.href = `/admin/users/edit/${userId}`;
        break;
        
      case 'delete':
        if (window.confirm('Are you sure you want to delete this user? This will also delete all their listings.')) {
          const response = await userAPI.deleteUser(userId);
          if (response.data.success) {
            alert('User deleted successfully!');
            await loadUsers(pagination.page);
          }
        }
        break;
        
      case 'suspend':
        if (window.confirm('Suspend this user account?')) {
          const response = await userAPI.updateUser(userId, { isActive: false, status: 'suspended' });
          if (response.data.success) {
            alert('User suspended successfully!');
            await loadUsers(pagination.page);
          }
        }
        break;
        
      case 'activate':
        const response = await userAPI.updateUser(userId, { isActive: true, status: 'active' });
        if (response.data.success) {
          alert('User activated successfully!');
          await loadUsers(pagination.page);
        }
        break;
        
      default:
        console.log('Unknown action:', action);
    }
  } catch (error) {
    console.error(`Error performing ${action} on user ${userId}:`, error);
    setError(`Failed to ${action} user. Please try again.`);
  }
};

  const handleBulkAction = async (action) => {
  if (selectedUsers.length === 0) {
    alert('Please select users first');
    return;
  }
  
  console.log(`${action} users:`, selectedUsers);
  try {
    switch (action) {
      case 'activate':
        if (window.confirm(`Activate ${selectedUsers.length} users?`)) {
          const promises = selectedUsers.map(userId => 
            userAPI.updateUser(userId, { isActive: true, status: 'active' })
          );
          await Promise.all(promises);
          alert(`${selectedUsers.length} users activated successfully!`);
        }
        break;
        
      case 'suspend':
        if (window.confirm(`Suspend ${selectedUsers.length} users?`)) {
          const promises = selectedUsers.map(userId => 
            userAPI.updateUser(userId, { isActive: false, status: 'suspended' })
          );
          await Promise.all(promises);
          alert(`${selectedUsers.length} users suspended successfully!`);
        }
        break;
        
      case 'export':
        // Export users to CSV
        const usersToExport = users.filter(user => selectedUsers.includes(user.id));
        const csv = convertUsersToCSV(usersToExport);
        downloadCSV(csv, 'users-export.csv');
        break;
        
      default:
        console.log('Unknown bulk action:', action);
    }
    
    // Refresh and clear selection
    await loadUsers(pagination.page);
    setSelectedUsers([]);
  } catch (error) {
    console.error(`Error performing bulk ${action}:`, error);
    setError(`Failed to ${action} users. Please try again.`);
  }
};

const convertUsersToCSV = (users) => {
  const headers = ['ID', 'Name', 'Email', 'Username', 'Status', 'Join Date', 'Location'];
  const rows = users.map(user => [
    user.id,
    user.name,
    user.email,
    user.username,
    user.status,
    new Date(user.joinDate).toLocaleDateString(),
    user.location
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Utility function to trigger CSV download
const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const handleImportUsers = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/admin/users/import', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (response.ok) {
          alert('Users imported successfully!');
          await loadUsers(1);
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        alert('Failed to import users. Please check the file format.');
      }
    }
  };
  input.click();
};

const handleAddUser = () => {
  window.location.href = '/admin/users/create';
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
      case 'inactive': return '#f59e0b';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return AlertTriangle;
      case 'suspended': return XCircle;
      default: return AlertTriangle;
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

    bulkActions: {
      display: selectedUsers.length > 0 ? 'flex' : 'none',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: themeColors.cardBackground,
      borderRadius: '8px',
      border: `1px solid ${themeColors.secondary}`,
      marginBottom: '16px',
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

    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      backgroundColor: themeColors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '16px',
    },

    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },

    userName: {
      fontWeight: '500',
      color: themeColors.text,
    },

    userEmail: {
      fontSize: '12px',
      color: themeColors.textSecondary,
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

    mobileCardUser: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1,
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

    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: themeColors.textSecondary,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>User Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <Search size={16} color={themeColors.textSecondary} />
            <input
              type="text"
              placeholder="Search users..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Desktop Filters */}
          <div style={styles.filtersContainer}>
            <select 
              style={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select 
              style={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="joinDate">Join Date</option>
              <option value="name">Name</option>
              <option value="revenue">Revenue</option>
              <option value="lastActive">Last Active</option>
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
            <Upload size={16} />
            {!isMobile && 'Import'}
          </button>

          <button style={styles.button}>
            <Plus size={16} />
            {!isMobile && 'Add User'}
          </button>
        </div>
      </div>

      {/* Mobile Filters */}
      <div style={styles.mobileFilters}>
        <select 
          style={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>

        <select 
          style={styles.filterSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="joinDate">Sort by Join Date</option>
          <option value="name">Sort by Name</option>
          <option value="revenue">Sort by Revenue</option>
          <option value="lastActive">Sort by Last Active</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <div style={styles.bulkActions}>
        <span style={{ fontSize: '14px', color: themeColors.text }}>
          {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
        </span>
        <button 
          style={{ ...styles.button, ...styles.secondaryButton, padding: '6px 12px' }}
          onClick={() => handleBulkAction('activate')}
        >
          <UserCheck size={14} />
          Activate
        </button>
        <button 
          style={{ ...styles.button, ...styles.secondaryButton, padding: '6px 12px' }}
          onClick={() => handleBulkAction('suspend')}
        >
          <UserX size={14} />
          Suspend
        </button>
        <button 
          style={{ ...styles.button, ...styles.secondaryButton, padding: '6px 12px' }}
          onClick={() => handleBulkAction('export')}
        >
          <Download size={14} />
          Export
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
                      setSelectedUsers(filteredUsers.map(user => user.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                />
              </th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Join Date</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Revenue</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const StatusIcon = getStatusIcon(user.status);
              return (
                <tr key={user.id}>
                  <td style={styles.td}>
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.userInfo}>
                      <div style={styles.avatar}>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div style={styles.userDetails}>
                        <div style={styles.userName}>{user.name}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(user.status)}>
                      <StatusIcon size={12} />
                      {user.status}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(user.joinDate)}</td>
                  <td style={styles.td}>{user.items}</td>
                  <td style={styles.td}>${user.revenue.toFixed(2)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleUserAction('view', user.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleUserAction('edit', user.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleUserAction('delete', user.id)}
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
          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <Users size={48} />
              <p>No users found matching your criteria.</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const StatusIcon = getStatusIcon(user.status);
              return (
                <div key={user.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardHeader}>
                    <div style={styles.mobileCardUser}>
                      <div style={styles.avatar}>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div style={styles.userDetails}>
                        <div style={styles.userName}>{user.name}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                    <span style={styles.statusBadge(user.status)}>
                      <StatusIcon size={12} />
                      {user.status}
                    </span>
                  </div>

                  <div style={styles.mobileCardDetails}>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Join Date</div>
                      <div style={styles.mobileCardValue}>{formatDate(user.joinDate)}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Items</div>
                      <div style={styles.mobileCardValue}>{user.items}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Revenue</div>
                      <div style={styles.mobileCardValue}>${user.revenue.toFixed(2)}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Last Active</div>
                      <div style={styles.mobileCardValue}>{formatDate(user.lastActive)}</div>
                    </div>
                  </div>

                  <div style={styles.mobileCardActions}>
                    <button 
                      style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                      onClick={() => handleUserAction('view', user.id)}
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button 
                      style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                      onClick={() => handleUserAction('edit', user.id)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleUserAction('more', user.id)}
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

export default UsersTab;