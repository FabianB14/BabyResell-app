import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Edit, Grid, Heart, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, itemsAPI } from '../services/api';
import PinItem from '../components/items/PinItem';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [stats, setStats] = useState({
    pinCount: 0,
    likesReceived: 0,
    followersCount: 0,
    followingCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [following, setFollowing] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = isAuthenticated && (
    !id || id === 'me' || id === currentUser?._id
  );

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (isOwnProfile && currentUser) {
          setUser(currentUser);
          
          // Fetch saved items
          const savedRes = await itemsAPI.getAllItems({ 
            saved: true, 
            limit: 12 
          });
          
          if (savedRes.data.success) {
            setSavedItems(savedRes.data.data);
          }
        } else {
          // Fetch other user's profile
          const userId = id === 'me' ? currentUser?._id : id;
          
          if (!userId) {
            navigate('/login');
            return;
          }
          
          const res = await userAPI.getUser(userId);
          
          if (res.data.success) {
            setUser(res.data.data.user);
            setUserItems(res.data.data.pins);
            setStats(res.data.data.stats);
            
            // Check if current user is following this user
            if (isAuthenticated && currentUser?.following) {
              setFollowing(currentUser.following.some(
                followId => followId === userId
              ));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id, isAuthenticated, currentUser, isOwnProfile, navigate]);

  // Fetch user items if viewing own profile
  useEffect(() => {
    const fetchUserItems = async () => {
      if (!isOwnProfile || !user) return;
      
      try {
        const res = await itemsAPI.getAllItems({ 
          user: user._id,
          limit: 12
        });
        
        if (res.data.success) {
          setUserItems(res.data.data);
          setStats(prev => ({
            ...prev,
            pinCount: res.data.pagination.total
          }));
        }
      } catch (err) {
        console.error('Failed to fetch user items:', err);
      }
    };
    
    fetchUserItems();
  }, [user, isOwnProfile]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/user/${id}` } });
      return;
    }
    
    try {
      if (following) {
        await userAPI.unfollowUser(user._id);
        setFollowing(false);
        setStats(prev => ({
          ...prev,
          followersCount: prev.followersCount - 1
        }));
      } else {
        await userAPI.followUser(user._id);
        setFollowing(true);
        setStats(prev => ({
          ...prev,
          followersCount: prev.followersCount + 1
        }));
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: themeColors.background }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>Error</h2>
          <p className="text-gray-700 mb-4">{error || 'User not found'}</p>
          <button 
            className="w-full py-2 rounded font-medium"
            style={{ backgroundColor: themeColors.primary, color: 'white' }}
            onClick={() => navigate('/')}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: themeColors.background }}>
      {/* Profile Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mr-4">
            <img 
              src={user.profileImage || '/default-profile.jpg'} 
              alt={user.username} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: themeColors.text }}>{user.username}</h1>
            
            {user.bio && (
              <p className="text-sm text-gray-700 mt-1 mb-2">{user.bio}</p>
            )}
            
            <div className="flex space-x-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">{stats.pinCount}</span> posts
              </div>
              <div>
                <span className="font-medium">{stats.followersCount}</span> followers
              </div>
              <div>
                <span className="font-medium">{stats.followingCount}</span> following
              </div>
            </div>
          </div>
          
          {isOwnProfile ? (
            <button 
              className="px-4 py-2 rounded-full border text-sm font-medium"
              onClick={() => navigate('/edit-profile')}
            >
              <Edit size={18} className="inline mr-1" />
              Edit
            </button>
          ) : (
            <button 
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: following ? 'white' : themeColors.primary, 
                color: following ? 'black' : 'white',
                borderWidth: following ? 1 : 0,
                borderStyle: 'solid',
                borderColor: '#e2e8f0'
              }}
              onClick={handleFollowToggle}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button 
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'items' ? 'border-b-2' : ''
          }`}
          style={{ 
            color: activeTab === 'items' ? themeColors.primary : 'gray',
            borderColor: themeColors.primary 
          }}
          onClick={() => setActiveTab('items')}
        >
          <Grid size={18} className="inline mr-1" />
          Items
        </button>
        
        {isOwnProfile && (
          <button 
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'saved' ? 'border-b-2' : ''
            }`}
            style={{ 
              color: activeTab === 'saved' ? themeColors.primary : 'gray',
              borderColor: themeColors.primary 
            }}
            onClick={() => setActiveTab('saved')}
          >
            <Heart size={18} className="inline mr-1" />
            Saved
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {activeTab === 'items' && (
          <>
            {userItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid size={24} className="text-gray-400" />
                </div>
                <h3 className="font-medium mb-1" style={{ color: themeColors.text }}>No items yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {isOwnProfile ? 'You haven\'t posted any items yet.' : 'This user hasn\'t posted any items yet.'}
                </p>
                
                {isOwnProfile && (
                  <button 
                    className="px-4 py-2 rounded text-sm font-medium text-white"
                    style={{ backgroundColor: themeColors.primary }}
                    onClick={() => navigate('/create-listing')}
                  >
                    Create Listing
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {userItems.map(item => (
                  <PinItem key={item._id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'saved' && isOwnProfile && (
          <>
            {savedItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-gray-400" />
                </div>
                <h3 className="font-medium mb-1" style={{ color: themeColors.text }}>No saved items</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Items you save will appear here.
                </p>
                
                <button 
                  className="px-4 py-2 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: themeColors.primary }}
                  onClick={() => navigate('/')}
                >
                  Browse Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {savedItems.map(item => (
                  <PinItem key={item._id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Bottom Actions (for own profile) */}
      {isOwnProfile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
          <div className="flex justify-around">
            <button 
              className="flex flex-col items-center text-gray-500"
              onClick={() => navigate('/')}
            >
              <Grid size={20} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              className="flex flex-col items-center"
              style={{ color: themeColors.primary }}
              onClick={() => navigate('/profile')}
            >
              <UserIcon size={20} />
              <span className="text-xs mt-1">Profile</span>
            </button>
            <button 
              className="flex flex-col items-center text-gray-500"
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
              <span className="text-xs mt-1">Settings</span>
            </button>
            <button 
              className="flex flex-col items-center text-gray-500"
              onClick={logout}
            >
              <LogOut size={20} />
              <span className="text-xs mt-1">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;