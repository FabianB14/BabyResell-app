import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ForgotPassword = () => {
  const { themeColors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // This is a placeholder. In a real app, you would connect to your backend API
    // Example: await authAPI.forgotPassword(email);
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <img src="/logo192.png" alt="BabyResell" className="h-12 w-auto" />
        </div>
        
        {success ? (
          <>
            <h2 className="text-center text-2xl font-bold mb-4" style={{ color: themeColors.text }}>
              Check your email
            </h2>
            <p className="text-center text-gray-600 mb-6">
              We've sent password reset instructions to {email}
            </p>
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium"
                style={{ color: themeColors.primary }}
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to login
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-center text-2xl font-bold mb-2" style={{ color: themeColors.text }}>
              Reset your password
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRing: themeColors.primary }}
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: themeColors.primary,
                    opacity: loading ? 0.7 : 1,
                    focusRing: themeColors.primary
                  }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
              
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium"
                  style={{ color: themeColors.primary }}
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;