import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, Clock, CreditCard, AlertCircle } from 'lucide-react';

const SellerDashboard = () => {
  const [earnings, setEarnings] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch earnings
      const earningsRes = await fetch('/api/onboarding/earnings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const earningsData = await earningsRes.json();
      
      // Fetch Stripe account status
      const statusRes = await fetch('/api/onboarding/account-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const statusData = await statusRes.json();
      
      setEarnings(earningsData.earnings);
      setAccountStatus(statusData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleStripeOnboarding = async () => {
    try {
      const response = await fetch('/api/onboarding/create-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to start Stripe onboarding:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
      
      {/* Stripe Account Status Alert */}
      {!accountStatus?.isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">Complete Your Seller Account</h3>
            <p className="text-yellow-700 text-sm mt-1">
              To receive payouts, you need to complete your Stripe seller account setup.
            </p>
            <button
              onClick={handleStripeOnboarding}
              className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}
      
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Sales */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-sm text-green-600 font-medium">All Time</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${earnings?.lifetime?.sales || '0.00'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Total Sales</p>
        </div>
        
        {/* Net Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <span className="text-sm text-gray-500">After fees</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${earnings?.lifetime?.net || '0.00'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Net Earnings</p>
        </div>
        
        {/* Pending Payouts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
            <span className="text-sm text-orange-600 font-medium">
              {earnings?.pending?.count || 0} orders
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${earnings?.pending?.amount || '0.00'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Pending Payouts</p>
        </div>
        
        {/* Platform Fees */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="text-purple-600" size={24} />
            </div>
            <span className="text-sm text-purple-600 font-medium">8% fee</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${earnings?.lifetime?.fees || '0.00'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Total Fees Paid</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Transactions
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payouts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payout Settings
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <Package size={48} />
              <span className="ml-2">Sales chart coming soon</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-semibold">{earnings?.lifetime?.transactionCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Sale</span>
                <span className="font-semibold">
                  ${earnings?.lifetime?.transactionCount > 0 
                    ? (earnings.lifetime.sales / earnings.lifetime.transactionCount).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Platform Fee Rate</span>
                <span className="font-semibold">8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Take Rate</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earnings?.recent?.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.itemTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -${transaction.fee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${transaction.net.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Payout Settings</h3>
          {accountStatus?.isComplete ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-700">Your Stripe account is active</span>
              </div>
              <p className="text-gray-600 mb-4">
                Payouts are automatically sent to your bank account after transactions are completed.
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Manage Stripe Account →
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Complete your Stripe account setup to start receiving payouts.
              </p>
              <button
                onClick={handleStripeOnboarding}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
              >
                Complete Stripe Setup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;