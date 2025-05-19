import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Privacy = () => {
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
        <h1 style={titleStyle}>Privacy Policy</h1>
        <p style={lastUpdatedStyle}>Last updated: May 18, 2025</p>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Introduction</h2>
          <p style={paragraphStyle}>
            Welcome to BabyResell ("we," "our," or "us"). We are committed to protecting your privacy 
            and ensuring transparency about how we collect, use, and protect your personal information. 
            This Privacy Policy explains our practices regarding the collection, use, and disclosure of 
            information we receive from users of our website and mobile application.
          </p>
          <p style={paragraphStyle}>
            By using BabyResell, you agree to the terms of this Privacy Policy. If you do not agree 
            with any part of this policy, please do not use our services.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Information We Collect</h2>
          
          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Personal Information</h3>
          <p style={paragraphStyle}>We collect information you provide directly to us, including:</p>
          <ul style={listStyle}>
            <li>Account information (username, email address, password)</li>
            <li>Profile information (bio, location, profile picture)</li>
            <li>Listing information (item descriptions, photos, pricing)</li>
            <li>Transaction information (purchase and sale records)</li>
            <li>Communication data (messages between users)</li>
            <li>Payment information (processed securely through third-party payment processors)</li>
          </ul>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Automatically Collected Information</h3>
          <ul style={listStyle}>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, time spent on the platform, click patterns)</li>
            <li>Location information (if you enable location services)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>How We Use Your Information</h2>
          <p style={paragraphStyle}>We use the information we collect to:</p>
          <ul style={listStyle}>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            <li>Personalize and improve your experience</li>
            <li>Protect against fraudulent, unauthorized, or illegal activity</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Information Sharing and Disclosure</h2>
          <p style={paragraphStyle}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except in the following circumstances:
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>With Other Users</h3>
          <p style={paragraphStyle}>
            Your profile information and listings are visible to other users of the platform. 
            Messages you send to other users are shared with those specific users.
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Service Providers</h3>
          <p style={paragraphStyle}>
            We may share your information with third-party service providers who perform services 
            on our behalf, including payment processing, data analysis, email delivery, and customer service.
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Legal Requirements</h3>
          <p style={paragraphStyle}>
            We may disclose your information if required to do so by law or in response to valid 
            requests by public authorities (e.g., a court or government agency).
          </p>

          <h3 style={{ ...sectionTitleStyle, fontSize: '20px' }}>Business Transfers</h3>
          <p style={paragraphStyle}>
            In the event of a merger, acquisition, or sale of assets, your information may be 
            transferred as part of that transaction.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Data Security</h2>
          <p style={paragraphStyle}>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul style={listStyle}>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure data centers and infrastructure</li>
            <li>Employee training on data protection and privacy</li>
          </ul>
          <p style={paragraphStyle}>
            However, no method of transmission over the internet or electronic storage is 100% secure. 
            While we strive to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Data Retention</h2>
          <p style={paragraphStyle}>
            We retain your personal information for as long as necessary to provide our services, 
            comply with legal obligations, resolve disputes, and enforce our agreements. When determining 
            retention periods, we consider:
          </p>
          <ul style={listStyle}>
            <li>The nature and sensitivity of the information</li>
            <li>Legal and regulatory requirements</li>
            <li>The purposes for which we process the information</li>
            <li>Whether the purposes can be achieved through other means</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Your Rights and Choices</h2>
          <p style={paragraphStyle}>
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul style={listStyle}>
            <li><span style={strongStyle}>Access:</span> You can request access to your personal information</li>
            <li><span style={strongStyle}>Correction:</span> You can update or correct inaccurate information</li>
            <li><span style={strongStyle}>Deletion:</span> You can request deletion of your personal information</li>
            <li><span style={strongStyle}>Portability:</span> You can request a copy of your data in a portable format</li>
            <li><span style={strongStyle}>Opt-out:</span> You can opt out of certain communications and data processing</li>
          </ul>
          <p style={paragraphStyle}>
            To exercise these rights, please contact us at privacy@babyresell.com. We will respond 
            to your request within a reasonable timeframe and in accordance with applicable law.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Cookies and Tracking Technologies</h2>
          <p style={paragraphStyle}>
            We use cookies and similar tracking technologies to enhance your experience on our platform. 
            These technologies help us:
          </p>
          <ul style={listStyle}>
            <li>Remember your preferences and settings</li>
            <li>Analyze site traffic and usage patterns</li>
            <li>Provide personalized content and features</li>
            <li>Improve our services and user experience</li>
          </ul>
          <p style={paragraphStyle}>
            You can configure your browser to refuse cookies or alert you when cookies are being sent. 
            However, some features of our service may not function properly without cookies.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Third-Party Links</h2>
          <p style={paragraphStyle}>
            Our service may contain links to third-party websites or services. We are not responsible 
            for the privacy practices or content of these third parties. We encourage you to review 
            the privacy policies of any third-party sites or services you visit.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Children's Privacy</h2>
          <p style={paragraphStyle}>
            Our services are not intended for children under the age of 13. We do not knowingly 
            collect personal information from children under 13. If you are a parent or guardian 
            and believe your child has provided us with personal information, please contact us 
            immediately, and we will take steps to remove such information.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>International Data Transfers</h2>
          <p style={paragraphStyle}>
            Your information may be transferred to and processed in countries other than your country 
            of residence. These countries may have different data protection laws. We take appropriate 
            measures to ensure your information receives adequate protection in accordance with this 
            Privacy Policy and applicable laws.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Changes to This Privacy Policy</h2>
          <p style={paragraphStyle}>
            We may update this Privacy Policy from time to time to reflect changes in our practices 
            or applicable laws. We will notify you of any material changes by posting the new policy 
            on our website and updating the "Last updated" date. Your continued use of our services 
            after the changes take effect constitutes your acceptance of the updated policy.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Contact Us</h2>
          <p style={paragraphStyle}>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our 
            data practices, please contact us at:
          </p>
          <ul style={listStyle}>
            <li>Email: privacy@babyresell.com</li>
            <li>Address: 123 Privacy Street, Data City, DC 12345</li>
            <li>Phone: (555) 123-PRIVACY</li>
          </ul>
          <p style={paragraphStyle}>
            We will respond to your inquiries within a reasonable timeframe and work to address 
            your concerns promptly and effectively.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;