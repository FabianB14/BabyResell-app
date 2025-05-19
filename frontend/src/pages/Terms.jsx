import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Terms = () => {
  const { themeColors } = useTheme();

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

  const titleStyle = {
    color: themeColors.text,
    fontSize: '48px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '16px'
  };

  const lastUpdatedStyle = {
    color: themeColors.textSecondary,
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '40px'
  };

  const sectionStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  };

  const sectionTitleStyle = {
    color: themeColors.text,
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px'
  };

  const paragraphStyle = {
    color: themeColors.text,
    fontSize: '16px',
    lineHeight: '1.8',
    marginBottom: '16px'
  };

  const listStyle = {
    color: themeColors.text,
    fontSize: '16px',
    lineHeight: '1.8',
    marginBottom: '16px',
    paddingLeft: '20px'
  };

  const strongStyle = {
    color: themeColors.text,
    fontWeight: '600'
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>Terms of Service</h1>
        <p style={lastUpdatedStyle}>Last updated: May 18, 2025</p>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Introduction</h2>
          <p style={paragraphStyle}>
            Welcome to BabyResell ("we," "our," or "us"). These Terms of Service ("Terms") govern 
            your use of our website and mobile application (collectively, the "Service") operated 
            by BabyResell Inc.
          </p>
          <p style={paragraphStyle}>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
            with any part of these terms, then you may not access the Service.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Acceptance of Terms</h2>
          <p style={paragraphStyle}>
            By creating an account or using BabyResell, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms and our Privacy Policy. If you are using the Service 
            on behalf of a company or other entity, you represent that you have the authority to bind 
            that entity to these Terms.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Description of Service</h2>
          <p style={paragraphStyle}>
            BabyResell is an online marketplace that connects parents who want to buy and sell 
            pre-loved baby items. Our platform provides:
          </p>
          <ul style={listStyle}>
            <li>A marketplace for listing and discovering baby items</li>
            <li>Secure payment processing</li>
            <li>Messaging system for buyer-seller communication</li>
            <li>User profiles and rating systems</li>
            <li>Search and discovery features</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>User Accounts</h2>
          
          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Account Creation</h3>
          <p style={paragraphStyle}>
            To use certain features of our Service, you must create an account. You agree to:
          </p>
          <ul style={listStyle}>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Be responsible for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Account Termination</h3>
          <p style={paragraphStyle}>
            You may terminate your account at any time. We may suspend or terminate your account 
            if you violate these Terms or engage in harmful or illegal activities.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>User Conduct</h2>
          <p style={paragraphStyle}>You agree not to:</p>
          <ul style={listStyle}>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Violate any laws, regulations, or third-party rights</li>
            <li>Post false, misleading, or deceptive information</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Transmit viruses, malware, or other harmful code</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Create multiple accounts or impersonate others</li>
            <li>Engage in any form of spam or unsolicited marketing</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Listing and Selling Items</h2>
          
          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Listing Requirements</h3>
          <p style={paragraphStyle}>When listing items for sale, you must:</p>
          <ul style={listStyle}>
            <li>Provide accurate descriptions and photos</li>
            <li>Set fair and reasonable prices</li>
            <li>Ensure items meet current safety standards</li>
            <li>Comply with applicable laws and regulations</li>
            <li>Only list items you legally own and have the right to sell</li>
          </ul>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Prohibited Items</h3>
          <p style={paragraphStyle}>You may not list:</p>
          <ul style={listStyle}>
            <li>Recalled or unsafe baby products</li>
            <li>Items that violate intellectual property rights</li>
            <li>Illegal or regulated items</li>
            <li>Items with missing or damaged safety features</li>
            <li>Car seats that have been in accidents or are expired</li>
          </ul>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Seller Responsibilities</h3>
          <p style={paragraphStyle}>As a seller, you are responsible for:</p>
          <ul style={listStyle}>
            <li>Accurately representing your items</li>
            <li>Responding promptly to buyer inquiries</li>
            <li>Completing transactions in good faith</li>
            <li>Providing tracking information when applicable</li>
            <li>Resolving disputes professionally</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Purchasing and Payments</h2>
          
          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Buyer Responsibilities</h3>
          <p style={paragraphStyle}>As a buyer, you agree to:</p>
          <ul style={listStyle}>
            <li>Pay for items promptly upon purchase</li>
            <li>Provide accurate shipping information</li>
            <li>Inspect items upon receipt</li>
            <li>Report any issues within a reasonable time</li>
            <li>Leave honest and fair reviews</li>
          </ul>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Payment Processing</h3>
          <p style={paragraphStyle}>
            Payments are processed through secure third-party payment processors. BabyResell 
            does not store your payment information. Transaction fees may apply to sales.
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Returns and Refunds</h3>
          <p style={paragraphStyle}>
            Returns and refunds are subject to individual seller policies and applicable laws. 
            BabyResell may facilitate dispute resolution but is not responsible for transaction outcomes.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Fees and Payments</h2>
          <p style={paragraphStyle}>
            BabyResell charges a service fee on completed transactions. Current fee structure:
          </p>
          <ul style={listStyle}>
            <li>5% transaction fee on successful sales</li>
            <li>Payment processing fees as applicable</li>
            <li>Additional fees for premium features (if applicable)</li>
          </ul>
          <p style={paragraphStyle}>
            Fees are subject to change with reasonable notice. We reserve the right to modify 
            our fee structure at any time.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Intellectual Property</h2>
          
          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Our Content</h3>
          <p style={paragraphStyle}>
            The Service and its content, features, and functionality are owned by BabyResell 
            and are protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>User Content</h3>
          <p style={paragraphStyle}>
            You retain ownership of content you post but grant BabyResell a license to use, 
            display, and distribute your content as necessary to provide the Service.
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Copyright Violations</h3>
          <p style={paragraphStyle}>
            We respect intellectual property rights and will respond to valid copyright 
            infringement notices in accordance with applicable law.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Privacy and Data Protection</h2>
          <p style={paragraphStyle}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
            and protect your information. By using the Service, you consent to our data practices 
            as described in our Privacy Policy.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Safety and Security</h2>
          <p style={paragraphStyle}>
            While we implement security measures to protect our platform, you are responsible for:
          </p>
          <ul style={listStyle}>
            <li>Using strong, unique passwords</li>
            <li>Protecting your account credentials</li>
            <li>Reporting suspicious activity</li>
            <li>Following safe meeting practices for local transactions</li>
            <li>Verifying item safety and condition before purchase</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Disclaimers and Limitations</h2>
          
          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Service Availability</h3>
          <p style={paragraphStyle}>
            We strive to provide reliable service but cannot guarantee uninterrupted access. 
            The Service is provided "as is" without warranties of any kind.
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Third-Party Transactions</h3>
          <p style={paragraphStyle}>
            BabyResell facilitates transactions between users but is not a party to these 
            transactions. We are not responsible for the quality, safety, or legality of 
            items listed or sold.
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Limitation of Liability</h3>
          <p style={paragraphStyle}>
            To the maximum extent permitted by law, BabyResell shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages arising from 
            your use of the Service.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Dispute Resolution</h2>
          <p style={paragraphStyle}>
            Any disputes arising from these Terms or your use of the Service shall be resolved through:
          </p>
          <ul style={listStyle}>
            <li>Good faith negotiations</li>
            <li>Mediation (if agreed upon)</li>
            <li>Binding arbitration in accordance with applicable rules</li>
          </ul>
          <p style={paragraphStyle}>
            These Terms shall be governed by the laws of [Your Jurisdiction], without regard 
            to conflict of law principles.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Modifications to Terms</h2>
          <p style={paragraphStyle}>
            We reserve the right to modify these Terms at any time. We will notify users of 
            material changes by posting the updated Terms on our website or through other 
            appropriate means. Your continued use of the Service after changes constitutes 
            acceptance of the new Terms.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Termination</h2>
          <p style={paragraphStyle}>
            We may terminate or suspend your account and access to the Service immediately, 
            without prior notice, for any breach of these Terms. Upon termination, your right 
            to use the Service will cease immediately.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Severability</h2>
          <p style={paragraphStyle}>
            If any provision of these Terms is found to be unenforceable or invalid, that 
            provision will be limited or eliminated to the minimum extent necessary so that 
            the rest of these Terms will remain in full force and effect.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Contact Information</h2>
          <p style={paragraphStyle}>
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul style={listStyle}>
            <li>Email: legal@babyresell.com</li>
            <li>Address: 123 Legal Street, Terms City, TC 12345</li>
            <li>Phone: (555) 123-TERMS</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Entire Agreement</h2>
          <p style={paragraphStyle}>
            These Terms, together with our Privacy Policy and any other policies referenced 
            herein, constitute the entire agreement between you and BabyResell regarding 
            the use of the Service and supersede all prior agreements and understandings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;