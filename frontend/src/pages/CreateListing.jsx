import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Image } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, uploadAPI } from '../services/api';
import UploadDebugger from '../components/UploadDebugger';

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

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any remaining object URLs
      images.forEach(image => {
        if (image.fullSize && image.fullSize.startsWith('blob:')) {
          URL.revokeObjectURL(image.fullSize);
        }
        if (image.thumbnail && image.thumbnail.startsWith('blob:')) {
          URL.revokeObjectURL(image.thumbnail);
        }
      });
    };
  }, [images]);

 // Fetch categories and age groups
  useEffect(() => {
    const fetchFormOptions = async () => {
      // Set default categories immediately
      const defaultCategories = [
        'Clothes & Shoes',
        'Toys & Games', 
        'Feeding (Non-liquid, Non-ediable)',
        'Diapering',
        'Bathing (Non-liquid)',
        'Nursery',
        'Carriers & Wraps',
        'Activity & Entertainment',
        'Books',
        'Blankets & Bedding',
        'Baby Gear',
        'Maternity',
        'Other'
      ];
      
      const defaultAgeGroups = [
        'Newborn (0-3 months)',
        'Infant (3-12 months)',
        'Toddler (1-3 years)',
        'Preschool (3-5 years)',
        'All Ages'
      ];
      
      // Set defaults first
      setCategories(defaultCategories);
      setAgeGroups(defaultAgeGroups);
      
      try {
        // Try to get categories from API
        const categoriesRes = await itemsAPI.getCategories();
        
        // Only use API response if it's successful and has data
        if (categoriesRes.data.success && categoriesRes.data.data && categoriesRes.data.data.length > 0) {
          setCategories(categoriesRes.data.data);
        }
        // If API fails or returns empty, we already have defaults set
      } catch (err) {
        console.error('Failed to fetch categories from API, using defaults:', err);
        // Defaults are already set, so we don't need to do anything here
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
    setError(null);
    
    try {
      // Process each file and create preview URLs
      const newImages = files.map(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file`);
        }
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`);
        }
        
        return {
          file: file, // Keep the actual file for upload
          fullSize: URL.createObjectURL(file), // Create preview URL
          thumbnail: URL.createObjectURL(file), // Same for thumbnail preview
          isPrimary: images.length === 0, // First image is primary
          name: file.name
        };
      });
      
      setImages(prev => [...prev, ...newImages]);
      setUploadingImages(false);
    } catch (err) {
      console.error('Image processing failed:', err);
      setError(err.message);
      setUploadingImages(false);
    }
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setImages(prev => {
      const imageToRemove = prev[index];
      
      // Clean up object URLs to prevent memory leaks
      if (imageToRemove.fullSize.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.fullSize);
      }
      if (imageToRemove.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.thumbnail);
      }
      
      const newImages = prev.filter((_, i) => i !== index);
      
      // If we removed the primary image, set the first image as primary
      if (imageToRemove.isPrimary && newImages.length > 0) {
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
      // First, upload all images
      const uploadedImages = [];
      
      console.log(`Starting upload of ${images.length} images...`);
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image.file) {
          console.log(`Uploading image ${i + 1}/${images.length}: ${image.name}`);
          
          // Create FormData for image upload
          const formData = new FormData();
          formData.append('image', image.file);
          
          // Log the file details
          console.log('File details:', {
            name: image.file.name,
            size: image.file.size,
            type: image.file.type
          });
          
          try {
            const uploadRes = await uploadAPI.uploadImage(formData);
            console.log('Upload response:', uploadRes.data);
            
            if (uploadRes.data.success) {
              uploadedImages.push({
                fullSize: uploadRes.data.data.fullSize,
                thumbnail: uploadRes.data.data.thumbnail,
                isPrimary: image.isPrimary
              });
              console.log(`Image ${i + 1} uploaded successfully`);
            } else {
              throw new Error(uploadRes.data.message || 'Upload failed');
            }
          } catch (uploadError) {
            console.error('Detailed upload error:', {
              error: uploadError,
              response: uploadError.response?.data,
              status: uploadError.response?.status,
              statusText: uploadError.response?.statusText
            });
            
            // More detailed error message
            let errorMessage = 'Unknown upload error';
            if (uploadError.response?.data?.message) {
              errorMessage = uploadError.response.data.message;
            } else if (uploadError.response?.data?.error) {
              errorMessage = uploadError.response.data.error;
            } else if (uploadError.message) {
              errorMessage = uploadError.message;
            }
            
            throw new Error(`Failed to upload ${image.name}: ${errorMessage}`);
          }
        }
      }
      
      if (uploadedImages.length === 0) {
        throw new Error('No images were uploaded successfully');
      }
      
      console.log(`All images uploaded successfully. Creating item...`);
      
      // Prepare the item data according to your BabyItem model
      const itemData = {
        title: formData.title,
        description: formData.description,
        price: formData.isForSale ? parseFloat(formData.price) : 0,
        category: formData.category,
        ageGroup: formData.ageGroup,
        condition: formData.condition,
        brand: formData.brand || undefined,
        color: formData.color || undefined,
        location: formData.location || undefined,
        tags: formData.tags,
        images: uploadedImages,
        shippingOptions: {
          localPickup: true,
          shipping: false,
          shippingCost: 0
        }
      };
      
      console.log('Creating item with data:', itemData);
      
      // Create the item using your API
      const createRes = await itemsAPI.createItem(itemData);
      console.log('Create item response:', createRes.data);
      
      if (createRes.data.success) {
        console.log('Item created successfully:', createRes.data.data);
        
        // Clean up object URLs
        images.forEach(image => {
          if (image.fullSize && image.fullSize.startsWith('blob:')) {
            URL.revokeObjectURL(image.fullSize);
          }
          if (image.thumbnail && image.thumbnail.startsWith('blob:')) {
            URL.revokeObjectURL(image.thumbnail);
          }
        });
        
        setLoading(false);
        
        // Show success message briefly
        setError(null);
        
        // Redirect to the home page
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        throw new Error(createRes.data.message || 'Failed to create item');
      }
    } catch (err) {
      console.error('Failed to create listing:', err);
      
      // Show specific error messages
      if (err.response?.data?.message) {
        setError(`Server error: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`Server error: ${err.response.data.error}`);
      } else if (err.message.includes('upload')) {
        setError(err.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create listing. Please try again.');
      }
      
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

  const successStyle = {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center'
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

        {loading && (
          <div style={successStyle}>
            Creating your listing... Please wait.
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