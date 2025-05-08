import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Image } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, uploadAPI } from '../services/api';

const CreateListing = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ageGroup: '',
    brand: '',
    condition: 'Like New',
    color: '',
    price: '',
    isForSale: true,
    location: '',
    tags: []
  });
  
  // Images state
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Other states
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tag, setTag] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/create-listing' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch categories and age groups
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        // Get categories
        const categoriesRes = await itemsAPI.getCategories();
        
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        } else {
          // Fallback categories if API fails
          setCategories([
            'Bathing & Skincare',
            'Carriers & Wraps',
            'Clothes & Shoes',
            'Diapering',
            'Feeding',
            'Health & Safety',
            'Nursery',
            'Strollers & Car Seats',
            'Toys & Games'
          ]);
        }
        
        // For age groups, we'll use predefined values since they're less likely to change
        setAgeGroups([
          'Newborn (0-3 months)',
          'Infant (3-12 months)',
          'Toddler (1-3 years)',
          'Preschool (3-5 years)',
          'All Ages'
        ]);
      } catch (err) {
        console.error('Failed to fetch form options:', err);
        // Set fallback values
        setCategories([
          'Bathing & Skincare',
          'Carriers & Wraps',
          'Clothes & Shoes',
          'Diapering',
          'Feeding',
          'Health & Safety',
          'Nursery',
          'Strollers & Car Seats',
          'Toys & Games'
        ]);
      }
    };
    
    fetchFormOptions();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setUploadingImages(true);
    
    try {
      // In a real app, this would upload to your API
      // Here we're just simulating it
      setTimeout(() => {
        const newImages = files.map(file => ({
          fullSize: URL.createObjectURL(file),
          thumbnail: URL.createObjectURL(file),
          isPrimary: images.length === 0,
          file // Keep the file reference for real upload later
        }));
        
        setImages(prev => [...prev, ...newImages]);
        setUploadingImages(false);
      }, 1000);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Failed to upload images. Please try again.');
      setUploadingImages(false);
    }
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      
      // If we removed the primary image, set the first image as primary
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      
      return newImages;
    });
  };

  // Set image as primary
  const setImageAsPrimary = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  // Add a tag
  const addTag = () => {
    if (!tag.trim()) return;
    if (formData.tags.includes(tag.trim())) return;
    if (formData.tags.length >= 5) {
      setError('Maximum 5 tags allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag.trim()]
    }));
    setTag('');
  };

  // Remove a tag
  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call your API to create a new item
      // Here we're just simulating success
      setTimeout(() => {
        navigate('/');
        // You could also redirect to the new item's detail page
        // navigate(`/item/new-item-id`);
      }, 1500);
    } catch (err) {
      console.error('Failed to create listing:', err);
      setError('Failed to create listing. Please try again.');
      setLoading(false);
    }
  };

  // Style objects
  const containerStyle = {
    minHeight: '100vh',
    padding: '0 0 80px',
    backgroundColor: themeColors.background
  };

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    padding: '16px',
    backgroundColor: themeColors.cardBackground,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const formContainerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px'
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
    padding: '12px',
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

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px'
  };

  const buttonStyle = (primary = true) => ({
    backgroundColor: primary ? themeColors.primary : 'transparent',
    color: primary ? 'white' : themeColors.text,
    border: primary ? 'none' : `1px solid ${themeColors.text}`,
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: '1'
  });

  const conditionButtonStyle = (isSelected) => ({
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    flex: '1',
    textAlign: 'center',
    backgroundColor: isSelected ? themeColors.primary : 'transparent',
    color: isSelected ? 'white' : themeColors.text,
    border: isSelected ? 'none' : `1px solid ${themeColors.text}`,
    cursor: 'pointer'
  });

  const imageUploadStyle = {
    width: '100px',
    height: '100px',
    backgroundColor: themeColors.secondary,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };

  const imagePreviewStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    backgroundSize: 'cover',
    position: 'relative'
  };

  const errorStyle = {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ color: themeColors.text, fontSize: '20px' }}>Create Listing</h1>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: 'transparent',
            color: themeColors.text,
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
      
      <div style={formContainerStyle}>
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Images */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Photos (Required)</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <label style={imageUploadStyle}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingImages || images.length >= 5}
                />
                <Plus size={24} color={themeColors.textSecondary} />
                <span style={{ fontSize: '12px', marginTop: '4px', color: themeColors.textSecondary }}>
                  Add Photo
                </span>
              </label>
              
              {images.map((image, index) => (
                <div
                  key={index}
                  style={{
                    ...imagePreviewStyle,
                    backgroundImage: `url(${image.thumbnail})`
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} color="white" />
                  </button>
                  
                  {image.isPrimary ? (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: themeColors.primary,
                        color: 'white',
                        fontSize: '10px'
                      }}
                    >
                      Main
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setImageAsPrimary(index)}
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        fontSize: '10px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Set Main
                    </button>
                  )}
                </div>
              ))}
              
              {uploadingImages && (
                <div style={{ ...imagePreviewStyle, backgroundColor: themeColors.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="loader-sm"></div>
                </div>
              )}
            </div>
            <p style={{ fontSize: '12px', marginTop: '8px', color: themeColors.textSecondary }}>
              Upload up to 5 photos. First photo will be the main image.
            </p>
          </div>
          
          {/* Title */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="What are you selling?"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          
          {/* Category */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={selectStyle}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Age Group */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="ageGroup">Age Group</label>
            <select
              id="ageGroup"
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              style={selectStyle}
              required
            >
              <option value="">Select an age group</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
          
          {/* Condition */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Condition</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['New', 'Like New', 'Good', 'Fair', 'Poor'].map(condition => (
                <button
                  key={condition}
                  type="button"
                  style={conditionButtonStyle(formData.condition === condition)}
                  onClick={() => setFormData(prev => ({ ...prev, condition }))}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price */}
          <div style={formGroupStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="checkbox"
                id="isForSale"
                name="isForSale"
                checked={formData.isForSale}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              <label style={{ color: themeColors.text }} htmlFor="isForSale">
                Item for Sale
              </label>
            </div>
            
            {formData.isForSale && (
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: themeColors.textSecondary 
                }}>
                  $
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingLeft: '24px' }}
                  required={formData.isForSale}
                />
              </div>
            )}
          </div>
          
          {/* Description */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your item..."
              value={formData.description}
              onChange={handleChange}
              style={textareaStyle}
              required
            />
          </div>
          
          {/* Brand */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              placeholder="e.g. Fisher-Price, Carter's"
              value={formData.brand}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          
          {/* Color */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              placeholder="e.g. Blue, Pink, Multi"
              value={formData.color}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          
          {/* Location */}
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g. Seattle, WA"
              value={formData.location}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          
          {/* Tags */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="e.g. organic, handmade"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={{ ...inputStyle, borderRadius: '8px 0 0 8px' }}
              />
              <button
                type="button"
                onClick={addTag}
                style={{
                  backgroundColor: themeColors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0 8px 8px 0',
                  padding: '0 16px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.tags.map((t, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: themeColors.secondary,
                      color: themeColors.text,
                      padding: '4px 8px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      style={{
                        marginLeft: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0',
                        display: 'flex',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} color={themeColors.text} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button
              type="button"
              style={buttonStyle(false)}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={buttonStyle(true)}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;