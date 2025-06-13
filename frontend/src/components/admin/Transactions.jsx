import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Search, 
  Filter, 
  Download,
  DollarSign,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Receipt,
  Calendar
} from 'lucide-react';

const TransactionsTab = () => {
  const { themeColors } = useTheme();
  const [transactions, setTransactions] = useState([
    {
      id: 'TRX001',
      date: '2025-06-12',
      time: '14:32:00',
      item: 'Baby Carrier',
      buyer: 'parent123',
      seller: 'seller456',
      amount: 45.00,
      platformFee: 3.60,
      sellerEarnings: 41.40,
      status: 'completed',
      paymentMethod: 'Card ending 4242'
    },
    {
      id: 'TRX002',
      date: '2025-06-11',
      time: '10:15:00',
      item: 'Wooden Crib',
      buyer: 'buyer789',
      seller: 'seller456',
      amount: 120.00,
      platformFee: 9.60,
      sellerEarnings: 110.40,
      status: 'completed',
      paymentMethod: 'Card ending 5555'
    },
    {
      id: 'TRX003',
      date: '2025-06-11',
      time: '09:45:00',
      item: 'Baby Bottle Set',
      buyer: 'parent999',
      seller: 'parent123',
      amount: 25.00,
      platformFee: 2.00,
      sellerEarnings: 23.00,
      status: 'pending',
      paymentMethod: 'Card ending 1234'
    },
    {
      id: 'TRX004',
      date: '2025-06-10',
      time: '16:20:00',
      item: 'Stroller',
      buyer: 'buyer321',
      seller: 'seller789',
      amount: 85.00,
      platformFee: 6.80,
      sellerEarnings: 78.20,
      status: 'refunded',
      paymentMethod: 'Card ending 9876'
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  
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
    
    transactionId: {
      fontWeight: '600',
      color: themeColors.primary,
      cursor: 'pointer',
    },
    
    dateTime: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    
    date: {
      fontSize: '14px',
      color: themeColors.text,
    },
    
    time: {
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
    
    completedStatus: {
      backgroundColor: '#10b98120',
      color: '#10b981',
    },
    
    pendingStatus: {
      backgroundColor: '#f59e0b20',
      color: '#f59e0b',
    },
    
    refundedStatus: {
      backgroundColor: '#ef444420',
      color: '#ef4444',
    },
    
    cancelledStatus: {
      backgroundColor: '#6b728020',
      color: '#6b7280',
    },
    
    amount: {
      fontWeight: '600',
      color: themeColors.text,
    },
    
    fee: {
      fontSize: '12px',
      color: themeColors.textSecondary,
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    
    statCard: {
      backgroundColor: themeColors.secondary,
      padding: '20px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    
    statIcon: {
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
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
      fontSize: '24px',
      fontWeight: '600',
      color: themeColors.text,
    },
    
    statSubtext: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      marginTop: '2px',
    },
    
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    
    userLink: {
      color: themeColors.text,
      textDecoration: 'none',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline',
      }
    },
  };
  
  // Calculate stats
  const stats = {
    totalRevenue: transactions.reduce((sum, t) => t.status === 'completed' ? sum + t.amount : sum, 0),
    totalFees: transactions.reduce((sum, t) => t.status === 'completed' ? sum + t.platformFee : sum, 0),
    completedCount: transactions.filter(t => t.status === 'completed').length,
    pendingCount: transactions.filter(t => t.status === 'pending').length,
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    // Add date filtering logic here if needed
    return matchesSearch && matchesStatus;
  });
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };
  
  const handleSelectTransaction = (transactionId) => {
    if (selectedTransactions.includes(transactionId)) {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    } else {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'refunded': return <XCircle size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };
  
  return (
    <div>
      {/* Stats Section */}
      <div style={styles.statsSection}>
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#10b98120',
            color: '#10b981'
          }}>
            <DollarSign size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Total Revenue</div>
            <div style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</div>
            <div style={styles.statSubtext}>From {stats.completedCount} transactions</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#8b5cf620',
            color: '#8b5cf6'
          }}>
            <CreditCard size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Platform Fees</div>
            <div style={styles.statValue}>${stats.totalFees.toFixed(2)}</div>
            <div style={styles.statSubtext}>8% fee per transaction</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#3b82f620',
            color: '#3b82f6'
          }}>
            <ShoppingBag size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Completed</div>
            <div style={styles.statValue}>{stats.completedCount}</div>
            <div style={styles.statSubtext}>Successful transactions</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{
            ...styles.statIcon,
            backgroundColor: '#f59e0b20',
            color: '#f59e0b'
          }}>
            <Clock size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Pending</div>
            <div style={styles.statValue}>{stats.pendingCount}</div>
            <div style={styles.statSubtext}>Awaiting completion</div>
          </div>
        </div>
      </div>
      
      {/* Main Table Section */}
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Transaction Management</h2>
          <div style={styles.controls}>
            <div style={styles.searchBar}>
              <Search size={18} color={themeColors.textSecondary} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <select 
              style={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select 
              style={styles.filterSelect}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
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
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                  />
                </th>
                <th style={styles.th}>Transaction ID</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Buyer</th>
                <th style={styles.th}>Seller</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Fees</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleSelectTransaction(transaction.id)}
                    />
                  </td>
                  <td style={styles.td}>
                    <span style={styles.transactionId}>{transaction.id}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.dateTime}>
                      <span style={styles.date}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                      <span style={styles.time}>{transaction.time}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{transaction.item}</td>
                  <td style={styles.td}>
                    <span style={styles.userLink}>{transaction.buyer}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.userLink}>{transaction.seller}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.amount}>${transaction.amount.toFixed(2)}</div>
                  </td>
                  <td style={styles.td}>
                    <div>
                      <div style={styles.fee}>-${transaction.platformFee.toFixed(2)}</div>
                      <div style={styles.fee}>Net: ${transaction.sellerEarnings.toFixed(2)}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(transaction.status === 'completed' ? styles.completedStatus : 
                         transaction.status === 'pending' ? styles.pendingStatus : 
                         transaction.status === 'refunded' ? styles.refundedStatus :
                         styles.cancelledStatus)
                    }}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                      {transaction.paymentMethod}
                    </div>
                  </td>
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
                        <Receipt size={16} />
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
      </div>
    </div>
  );
};

export default TransactionsTab;