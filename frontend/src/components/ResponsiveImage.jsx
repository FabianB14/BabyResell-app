import React, { useState, useEffect } from 'react';

/**
 * ResponsiveImage Component
 * 
 * A universal image component that handles:
 * - Loading states with spinner
 * - Error handling with fallback images
 * - Cross-platform compatibility (Web, iOS, Android)
 * - Lazy loading support
 * - Progressive image loading
 */
const ResponsiveImage = ({ 
  src, 
  alt = 'Image',
  fallbackSrc = 'https://via.placeholder.com/300x300?text=No+Image',
  className = '',
  style = {},
  onLoad,
  onError,
  lazy = true,
  placeholder = null,
  objectFit = 'cover'
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);

  // Handle lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const imageElement = document.getElementById(`img-${src}`);
    if (!imageElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(imageElement);

    return () => {
      if (imageElement) {
        observer.unobserve(imageElement);
      }
    };
  }, [src, lazy]);

  // Update image src when in view
  useEffect(() => {
    if (isInView && imageSrc !== src) {
      setImageSrc(src);
    }
  }, [isInView, src, imageSrc]);

  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    setError(true);
    setLoading(false);
    
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setError(false); // Reset error state for fallback attempt
      setLoading(true);
    } else {
      // Even fallback failed, show a colored placeholder
      if (onError) onError();
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    if (onLoad) onLoad();
  };

  // Container style for maintaining aspect ratio
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    ...style
  };

  // Loading spinner styles
  const spinnerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30px',
    height: '30px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #e60023',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  // Error placeholder styles
  const errorPlaceholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    color: '#999'
  };

  return (
    <div id={`img-${src}`} style={containerStyle} className={className}>
      {/* Loading spinner */}
      {loading && !error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}>
          <div style={spinnerStyle}></div>
        </div>
      )}
      
      {/* Error placeholder */}
      {error && imageSrc === fallbackSrc && (
        <div style={errorPlaceholderStyle}>
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span style={{ marginTop: '8px', fontSize: '12px' }}>Image not available</span>
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFit,
            display: error && imageSrc === fallbackSrc ? 'none' : 'block',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
      
      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Higher order component for image optimization
export const OptimizedImage = ({ src, width, height, quality = 75, ...props }) => {
  // For DigitalOcean Spaces or other CDNs, you could add image transformation params
  const optimizedSrc = src; // In production, add CDN transformation params
  
  return (
    <ResponsiveImage
      src={optimizedSrc}
      {...props}
    />
  );
};

// Component for handling multiple image sources (srcset equivalent)
export const PictureImage = ({ sources, alt, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(sources[0]?.src || '');
  
  useEffect(() => {
    // Simple responsive logic - could be enhanced
    const handleResize = () => {
      const width = window.innerWidth;
      const appropriateSource = sources.find(source => 
        !source.minWidth || width >= source.minWidth
      );
      if (appropriateSource && appropriateSource.src !== currentSrc) {
        setCurrentSrc(appropriateSource.src);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sources, currentSrc]);
  
  return <ResponsiveImage src={currentSrc} alt={alt} {...props} />;
};

export default ResponsiveImage;