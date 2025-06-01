
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const BabyItem = require('../models/BabyItem');
const asyncHandler = require('../middleware/async');

// @desc    Get platform revenue analytics (Admin only)
// @route   GET /api/analytics/revenue
// @access  Private/Admin
exports.getRevenueAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Date range filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  
  const matchStage = {
    status: 'completed'
  };
  
  if (Object.keys(dateFilter).length > 0) {
    matchStage.createdAt = dateFilter;
  }
  
  // Aggregate revenue data
  const revenueStats = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$platformFee' },
        totalTransactions: { $sum: 1 },
        totalSalesVolume: { $sum: '$amount' },
        avgTransactionValue: { $avg: '$amount' },
        avgPlatformFee: { $avg: '$platformFee' }
      }
    }
  ]);
  
  // Monthly revenue breakdown
  const monthlyRevenue = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$platformFee' },
        transactions: { $sum: 1 },
        volume: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  // Revenue by category
  const categoryRevenue = await Transaction.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'babyitems',
        localField: 'pin',
        foreignField: '_id',
        as: 'item'
      }
    },
    { $unwind: '$item' },
    {
      $group: {
        _id: '$item.category',
        revenue: { $sum: '$platformFee' },
        transactions: { $sum: 1 },
        avgPrice: { $avg: '$amount' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
  
  // Top sellers by revenue generated
  const topSellers = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$seller',
        revenue: { $sum: '$platformFee' },
        sales: { $sum: 1 },
        volume: { $sum: '$amount' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        username: '$user.username',
        email: '$user.email',
        revenue: 1,
        sales: 1,
        volume: 1
      }
    }
  ]);
  
  // Projections
  const currentMonthRevenue = monthlyRevenue[0]?.revenue || 0;
  const lastMonthRevenue = monthlyRevenue[1]?.revenue || 0;
  const growthRate = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
    : 0;
  
  // Calculate monthly recurring revenue (MRR) projection
  const avgMonthlyRevenue = monthlyRevenue.length > 0
    ? monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / monthlyRevenue.length
    : 0;
  
  res.status(200).json({
    success: true,
    analytics: {
      summary: revenueStats[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        totalSalesVolume: 0,
        avgTransactionValue: 0,
        avgPlatformFee: 0
      },
      monthlyRevenue: monthlyRevenue.map(month => ({
        month: `${month._id.year}-${String(month._id.month).padStart(2, '0')}`,
        revenue: month.revenue.toFixed(2),
        transactions: month.transactions,
        volume: month.volume.toFixed(2)
      })),
      categoryBreakdown: categoryRevenue.map(cat => ({
        category: cat._id,
        revenue: cat.revenue.toFixed(2),
        transactions: cat.transactions,
        avgPrice: cat.avgPrice.toFixed(2),
        percentage: revenueStats[0] 
          ? ((cat.revenue / revenueStats[0].totalRevenue) * 100).toFixed(1)
          : 0
      })),
      topSellers,
      projections: {
        currentMonthRevenue: currentMonthRevenue.toFixed(2),
        lastMonthRevenue: lastMonthRevenue.toFixed(2),
        growthRate: `${growthRate}%`,
        projectedMonthlyRevenue: avgMonthlyRevenue.toFixed(2),
        projectedAnnualRevenue: (avgMonthlyRevenue * 12).toFixed(2)
      }
    }
  });
});

// @desc    Get financial metrics for investor dashboard
// @route   GET /api/analytics/metrics
// @access  Private/Admin
exports.getFinancialMetrics = asyncHandler(async (req, res, next) => {
  // Key metrics for your investor pitch
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  
  // Monthly Active Users (MAU)
  const mau = await User.countDocuments({
    lastLogin: { $gte: new Date(now.setDate(now.getDate() - 30)) }
  });
  
  // Gross Merchandise Value (GMV)
  const gmvStats = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: firstDayOfYear }
      }
    },
    {
      $group: {
        _id: null,
        totalGMV: { $sum: '$amount' },
        totalRevenue: { $sum: '$platformFee' }
      }
    }
  ]);
  
  // Customer Acquisition Cost (CAC) - placeholder
  const marketingSpend = 500; // Track your actual marketing spend
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: firstDayOfMonth }
  });
  const cac = newUsersThisMonth > 0 ? marketingSpend / newUsersThisMonth : 0;
  
  // Average Revenue Per User (ARPU)
  const activeUsers = await User.countDocuments({ isVerified: true });
  const totalRevenue = gmvStats[0]?.totalRevenue || 0;
  const arpu = activeUsers > 0 ? totalRevenue / activeUsers : 0;
  
  // Churn rate (users who haven't logged in for 60 days)
  const churnedUsers = await User.countDocuments({
    lastLogin: { $lt: new Date(now.setDate(now.getDate() - 60)) }
  });
  const churnRate = activeUsers > 0 ? (churnedUsers / activeUsers * 100) : 0;
  
  res.status(200).json({
    success: true,
    metrics: {
      mau,
      gmv: {
        ytd: (gmvStats[0]?.totalGMV || 0).toFixed(2),
        revenue: totalRevenue.toFixed(2),
        takeRate: gmvStats[0]?.totalGMV > 0 
          ? ((totalRevenue / gmvStats[0].totalGMV) * 100).toFixed(2) + '%'
          : '8%'
      },
      unitEconomics: {
        cac: cac.toFixed(2),
        arpu: arpu.toFixed(2),
        ltv: (arpu * 24).toFixed(2), // Assuming 24 month customer lifetime
        ltvCacRatio: cac > 0 ? ((arpu * 24) / cac).toFixed(2) : 'N/A'
      },
      growth: {
        newUsersThisMonth,
        churnRate: churnRate.toFixed(2) + '%',
        netGrowth: newUsersThisMonth - churnedUsers
      }
    }
  });
});

// @desc    Export revenue data for accounting
// @route   GET /api/analytics/export
// @access  Private/Admin
exports.exportRevenueData = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  
  const transactions = await Transaction.find({
    status: 'completed',
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
  })
  .populate('buyer', 'username email')
  .populate('seller', 'username email')
  .populate('pin', 'title category');
  
  const exportData = transactions.map(t => ({
    transactionId: t._id,
    date: t.createdAt,
    buyer: t.buyer.email,
    seller: t.seller.email,
    itemTitle: t.pin.title,
    category: t.pin.category,
    saleAmount: t.amount,
    platformFee: t.platformFee,
    platformRevenue: t.platformFee,
    sellerPayout: t.amount - t.platformFee,
    paymentMethod: t.paymentMethod,
    status: t.status
  }));
  
  if (format === 'csv') {
    // Convert to CSV format
    const csv = [
      'Transaction ID,Date,Buyer,Seller,Item,Category,Sale Amount,Platform Fee,Seller Payout',
      ...exportData.map(row => 
        `${row.transactionId},${row.date},${row.buyer},${row.seller},${row.itemTitle},${row.category},${row.saleAmount},${row.platformFee},${row.sellerPayout}`
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=revenue-export.csv');
    res.send(csv);
  } else {
    res.status(200).json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  }
});

module.exports = exports;