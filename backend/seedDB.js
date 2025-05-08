// Save this file as seedDB.js in your backend directory

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BabyItem = require('./models/BabyItem');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample user for items
const createSampleUser = async () => {
  try {
    // Check if admin user exists
    let adminUser = await User.findOne({ email: 'admin@babyresell.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@babyresell.com',
        password: 'password123', // Change this in production!
        role: 'admin',
        isAdmin: true,
        isVerified: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    return adminUser;
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

// Sample baby items
const sampleItems = [
  {
    title: 'Baby Carrier - Like New',
    description: 'High-quality baby carrier in excellent condition. Used only a few times.',
    price: 45.00,
    category: 'Carriers & Wraps',
    ageGroup: 'Infant (3-12 months)',
    condition: 'Like New',
    brand: 'BabyBjörn',
    color: 'Grey',
    images: [
      {
        fullSize: 'https://via.placeholder.com/800x600?text=Baby+Carrier',
        thumbnail: 'https://via.placeholder.com/300x300?text=Baby+Carrier',
        isPrimary: true
      }
    ],
    isForSale: true,
    status: 'active',
    tags: ['carrier', 'baby', 'bjorn']
  },
  {
    title: 'Wooden Crib with Mattress',
    description: 'Beautiful wooden crib with mattress included. Adjustable height settings.',
    price: 120.00,
    category: 'Nursery',
    ageGroup: 'Newborn (0-3 months)',
    condition: 'Good',
    brand: 'Pottery Barn Kids',
    color: 'Natural Wood',
    images: [
      {
        fullSize: 'https://via.placeholder.com/800x600?text=Wooden+Crib',
        thumbnail: 'https://via.placeholder.com/300x300?text=Wooden+Crib',
        isPrimary: true
      }
    ],
    isForSale: true,
    status: 'active',
    tags: ['crib', 'bed', 'nursery', 'wood']
  },
  {
    title: 'Baby Toys Bundle',
    description: 'Collection of 10 educational toys for babies 6-12 months. All in great condition.',
    price: 35.00,
    category: 'Toys & Games',
    ageGroup: 'Infant (3-12 months)',
    condition: 'Good',
    brand: 'Various',
    color: 'Multi',
    images: [
      {
        fullSize: 'https://via.placeholder.com/800x600?text=Baby+Toys',
        thumbnail: 'https://via.placeholder.com/300x300?text=Baby+Toys',
        isPrimary: true
      }
    ],
    isForSale: true,
    status: 'active',
    tags: ['toys', 'educational', 'bundle']
  },
  {
    title: 'Baby Stroller - Foldable',
    description: 'Compact, lightweight stroller that folds easily for travel. Good condition with minor wear.',
    price: 75.00,
    category: 'Strollers & Car Seats',
    ageGroup: 'All Ages',
    condition: 'Good',
    brand: 'Chicco',
    color: 'Black',
    images: [
      {
        fullSize: 'https://via.placeholder.com/800x600?text=Baby+Stroller',
        thumbnail: 'https://via.placeholder.com/300x300?text=Baby+Stroller',
        isPrimary: true
      }
    ],
    isForSale: true,
    status: 'active',
    tags: ['stroller', 'travel', 'portable']
  },
  {
    title: 'Diaper Bag - Designer',
    description: 'Stylish diaper bag with multiple compartments. Looks like a regular handbag!',
    price: 50.00,
    category: 'Diapering',
    ageGroup: 'All Ages',
    condition: 'Like New',
    brand: 'Skip Hop',
    color: 'Brown',
    images: [
      {
        fullSize: 'https://via.placeholder.com/800x600?text=Diaper+Bag',
        thumbnail: 'https://via.placeholder.com/300x300?text=Diaper+Bag',
        isPrimary: true
      }
    ],
    isForSale: true,
    status: 'active',
    tags: ['diaper', 'bag', 'storage']
  },
  {
    title: 'Baby Bath Set',
    description: 'Complete bath set including infant tub, rinser, and bath toys.',
    price: 25.00,
    category: 'Bathing & Skincare',
    ageGroup: 'Newborn (0-3 months)',
    condition: 'Good',
    brand: 'The First Years',
    color: 'Blue',
    images: [
      {
        fullSize: 'https://via.placeholder.com/800x600?text=Bath+Set',
        thumbnail: 'https://via.placeholder.com/300x300?text=Bath+Set',
        isPrimary: true
      }
    ],
    isForSale: true,
    status: 'active',
    tags: ['bath', 'tub', 'skincare']
  }
];

// Function to populate database
const importData = async () => {
  try {
    // Clear existing data (optional)
    // await BabyItem.deleteMany();
    // console.log('Existing items deleted');
    
    // Create admin user
    const adminUser = await createSampleUser();
    
    // Add user reference to each item
    const itemsWithUser = sampleItems.map(item => ({
      ...item,
      user: adminUser._id
    }));
    
    // Import sample data
    await BabyItem.create(itemsWithUser);
    console.log('Data imported successfully');
    process.exit();
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
};

// Run the import
importData();