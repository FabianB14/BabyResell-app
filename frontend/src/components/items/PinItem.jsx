import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { itemsAPI } from '../../services/api';

const PinItem = ({ item, height, onSave }) => {
  const { themeColors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = React.useState(item?.saves?.includes(item.user._id) || false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login or show a modal
      return;
    }

    try {
      if (saved) {
        await itemsAPI.unsaveItem(item._id);
        setSaved(false);
      } else {
        await itemsAPI.saveItem(item._id);
        setSaved(true);
      }
      
      // Call parent handler if provided
      if (onSave) {
        onSave(item._id, !saved);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  if (!item) return null;

  return (
    <Link 
      to={`/item/${item._id}`} 
      className="block rounded-lg overflow-hidden shadow-sm cursor-pointer mb-4 bg-white transition-transform hover:shadow-md hover:-translate-y-1"
    >
      <div className="relative">
        <img 
          src={item.thumbnail || item.image} 
          alt={item.title} 
          className="w-full h-full object-cover"
          style={{ height: height || '200px' }}
        />
        <button 
          className="absolute bottom-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          onClick={handleSave}
        >
          <Heart 
            size={16} 
            className={saved ? 'fill-current text-red-500' : 'text-gray-500'} 
          />
        </button>
        
        {item.isForSale && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-white rounded-full text-xs font-semibold shadow-sm" style={{ color: themeColors.primary }}>
            ${item.price?.toFixed(2)}
          </div>
        )}
        
        {item.condition && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-white bg-opacity-80 rounded-full text-xs shadow-sm">
            {item.condition}
          </div>
        )}
      </div>
      
      <div className="p-2">
        <h3 className="text-sm font-medium truncate">{item.title}</h3>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <img 
            src={item.user?.profileImage || '/default-profile.jpg'} 
            alt={item.user?.username} 
            className="w-4 h-4 rounded-full mr-1"
          />
          <span>{item.user?.username}</span>
        </div>
      </div>
    </Link>
  );
};

export default PinItem;