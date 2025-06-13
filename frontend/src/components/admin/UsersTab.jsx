import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';

const UsersTab = () => {
  const { themeColors } = useTheme();
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'parent123',
      email: 'parent123@email.com',
      joinDate: '2025-01-15',
      status: 'active',
      role: 'user',
      itemsListed: 12,
      transactions: 8,
      revenue: 450.00
    },
    {
      id: 2,
      username: 'seller456',
      email: 'seller456@email.com',
      joinDate: '2025-01-10',
      status: 'active',
      role: 'user',
      itemsListed: 24,
      transactions: 18,
      revenue: 1250.00
    },
    {
      id: 3,
      username: 'admin',
      email: 'admin@babyresell.com',
      joinDate: '2024-12-01',
      status: 'active',
      role: 'admin',
      itemsListed: 0,
      transactions: 0,
      revenue: 0
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
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
    
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      backgroundColor: themeColors.secondary,
      border: 'none',
      borderRadius: '8px',
      color: themeColors.text,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    
    exportButton: {
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
    
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: themeColors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '16px',
    },
    
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    
    username: {
      fontWeight: '500',
      color: themeColors.text,
    },
    
    email: {
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
    
    inactiveStatus: {
      backgroundColor: '#ef444420',
      color: '#ef4444',
    },
    
    roleBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: themeColors.secondary,
      color: themeColors.text,
    },
    
    adminRole: {
      backgroundColor: '#8b5cf620',
      color: '#8b5cf6',
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
    
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    
    stats: {
      display: 'flex',
      gap: '24px',
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: `1px solid ${themeColors.secondary}`,
    },
    
    stat: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    
    statLabel: {
      fontSize: '12px',
      color: themeColors.textSecondary,
    },
    
    statValue: {
      fontSize: '20px',
      fontWeight: '600',
      color: themeColors.text,
    },
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>User Management</h2>
        <div style={styles.controls}>
          <div style={styles.searchBar}>
            <Search size={18} color={themeColors.textSecondary} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button style={styles.filterButton}>
            <Filter size={16} />
            Filter
          </button>
          <button style={styles.exportButton}>
            <Download size={16} />
            Export
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
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                />
              </th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Join Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Revenue</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td style={styles.td}>
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userDetails}>
                      <span style={styles.username}>{user.username}</span>
                      <span style={styles.email}>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color={themeColors.textSecondary} />
                    {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    ...(user.status === 'active' ? styles.activeStatus : styles.inactiveStatus)
                  }}>
                    {user.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
                    {user.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.roleBadge,
                    ...(user.role === 'admin' ? styles.adminRole : {})
                  }}>
                    {user.role === 'admin' && <Shield size={12} />}
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>{user.itemsListed}</td>
                <td style={styles.td}>${user.revenue.toFixed(2)}</td>
                <td style={styles.td}>
                  <div style={styles.actions}>
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
                      <Mail size={16} />
                    </button>
                    <button 
                      style={styles.actionButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Total Users</span>
          <span style={styles.statValue}>{users.length}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Active Users</span>
          <span style={styles.statValue}>{users.filter(u => u.status === 'active').length}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Total Revenue</span>
          <span style={styles.statValue}>
            ${users.reduce((sum, u) => sum + u.revenue, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;