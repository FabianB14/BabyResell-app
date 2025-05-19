import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Heart, Shield, Users, Star, Award, Sparkles } from 'lucide-react';

const About = () => {
  const { themeColors } = useTheme();

  // Style objects
  const containerStyle = {
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: themeColors.background,
    padding: '40px 20px'
  };

  const contentStyle = {
    maxWidth: '1000px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '60px'
  };

  const titleStyle = {
    color: themeColors.text,
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px'
  };

  const subtitleStyle = {
    color: themeColors.textSecondary,
    fontSize: '20px',
    lineHeight: '1.6',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const sectionStyle = {
    marginBottom: '60px'
  };

  const sectionTitleStyle = {
    color: themeColors.text,
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '24px',
    textAlign: 'center'
  };

  const cardStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };

  const featureCardStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  };

  const iconContainerStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: themeColors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  };

  const paragraphStyle = {
    color: themeColors.text,
    fontSize: '16px',
    lineHeight: '1.8',
    marginBottom: '20px'
  };

  const teamMemberStyle = {
    backgroundColor: themeColors.cardBackground,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  };

  const avatarStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: themeColors.secondary,
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: 'bold',
    color: themeColors.primary
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>About BabyResell</h1>
          <p style={subtitleStyle}>
            We're on a mission to make buying and selling pre-loved baby items simple, 
            safe, and sustainable for parents everywhere.
          </p>
        </div>

        {/* Our Story */}
        <div style={sectionStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Our Story</h2>
            <p style={paragraphStyle}>
              BabyResell was born from a simple observation: babies grow incredibly fast, 
              and parents often find themselves with closets full of barely-used items. 
              Meanwhile, other parents are looking for affordable, quality baby gear 
              without the premium price tag.
            </p>
            <p style={paragraphStyle}>
              Founded in 2024, we created a platform that bridges this gap with a 
              Pinterest-inspired visual experience that makes discovering baby items 
              as enjoyable as browsing your favorite social media feed. Our seasonal 
              themes and intuitive interface transform the traditional marketplace 
              experience into something beautiful and engaging.
            </p>
            <p style={paragraphStyle}>
              What started as a local initiative has grown into a trusted community 
              of thousands of parents who believe in giving baby items a second life, 
              saving money, and reducing waste in the process.
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Our Mission</h2>
          <div style={gridStyle}>
            <div style={featureCardStyle}>
              <div style={iconContainerStyle}>
                <Heart size={30} color="white" />
              </div>
              <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
                Supporting Families
              </h3>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                We help families save money by making quality baby items accessible 
                at affordable prices, while also helping parents earn from items their children have outgrown.
              </p>
            </div>

            <div style={featureCardStyle}>
              <div style={iconContainerStyle}>
                <Shield size={30} color="white" />
              </div>
              <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
                Safety First
              </h3>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                Every listing includes detailed safety information and condition descriptions. 
                We provide guidelines to ensure all baby items meet current safety standards.
              </p>
            </div>

            <div style={featureCardStyle}>
              <div style={iconContainerStyle}>
                <Sparkles size={30} color="white" />
              </div>
              <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
                Sustainable Future
              </h3>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                By promoting the reuse of baby items, we're helping reduce waste and 
                environmental impact, creating a more sustainable future for our children.
              </p>
            </div>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div style={sectionStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>What Makes Us Different</h2>
            <div style={gridStyle}>
              <div>
                <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
                  ✨ Beautiful Visual Discovery
                </h3>
                <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  Our Pinterest-style layout makes browsing baby items visually delightful 
                  and helps you discover items you never knew you needed.
                </p>
              </div>

              <div>
                <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
                  🎨 Seasonal Themes
                </h3>
                <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  Our platform automatically adapts to seasons and holidays, creating 
                  a fresh, engaging experience throughout the year.
                </p>
              </div>

              <div>
                <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
                  🛡️ Secure Transactions
                </h3>
                <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  Built-in payment processing and buyer protection give you peace of mind 
                  with every transaction.
                </p>
              </div>

              <div>
                <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>
                  📱 Multi-Platform Access
                </h3>
                <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  Access BabyResell from any device - web, iOS, or Android - with a 
                  seamless experience across all platforms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Meet Our Team</h2>
          <div style={gridStyle}>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>JD</div>
              <h3 style={{ color: themeColors.text, marginBottom: '8px' }}>Jane Doe</h3>
              <h4 style={{ color: themeColors.primary, marginBottom: '12px', fontSize: '14px' }}>
                Founder & CEO
              </h4>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                A mother of two who understands the challenges of finding quality baby items 
                on a budget. Jane's vision drives BabyResell's mission.
              </p>
            </div>

            <div style={teamMemberStyle}>
              <div style={avatarStyle}>MS</div>
              <h3 style={{ color: themeColors.text, marginBottom: '8px' }}>Mike Smith</h3>
              <h4 style={{ color: themeColors.primary, marginBottom: '12px', fontSize: '14px' }}>
                CTO
              </h4>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                With 10+ years in tech, Mike ensures our platform is secure, scalable, 
                and delivers the best user experience possible.
              </p>
            </div>

            <div style={teamMemberStyle}>
              <div style={avatarStyle}>SJ</div>
              <h3 style={{ color: themeColors.text, marginBottom: '8px' }}>Sarah Johnson</h3>
              <h4 style={{ color: themeColors.primary, marginBottom: '12px', fontSize: '14px' }}>
                Head of Design
              </h4>
              <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                Sarah's creative vision brings beauty and functionality together, making 
                BabyResell a joy to use for parents everywhere.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div style={sectionStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Our Values</h2>
            <div style={gridStyle}>
              <div style={featureCardStyle}>
                <div style={iconContainerStyle}>
                  <Users size={30} color="white" />
                </div>
                <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>Community</h3>
                <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  We're building more than a marketplace - we're creating a community 
                  of parents who support each other.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={iconContainerStyle}>
                  <Star size={30} color="white" />
                </div>
                <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>Trust</h3>
                <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  Every feature we build is designed with trust and transparency at its core, 
                  ensuring safe transactions for all users.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={iconContainerStyle}>
                  <Award size={30} color="white" />
                </div>
                <h3 style={{ color: themeColors.text, marginBottom: '12px' }}>Quality</h3>
                <p style={{ color: themeColors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  We're committed to providing a premium experience that makes buying 
                  and selling baby items simple and enjoyable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Join Us */}
        <div style={sectionStyle}>
          <div style={{
            ...cardStyle,
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`,
            textAlign: 'center',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
              Join Our Community
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
              Ready to start your BabyResell journey? Join thousands of parents who are 
              already saving money and reducing waste.
            </p>
            <button
              style={{
                backgroundColor: 'white',
                color: themeColors.primary,
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              onClick={() => window.location.href = '/register'}
            >
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;