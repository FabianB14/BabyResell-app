import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  User,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp
} from 'lucide-react';

const TransactionsTab = () => {
  const { themeColors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // Mock transaction data
  const [transactions] = useState([
    {
      id: 'TXN-001',
      type: 'sale',
      amount: 89.99,
      fee: 4.50,
      netAmount: 85.49,
      status: 'completed',
      date: '2024-06-13T10:30:00Z',
      item: {
        id: 1,
        title: 'Baby Stroller - Graco Modes',
        image: 'stroller.jpg'
      },
      buyer: {
        id: 2,
        name: 'Michael Brown',
        email: 'michael@email.com'
      },
      seller: {
        id: 1,
        name: 'Emma Johnson',
        email: 'emma@email.com'
      },
      paymentMethod: 'Credit Card',
      transactionId: 'ch_3N7Q2L2eZvKYlo2C1k3h7Gf5'
    },
    {
      id: 'TXN-002',
      type: 'purchase',
      amount: 125.00,
      fee: 6.25,
      netAmount: 118.75,
      status: 'completed',
      date: '2024-06-12T15:45:00Z',
      item: {
        id: 2,
        title: 'Toddler Bed with Rails',
        image: 'bed.jpg'
      },
      buyer: {
        id: 3,
        name: 'Sarah Wilson',
        email: 'sarah@email.com'
      },
      seller: {
        id: 2,
        name: 'Michael Brown',
        email: 'michael@email.com'
      },
      paymentMethod: 'PayPal',
      transactionId: 'paypal_3N7Q2L2eZvKYlo2C1k3h7Gf5'
    },
    {
      id: 'TXN-003',
      type: 'refund',
      amount: -45.50,
      fee: -2.28,
      netAmount: -43.22,
      status: 'completed',
      date: '2024-06-11T09:15:00Z',
      item: {
        id: 3,
        title: 'Baby Clothes Bundle',
        image: 'clothes.jpg'
      },
      buyer: {
        id: 4,
        name: 'David Clark',
        email: 'david@email.com'
      },
      seller: {
        id: 3,
        name: 'Sarah Wilson',
        email: 'sarah@email.com'
      },
      paymentMethod: 'Credit Card',
      transactionId: 're_3N7Q2L2eZvKYlo2C1k3h7Gf5',
      refundReason: 'Item not as described'
    },
    {
      id: 'TXN-004',
      type: 'sale',
      amount: 75.99,
      fee: 3.80,
      netAmount: 72.19,
      status: 'pending',
      date: '2024-06-13T14:20:00Z',
      item: {
        id: 4,
        title: 'High Chair - Chicco Polly',
        image: 'chair.jpg'
      },
      buyer: {
        id: 5,
        name: 'Lisa Garcia',
        email: 'lisa@email.com'
      },
      seller: {
        id: 4,
        name: 'David Clark',
        email: 'david@email.com'
      },
      paymentMethod: 'Apple Pay',
      transactionId: 'pi_3N7Q2L2eZvKYlo2C1k3h7Gf5'
    },
    {
      id: 'TXN-005',
      type: 'sale',
      amount: 65.00,
      fee: 3.25,
      netAmount: 61.75,
      status: 'failed',
      date: '2024-06-10T11:30:00Z',
      item: {
        id: 5,
        title: 'Baby Carrier - Ergobaby',
        image: 'carrier.jpg'
      },
      buyer: {
        id: 1,
        name: 'Emma Johnson',
        email: 'emma@email.com'
      },
      seller: {
        id: 5,
        name: 'Lisa Garcia',
        email: 'lisa@email.com'
      },
      paymentMethod: 'Credit Card',
      transactionId: 'pi_3N7Q2L2eZvKYlo2C1k3h7Gf5',
      failureReason: 'Insufficient funds'
    }
  ]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleTransactionAction = (action, transactionId) => {
  console.log(`${action} transaction ${transactionId}`);
  
  switch (action) {
    case 'view':
      // Open transaction details modal or page
      window.open(`/admin/transactions/${transactionId}`, '_blank');
      break;
      
    case 'download':
      // Download transaction receipt
      downloadTransactionReceipt(transactionId);
      break;
      
    case 'refund':
      handleRefundTransaction(transactionId);
      break;
      
    default:
      console.log('Unknown action:', action);
  }
};

const downloadTransactionReceipt = async (transactionId) => {
  try {
    const response = await fetch(`/api/transactions/${transactionId}/receipt`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    alert('Failed to download receipt');
  }
};

const handleRefundTransaction = async (transactionId) => {
  const reason = prompt('Please provide a reason for the refund:');
  if (!reason) return;
  
  if (window.confirm('Are you sure you want to process this refund?')) {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        alert('Refund processed successfully!');
        // Reload transactions
        window.location.reload();
      } else {
        throw new Error('Refund failed');
      }
    } catch (error) {
      alert('Failed to process refund. Please try again.');
    }
  }
};

// Export transactions handler
const handleExportTransactions = () => {
  const csv = convertTransactionsToCSV(filteredTransactions);
  downloadCSV(csv, `transactions-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
};

// Utility to trigger CSV download
const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const convertTransactionsToCSV = (transactions) => {
  const headers = ['ID', 'Type', 'Amount', 'Fee', 'Net Amount', 'Status', 'Date', 'Item', 'Buyer', 'Seller'];
  const rows = transactions.map(tx => [
    tx.id,
    tx.type,
    tx.amount,
    tx.fee,
    tx.netAmount,
    tx.status,
    formatDate(tx.date),
    tx.item.title,
    tx.buyer.name,
    tx.seller.name
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Refresh handler
const handleRefreshTransactions = () => {
  window.location.reload();
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    return `${isNegative ? '-' : ''}$${absAmount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return XCircle;
      case 'cancelled': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return ArrowUpRight;
      case 'purchase': return ArrowDownLeft;
      case 'refund': return ArrowDownLeft;
      default: return CreditCard;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale': return '#10b981';
      case 'purchase': return '#3b82f6';
      case 'refund': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Calculate summary stats
  const stats = {
    totalTransactions: transactions.length,
    totalRevenue: transactions
      .filter(t => t.status === 'completed' && t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0),
    totalFees: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.fee, 0),
    pendingAmount: transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)
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

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '12px' : '20px',
      marginBottom: isMobile ? '20px' : '24px',
    },

    statCard: {
      backgroundColor: themeColors.cardBackground,
      padding: isMobile ? '16px' : '20px',
      borderRadius: '12px',
      border: `1px solid ${themeColors.secondary}`,
      position: 'relative',
      overflow: 'hidden',
    },

    statIcon: {
      position: 'absolute',
      top: isMobile ? '12px' : '16px',
      right: isMobile ? '12px' : '16px',
      width: isMobile ? '32px' : '40px',
      height: isMobile ? '32px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      opacity: 0.1,
    },

    statValue: {
      fontSize: isMobile ? '18px' : '24px',
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

    transactionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    transactionIcon: (type) => ({
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      backgroundColor: `${getTypeColor(type)}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),

    transactionDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: 0,
    },

    transactionId: {
      fontWeight: '500',
      color: themeColors.text,
      fontSize: '14px',
    },

    transactionItem: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    amountContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '2px',
    },

    amount: (amount) => ({
      fontWeight: '600',
      fontSize: '14px',
      color: amount >= 0 ? '#10b981' : '#ef4444',
    }),

    fee: {
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

    typeBadge: (type) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '500',
      backgroundColor: `${getTypeColor(type)}15`,
      color: getTypeColor(type),
      textTransform: 'capitalize',
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

    mobileCardTransaction: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1,
    },

    mobileCardContent: {
      flex: 1,
      minWidth: 0,
    },

    mobileCardId: {
      fontSize: '16px',
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: '4px',
    },

    mobileCardItem: {
      fontSize: '14px',
      color: themeColors.textSecondary,
      marginBottom: '8px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    mobileCardAmount: (amount) => ({
      fontSize: '18px',
      fontWeight: 'bold',
      color: amount >= 0 ? '#10b981' : '#ef4444',
      marginBottom: '8px',
    }),

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

    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: themeColors.textSecondary,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Transaction Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <Search size={16} color={themeColors.textSecondary} />
            <input
              type="text"
              placeholder="Search transactions..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select 
              style={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="sale">Sales</option>
              <option value="purchase">Purchases</option>
              <option value="refund">Refunds</option>
            </select>

            <select 
              style={styles.filterSelect}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
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
            <RefreshCw size={16} />
            {!isMobile && 'Refresh'}
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
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select 
          style={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="sale">Sales</option>
          <option value="purchase">Purchases</option>
          <option value="refund">Refunds</option>
        </select>

        <select 
          style={styles.filterSelect}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#3b82f6' }}>
            <CreditCard size={isMobile ? 16 : 20} color="#3b82f6" />
          </div>
          <div style={styles.statValue}>{stats.totalTransactions}</div>
          <div style={styles.statLabel}>Total Transactions</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#10b981' }}>
            <DollarSign size={isMobile ? 16 : 20} color="#10b981" />
          </div>
          <div style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#f59e0b' }}>
            <Wallet size={isMobile ? 16 : 20} color="#f59e0b" />
          </div>
          <div style={styles.statValue}>${stats.totalFees.toFixed(2)}</div>
          <div style={styles.statLabel}>Total Fees</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#8b5cf6' }}>
            <Clock size={isMobile ? 16 : 20} color="#8b5cf6" />
          </div>
          <div style={styles.statValue}>${stats.pendingAmount.toFixed(2)}</div>
          <div style={styles.statLabel}>Pending Amount</div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {/* Desktop Table */}
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Transaction</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => {
              const StatusIcon = getStatusIcon(transaction.status);
              const TypeIcon = getTypeIcon(transaction.type);
              return (
                <tr key={transaction.id}>
                  <td style={styles.td}>
                    <div style={styles.transactionInfo}>
                      <div style={styles.transactionIcon(transaction.type)}>
                        <TypeIcon size={16} color={getTypeColor(transaction.type)} />
                      </div>
                      <div style={styles.transactionDetails}>
                        <div style={styles.transactionId}>{transaction.id}</div>
                        <div style={styles.transactionItem}>{transaction.item.title}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge(transaction.type)}>
                      {transaction.type}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.amountContainer}>
                      <div style={styles.amount(transaction.amount)}>
                        {formatAmount(transaction.amount)}
                      </div>
                      <div style={styles.fee}>
                        Fee: {formatAmount(transaction.fee)}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(transaction.status)}>
                      <StatusIcon size={12} />
                      {transaction.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color={themeColors.textSecondary} />
                      {formatDate(transaction.date)}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleTransactionAction('view', transaction.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleTransactionAction('download', transaction.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Download size={16} />
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
          {filteredTransactions.length === 0 ? (
            <div style={styles.emptyState}>
              <CreditCard size={48} />
              <p>No transactions found matching your criteria.</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const StatusIcon = getStatusIcon(transaction.status);
              const TypeIcon = getTypeIcon(transaction.type);
              return (
                <div key={transaction.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardHeader}>
                    <div style={styles.mobileCardTransaction}>
                      <div style={styles.transactionIcon(transaction.type)}>
                        <TypeIcon size={16} color={getTypeColor(transaction.type)} />
                      </div>
                      <div style={styles.mobileCardContent}>
                        <div style={styles.mobileCardId}>{transaction.id}</div>
                        <div style={styles.mobileCardItem}>{transaction.item.title}</div>
                        <div style={styles.mobileCardAmount(transaction.amount)}>
                          {formatAmount(transaction.amount)}
                        </div>
                        <div style={styles.mobileCardMeta}>
                          <span style={styles.statusBadge(transaction.status)}>
                            <StatusIcon size={10} />
                            {transaction.status}
                          </span>
                          <span style={styles.typeBadge(transaction.type)}>
                            {transaction.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.mobileCardDetails}>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Date</div>
                      <div style={styles.mobileCardValue}>{formatDate(transaction.date)}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Fee</div>
                      <div style={styles.mobileCardValue}>{formatAmount(transaction.fee)}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Net Amount</div>
                      <div style={styles.mobileCardValue}>{formatAmount(transaction.netAmount)}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Payment Method</div>
                      <div style={styles.mobileCardValue}>{transaction.paymentMethod}</div>
                    </div>
                  </div>

                  <div style={styles.mobileCardActions}>
                    <button 
                      style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }}
                      onClick={() => handleTransactionAction('view', transaction.id)}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleTransactionAction('more', transaction.id)}
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

export default TransactionsTab;