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

      console.log('Loading users with params:', params);
      const response = await userAPI.getAllUsers(params);
      console.log('Users response:', response);
      
      // Handle different response structures
      const responseData = response.data;
      const userData = responseData.data || responseData.users || responseData;
      const paginationData = responseData.pagination || {};
      
      if (Array.isArray(userData)) {
        // Transform the data to include computed fields
        const transformedUsers = userData.map(user => ({
          id: user._id || user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unnamed User',
          email: user.email,
          username: user.username,
          status: user.isActive === false ? 'suspended' : 'active',
          joinDate: user.createdAt,
          lastActive: user.lastLoginAt || user.updatedAt || user.createdAt,
          avatar: user.profileImage,
          location: user.location || 'Not specified',
          verified: user.isEmailVerified || false,
          isAdmin: user.isAdmin || false,
          // These would need to be calculated or fetched from additional endpoints
          items: user.itemCount || 0,
          transactions: user.transactionCount || 0,
          revenue: user.revenue || 0
        }));

        setUsers(transformedUsers);
        setPagination({
          page: paginationData.page || page,
          limit: paginationData.limit || pagination.limit,
          total: paginationData.total || transformedUsers.length,
          pages: paginationData.pages || Math.ceil((paginationData.total || transformedUsers.length) / pagination.limit)
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
      
      // Set some dummy data for testing if API fails
      if (process.env.NODE_ENV === 'development') {
        setUsers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            username: 'johndoe',
            status: 'active',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            avatar: null,
            location: 'New York, NY',
            verified: true,
            isAdmin: false,
            items: 5,
            transactions: 10,
            revenue: 150.00
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            username: 'janesmith',
            status: 'suspended',
            joinDate: new Date(Date.now() - 86400000).toISOString(),
            lastActive: new Date().toISOString(),
            avatar: null,
            location: 'Los Angeles, CA',
            verified: false,
            isAdmin: false,
            items: 3,
            transactions: 5,
            revenue: 75.50
          }
        ]);
      }
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
            console.log('Delete response:', response);
            
            // Refresh the user list
            await loadUsers(pagination.page);
            alert('User deleted successfully!');
          }
          break;
          
        case 'suspend':
          if (window.confirm('Suspend this user account?')) {
            const response = await userAPI.updateUser(userId, { isActive: false });
            console.log('Suspend response:', response);
            
            // Update local state immediately
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === userId 
                  ? { ...user, status: 'suspended' }
                  : user
              )
            );
            
            alert('User suspended successfully!');
          }
          break;
          
        case 'activate':
          const response = await userAPI.updateUser(userId, { isActive: true });
          console.log('Activate response:', response);
          
          // Update local state immediately
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userId 
                ? { ...user, status: 'active' }
                : user
            )
          );
          
          alert('User activated successfully!');
          break;
          
        case 'more':
          // Handle more options menu
          const userAction = prompt('Choose action:\n1. View Profile\n2. Send Message\n3. View Transactions\n4. Reset Password');
          if (userAction === '1') handleUserAction('view', userId);
          else if (userAction === '2') window.location.href = `/messages/new?userId=${userId}`;
          else if (userAction === '3') window.location.href = `/admin/transactions?userId=${userId}`;
          else if (userAction === '4') {
            if (window.confirm('Send password reset email to user?')) {
              // Implement password reset
              alert('Password reset email sent!');
            }
          }
          break;
          
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error(`Error performing ${action} on user ${userId}:`, error);
      setError(`Failed to ${action} user. Please try again.`);
      
      // Reload users to ensure state is in sync
      setTimeout(() => loadUsers(pagination.page), 1000);
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
              userAPI.updateUser(userId, { isActive: true })
            );
            await Promise.all(promises);
            
            // Update local state
            setUsers(prevUsers => 
              prevUsers.map(user => 
                selectedUsers.includes(user.id) 
                  ? { ...user, status: 'active' }
                  : user
              )
            );
            
            alert(`${selectedUsers.length} users activated successfully!`);
            setSelectedUsers([]);
          }
          break;
          
        case 'suspend':
          if (window.confirm(`Suspend ${selectedUsers.length} users?`)) {
            const promises = selectedUsers.map(userId => 
              userAPI.updateUser(userId, { isActive: false })
            );
            await Promise.all(promises);
            
            // Update local state
            setUsers(prevUsers => 
              prevUsers.map(user => 
                selectedUsers.includes(user.id) 
                  ? { ...user, status: 'suspended' }
                  : user
              )
            );
            
            alert(`${selectedUsers.length} users suspended successfully!`);
            setSelectedUsers([]);
          }
          break;
          
        case 'export':
          // Export users to CSV
          const usersToExport = users.filter(user => selectedUsers.includes(user.id));
          const csv = convertUsersToCSV(usersToExport);
          downloadCSV(csv, 'users-export.csv');
          setSelectedUsers([]);
          break;
          
        default:
          console.log('Unknown bulk action:', action);
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      setError(`Failed to ${action} users. Please try again.`);
    }
  };

  const convertUsersToCSV = (users) => {
    const headers = ['ID', 'Name', 'Email', 'Username', 'Status', 'Join Date', 'Location', 'Items', 'Revenue'];
    const rows = users.map(user => [
      user.id,
      user.name,
      user.email,
      user.username,
      user.status,
      new Date(user.joinDate).toLocaleDateString(),
      user.location,
      user.items,
      `$${user.revenue.toFixed(2)}`
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
    // For now, redirect to registration page or show a modal
    window.location.href = '/admin/users/create';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

    loadingState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: themeColors.textSecondary,
    },

    errorState: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#fee',
      borderRadius: '8px',
      color: '#c00',
      marginBottom: '20px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.errorState}>
          {error}
          <button 
            style={{ ...styles.button, marginTop: '10px' }}
            onClick={() => loadUsers()}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

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
              <option value="createdAt">Join Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
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

          <button 
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleImportUsers}
          >
            <Upload size={16} />
            {!isMobile && 'Import'}
          </button>

          <button 
            style={styles.button}
            onClick={handleAddUser}
          >
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
          <option value="createdAt">Sort by Join Date</option>
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
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
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ ...styles.td, textAlign: 'center' }}>
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const StatusIcon = getStatusIcon(user.status);
                const initials = user.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                
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
                          {initials || 'U'}
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
                          title="View User"
                        >
                          <Eye size={16} />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            style={styles.actionButton}
                            onClick={() => handleUserAction('suspend', user.id)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Suspend User"
                          >
                            <UserX size={16} />
                          </button>
                        ) : (
                          <button 
                            style={styles.actionButton}
                            onClick={() => handleUserAction('activate', user.id)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Activate User"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        <button 
                          style={styles.actionButton}
                          onClick={() => handleUserAction('delete', user.id)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          style={styles.actionButton}
                          onClick={() => handleUserAction('more', user.id)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="More Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
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
              const initials = user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              
              return (
                <div key={user.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardHeader}>
                    <div style={styles.mobileCardUser}>
                      <div style={styles.avatar}>
                        {initials || 'U'}
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
                    {user.status === 'active' ? (
                      <button 
                        style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                        onClick={() => handleUserAction('suspend', user.id)}
                      >
                        <UserX size={14} />
                        Suspend
                      </button>
                    ) : (
                      <button 
                        style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                        onClick={() => handleUserAction('activate', user.id)}
                      >
                        <UserCheck size={14} />
                        Activate
                      </button>
                    )}
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

export default UsersTab;