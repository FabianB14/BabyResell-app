import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Phone, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ContactSupport = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would send the message to your backend
      // For now, we'll just simulate success
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }, 1500);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  // Style objects
  const containerStyle = {
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: themeColors.background,
    padding: '40px 20px'
  };

  const contentStyle = {
    maxWidth: '800px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const titleStyle = {
    color: themeColors.text,
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '16px'
  };

  const subtitleStyle = {
    color: themeColors.textSecondary,
    fontSize: '18px',
    lineHeight: '1.6'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    marginBottom: '40px'
  };

  const cardStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  };

  const formGroupStyle = {
    marginBottom: '24px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: themeColors.text,
    fontWeight: '500',
    fontSize: '14px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: themeColors.secondary,
    border: 'none',
    borderRadius: '8px',
    color: themeColors.text,
    fontSize: '16px'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical'
  };

  const buttonStyle = {
    backgroundColor: themeColors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s'
  };

  const contactOptionStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: themeColors.secondary,
    borderRadius: '8px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const iconContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: themeColors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px'
  };

  const successStyle = {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center',
    fontWeight: '600'
  };

  const errorStyle = {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Contact Support</h1>
          <p style={subtitleStyle}>
            We're here to help! Get in touch with our support team and we'll get back to you as soon as possible.
          </p>
        </div>

        <div style={gridStyle}>
          {/* Contact Options */}
          <div style={cardStyle}>
            <h2 style={{ color: themeColors.text, marginBottom: '24px' }}>Get in Touch</h2>
            
            <div 
              style={contactOptionStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.secondary}
            >
              <div style={iconContainerStyle}>
                <Mail size={24} color="white" />
              </div>
              <div>
                <h3 style={{ color: themeColors.text, margin: '0 0 4px 0' }}>Email Support</h3>
                <p style={{ color: themeColors.textSecondary, margin: 0, fontSize: '14px' }}>
                  support@babyresell.com
                </p>
              </div>
            </div>

            <div 
              style={contactOptionStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.secondary}
            >
              <div style={iconContainerStyle}>
                <MessageSquare size={24} color="white" />
              </div>
              <div>
                <h3 style={{ color: themeColors.text, margin: '0 0 4px 0' }}>Live Chat</h3>
                <p style={{ color: themeColors.textSecondary, margin: 0, fontSize: '14px' }}>
                  Available Mon-Fri, 9am-5pm PST
                </p>
              </div>
            </div>

            <div 
              style={contactOptionStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.secondary}
            >
              <div style={iconContainerStyle}>
                <HelpCircle size={24} color="white" />
              </div>
              <div>
                <h3 style={{ color: themeColors.text, margin: '0 0 4px 0' }}>Help Center</h3>
                <p style={{ color: themeColors.textSecondary, margin: 0, fontSize: '14px' }}>
                  Browse our FAQ and guides
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={cardStyle}>
            <h2 style={{ color: themeColors.text, marginBottom: '24px' }}>Send us a Message</h2>
            
            {success && (
              <div style={successStyle}>
                Your message has been sent successfully! We'll get back to you within 24 hours.
              </div>
            )}
            
            {error && (
              <div style={errorStyle}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  style={textareaStyle}
                  placeholder="Please provide details about your question or issue..."
                  required
                />
              </div>
              
              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={cardStyle}>
          <h2 style={{ color: themeColors.text, marginBottom: '24px' }}>Frequently Asked Questions</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>
              How do I list an item for sale?
            </h3>
            <p style={{ color: themeColors.textSecondary, lineHeight: '1.6' }}>
              Click the "Create Pin" button in the header, then fill out the item details form with photos, description, and pricing information.
            </p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>
              Is it safe to buy and sell on BabyResell?
            </h3>
            <p style={{ color: themeColors.textSecondary, lineHeight: '1.6' }}>
              Yes! We provide secure payment processing and buyer protection. We also encourage users to meet in safe, public locations for item exchanges.
            </p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>
              What fees does BabyResell charge?
            </h3>
            <p style={{ color: themeColors.textSecondary, lineHeight: '1.6' }}>
              We charge a small transaction fee of 5% on completed sales to help maintain the platform and provide customer support.
            </p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: themeColors.text, fontSize: '16px', marginBottom: '8px' }}>
              How do I contact a seller about an item?
            </h3>
            <p style={{ color: themeColors.textSecondary, lineHeight: '1.6' }}>
              Click on any item to view its details, then use the "Contact" button to send a message directly to the seller through our messaging system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;