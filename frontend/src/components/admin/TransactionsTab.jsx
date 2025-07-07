import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { transactionAPI } from '../../services/api';
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
  TrendingUp,
  Loader,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate, showNotification, downloadCSV, convertToCSV } from './adminUtils';

const TransactionsTab = () => {
  const { themeColors } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    totalFees: 0,
    pendingAmount: 0
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

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: '-createdAt'
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      // Add date range filter
      const now = new Date();
      let dateFrom;
      
      switch (dateRange) {
        case '7d':
          dateFrom = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          dateFrom = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          dateFrom = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1y':
          dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateFrom = new Date(now.setDate(now.getDate() - 30));
      }
      
      params.dateFrom = dateFrom.toISOString();
      
      // Fetch transactions
      const response = await transactionAPI.getAllTransactions(params);
      
      // Transform the data to match our UI structure
      const transformedTransactions = response.data.data.map(tx => ({
        id: tx._id,
        type: determineTransactionType(tx),
        amount: tx.amount,
        fee: tx.platformFee || (tx.amount * 0.08), // 8% fee if not specified
        netAmount: tx.sellerPayout || (tx.amount - (tx.platformFee || tx.amount * 0.08)),
        status: tx.status,
        date: tx.createdAt,
        item: {
          id: tx.pin?._id || tx.pin,
          title: tx.pin?.title || 'Item #' + (tx.pin?._id || tx.pin)?.slice(-6),
          image: tx.pin?.thumbnail || tx.pin?.images?.[0] || 'placeholder.jpg'
        },
        buyer: {
          id: tx.buyer?._id || tx.buyer,
          name: tx.buyer?.username || 'User',
          email: tx.buyer?.email || 'user@example.com'
        },
        seller: {
          id: tx.seller?._id || tx.seller,
          name: tx.seller?.username || 'User',
          email: tx.seller?.email || 'user@example.com'
        },
        paymentMethod: tx.paymentMethod || 'Credit Card',
        transactionId: tx.paymentId || tx._id,
        trackingNumber: tx.trackingNumber,
        shippingAddress: tx.shippingAddress,
        dispute: tx.dispute
      }));
      
      setTransactions(transformedTransactions);
      setPagination({
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 20,
        total: response.data.pagination?.total || response.data.count,
        pages: response.data.pagination?.pages || Math.ceil(response.data.count / 20)
      });
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showNotification('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterStatus, dateRange]);

  // Fetch transaction statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await transactionAPI.getStats();
      const data = response.data.data;
      
      // Calculate totals from the response
      const totalTransactions = data.sales?.count || 0;
      const totalRevenue = data.sales?.totalSales || 0;
      const totalFees = data.sales?.totalFees || 0;
      
      // Calculate pending amount from status stats
      const pendingStats = data.status?.find(s => s._id === 'pending');
      const pendingCount = pendingStats?.count || 0;
      
      // Estimate pending amount (you might want to fetch this separately)
      const avgTransactionAmount = totalRevenue / (totalTransactions || 1);
      const pendingAmount = pendingCount * avgTransactionAmount;
      
      setStats({
        totalTransactions,
        totalRevenue,
        totalFees,
        pendingAmount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Determine transaction type based on the data
  const determineTransactionType = (tx) => {
    if (tx.status === 'refunded') return 'refund';
    if (tx.escrowStatus === 'released') return 'sale';
    return 'sale'; // default to sale
  };

  // Initial data fetch
  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  // Filter transactions locally
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Transaction action handlers
  const handleTransactionAction = async (action, transactionId) => {
    const transaction = transactions.find(tx => tx.id === transactionId);
    
    switch (action) {
      case 'view':
        // Open transaction details (you can implement a modal or navigate to detail page)
        window.open(`/admin/transactions/${transactionId}`, '_blank');
        break;
        
      case 'download':
        // Download transaction receipt
        await downloadTransactionReceipt(transactionId);
        break;
        
      case 'refund':
        if (transaction.status === 'completed') {
          await handleRefundTransaction(transactionId);
        } else {
          showNotification('Only completed transactions can be refunded', 'warning');
        }
        break;
        
      case 'more':
        // Show more options menu (you can implement a dropdown menu)
        console.log('More options for:', transactionId);
        break;
        
      default:
        console.log('Unknown action:', action);
    }
  };

  const downloadTransactionReceipt = async (transactionId) => {
    try {
      // Since we don't have a receipt endpoint, create a simple receipt
      const transaction = transactions.find(tx => tx.id === transactionId);
      if (!transaction) return;
      
      const receiptContent = `
BABYRESELL TRANSACTION RECEIPT
==============================
Transaction ID: ${transaction.id}
Date: ${formatDate(transaction.date)}
Status: ${transaction.status.toUpperCase()}

Item: ${transaction.item.title}
Amount: ${formatCurrency(transaction.amount)}
Platform Fee: ${formatCurrency(transaction.fee)}
Net Amount: ${formatCurrency(transaction.netAmount)}

Buyer: ${transaction.buyer.name}
Seller: ${transaction.seller.name}
Payment Method: ${transaction.paymentMethod}

${transaction.trackingNumber ? `Tracking Number: ${transaction.trackingNumber}` : ''}
==============================
      `;
      
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showNotification('Receipt downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download receipt:', error);
      showNotification('Failed to download receipt', 'error');
    }
  };

  const handleRefundTransaction = async (transactionId) => {
    const reason = prompt('Please provide a reason for the refund:');
    if (!reason) return;
    
    if (window.confirm('Are you sure you want to process this refund?')) {
      try {
        // Update transaction status to refunded
        await transactionAPI.updateTransaction(transactionId, {
          status: 'refunded',
          notes: `Refund reason: ${reason}`
        });
        
        showNotification('Refund processed successfully!', 'success');
        
        // Refresh transactions
        await fetchTransactions();
        await fetchStats();
      } catch (error) {
        console.error('Failed to process refund:', error);
        showNotification('Failed to process refund. Please try again.', 'error');
      }
    }
  };

  // Export transactions handler
  const handleExportTransactions = () => {
    const headers = ['ID', 'Type', 'Amount', 'Fee', 'Net Amount', 'Status', 'Date', 'Item', 'Buyer', 'Seller', 'Payment Method'];
    
    const data = filteredTransactions.map(tx => ({
      'ID': tx.id,
      'Type': tx.type,
      'Amount': formatCurrency(tx.amount),
      'Fee': formatCurrency(tx.fee),
      'Net Amount': formatCurrency(tx.netAmount),
      'Status': tx.status,
      'Date': formatDate(tx.date),
      'Item': tx.item.title,
      'Buyer': tx.buyer.name,
      'Seller': tx.seller.name,
      'Payment Method': tx.paymentMethod
    }));
    
    const csv = convertToCSV(data, headers);
    const filename = `transactions-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    
    showNotification(`Exported ${filteredTransactions.length} transactions`, 'success');
  };

  // Refresh handler
  const handleRefreshTransactions = async () => {
    setRefreshing(true);
    await fetchTransactions();
    await fetchStats();
    setRefreshing(false);
    showNotification('Transactions refreshed', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'payment_held': return '#f59e0b';
      case 'shipped': return '#3b82f6';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#6b7280';
      case 'refunded': return '#ef4444';
      case 'disputed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'payment_held': return Clock;
      case 'shipped': return Package;
      case 'failed': return XCircle;
      case 'cancelled': return XCircle;
      case 'refunded': return ArrowDownLeft;
      case 'disputed': return AlertTriangle;
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
      '::placeholder': {
        color: themeColors.textSecondary,
      }
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
      transition: 'all 0.2s',
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
      minHeight: '400px',
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

    loadingState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: '16px',
    },

    loadingText: {
      color: themeColors.textSecondary,
      fontSize: '14px',
    },

    paginationContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },

    paginationInfo: {
      color: themeColors.textSecondary,
      fontSize: '14px',
    },

    paginationButtons: {
      display: 'flex',
      gap: '8px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Transaction Management</h2>
        </div>
        <div style={styles.tableContainer}>
          <div style={styles.loadingState}>
            <Loader size={32} className="animate-spin" color={themeColors.primary} />
            <span style={styles.loadingText}>Loading transactions...</span>
          </div>
        </div>
      </div>
    );
  }

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
              <option value="payment_held">Payment Held</option>
              <option value="shipped">Shipped</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
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

          <button 
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={handleExportTransactions}
          >
            <Download size={16} />
            {!isMobile && 'Export'}
          </button>

          <button 
            style={styles.button}
            onClick={handleRefreshTransactions}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
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
          <option value="payment_held">Payment Held</option>
          <option value="shipped">Shipped</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
          <option value="disputed">Disputed</option>
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
          <div style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#f59e0b' }}>
            <Wallet size={isMobile ? 16 : 20} color="#f59e0b" />
          </div>
          <div style={styles.statValue}>{formatCurrency(stats.totalFees)}</div>
          <div style={styles.statLabel}>Total Fees</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#8b5cf6' }}>
            <Clock size={isMobile ? 16 : 20} color="#8b5cf6" />
          </div>
          <div style={styles.statValue}>{formatCurrency(stats.pendingAmount)}</div>
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
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyState}>
                  <AlertCircle size={48} color={themeColors.textSecondary} />
                  <p>No transactions found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => {
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
                          <div style={styles.transactionId}>
                            {transaction.id.slice(-8).toUpperCase()}
                          </div>
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
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div style={styles.fee}>
                          Fee: {formatCurrency(transaction.fee)}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(transaction.status)}>
                        <StatusIcon size={12} />
                        {transaction.status.replace('_', ' ')}
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
              })
            )}
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
                        <div style={styles.mobileCardId}>
                          {transaction.id.slice(-8).toUpperCase()}
                        </div>
                        <div style={styles.mobileCardItem}>{transaction.item.title}</div>
                        <div style={styles.mobileCardAmount(transaction.amount)}>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div style={styles.mobileCardMeta}>
                          <span style={styles.statusBadge(transaction.status)}>
                            <StatusIcon size={10} />
                            {transaction.status.replace('_', ' ')}
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
                      <div style={styles.mobileCardValue}>{formatDate(transaction.date, 'short')}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Fee</div>
                      <div style={styles.mobileCardValue}>{formatCurrency(transaction.fee)}</div>
                    </div>
                    <div style={styles.mobileCardStat}>
                      <div style={styles.mobileCardLabel}>Net Amount</div>
                      <div style={styles.mobileCardValue}>{formatCurrency(transaction.netAmount)}</div>
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={styles.paginationContainer}>
          <div style={styles.paginationInfo}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
          </div>
          <div style={styles.paginationButtons}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span style={{ ...styles.paginationInfo, margin: '0 16px' }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;