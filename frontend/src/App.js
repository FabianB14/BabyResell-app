import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ContactSupport from './pages/ContactSupport';
import ItemDetail from './pages/ItemDetail';
import ResponsiveHomeGrid from '../components/items/ResponsiveHomeGrid';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Protected Pages
import Profile from './pages/Profile';
import CreateListing from './pages/CreateListing';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/PaymentSuccess';
import MyOrders from './pages/MyOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Auth Guard Component
const PrivateRoute = ({ children }) => {
  // Check if user is logged in from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  return children;
};

// Admin Guard Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  if (!token) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  if (!isAdmin) {
    // Redirect non-admin users to home page
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  // State for item detail modal (if needed)
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Function to open item detail modal
  const openItemDetail = (item) => {
    setSelectedItem(item);
  };
  
  // Function to close item detail modal
  const closeItemDetail = () => {
    setSelectedItem(null);
  };

  
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: '#121212' 
          }}>
            
            <Header />
            <main className="main-content" style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home onItemClick={openItemDetail} />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<ContactSupport />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Public Profile View */}
                <Route path="/profile/:id" element={<Profile />} />
                
                {/* Protected Routes */}
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/create-listing" element={
                  <PrivateRoute>
                    <CreateListing />
                  </PrivateRoute>
                } />
                <Route path="/checkout" element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                } />
                <Route path="/payment-success" element={
                  <PrivateRoute>
                    <PaymentSuccess />
                  </PrivateRoute>
                } />
                <Route path="/my-orders" element={
                  <PrivateRoute>
                    <MyOrders />
                  </PrivateRoute>
                } />
                <Route path="/orders" element={
                  <PrivateRoute>
                    <MyOrders />
                  </PrivateRoute>
                } />
                
                {/* Admin Routes - Protected for admin users only */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;