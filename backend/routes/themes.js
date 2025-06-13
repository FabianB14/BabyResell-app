const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   POST /api/themes
// @desc    Create a new theme
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.createdBy = req.user.id;
  
  // Create theme
  const theme = await Theme.create(req.body);
  
  res.status(201).json({
    success: true,
    data: theme
  });
}));

// @route   GET /api/themes
// @desc    Get all themes
// @access  Public
router.get('/', asyncHandler(async (req, res, next) => {
  let query = {};
  
  // Filter by isActive
  if (req.query.active === 'true') {
    query.isActive = true;
  }
  
  // Filter by isHoliday or isSeasonal
  if (req.query.holiday === 'true') {
    query.isHoliday = true;
  } else if (req.query.seasonal === 'true') {
    query.isSeasonal = true;
  }
  
  // Get themes
  const themes = await Theme.find(query).sort({ name: 1 });
  
  res.status(200).json({
    success: true,
    count: themes.length,
    data: themes
  });
}));

// @route   GET /api/themes/active
// @desc    Get the currently active theme
// @access  Public
router.get('/active', asyncHandler(async (req, res, next) => {
  const theme = await Theme.findOne({ isActive: true });
  
  if (!theme) {
    return next(new ErrorResponse('No active theme found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: theme
  });
}));

// @route   GET /api/themes/:id
// @desc    Get theme by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);
  
  if (!theme) {
    return next(new ErrorResponse(`Theme not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: theme
  });
}));

// @route   PUT /api/themes/:id
// @desc    Update theme
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let theme = await Theme.findById(req.params.id);
  
  if (!theme) {
    return next(new ErrorResponse(`Theme not found with id of ${req.params.id}`, 404));
  }
  
  // If setting this theme as active, deactivate all other themes
  if (req.body.isActive === true) {
    await Theme.updateMany({}, { isActive: false });
  }
  
  // Update theme
  theme = await Theme.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: theme
  });
}));

// @route   DELETE /api/themes/:id
// @desc    Delete theme
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);
  
  if (!theme) {
    return next(new ErrorResponse(`Theme not found with id of ${req.params.id}`, 404));
  }
  
  // Prevent deletion of active theme
  if (theme.isActive) {
    return next(new ErrorResponse('Cannot delete the active theme', 400));
  }
  
  await theme.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}));

// @route   POST /api/themes/:id/activate
// @desc    Activate a theme (and deactivate all others)
// @access  Private/Admin
router.post('/:id/activate', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);
  
  if (!theme) {
    return next(new ErrorResponse(`Theme not found with id of ${req.params.id}`, 404));
  }
  
  // Deactivate all themes
  await Theme.updateMany({}, { isActive: false });
  
  // Activate the selected theme
  theme.isActive = true;
  await theme.save();
  
  res.status(200).json({
    success: true,
    message: `Theme "${theme.name}" activated successfully`,
    data: theme
  });
}));

// @route   POST /api/themes/:id/activate
// @desc    Activate theme globally for all users
// @access  Private/Admin
router.post('/:id/activate', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);
  
  if (!theme) {
    return next(new ErrorResponse(`Theme not found with id of ${req.params.id}`, 404));
  }
  
  try {
    // Start a transaction to ensure consistency
    await Theme.startSession();
    
    // Deactivate all themes first
    await Theme.updateMany({}, { isActive: false });
    
    // Activate the selected theme
    const activatedTheme = await Theme.findByIdAndUpdate(
      req.params.id, 
      { 
        isActive: true,
        activatedAt: new Date(),
        activatedBy: req.user.id
      }, 
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: activatedTheme,
      message: `Theme "${activatedTheme.displayName || activatedTheme.name}" has been activated globally`
    });
    
  } catch (error) {
    console.error('Error activating theme:', error);
    return next(new ErrorResponse('Failed to activate theme', 500));
  }
}));

// @route   POST /api/themes/activate-by-name
// @desc    Activate theme by name (for predefined themes)
// @access  Private/Admin
router.post('/activate-by-name', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { themeName } = req.body;
  
  if (!themeName) {
    return next(new ErrorResponse('Theme name is required', 400));
  }
  
  try {
    // First, try to find existing theme by name
    let theme = await Theme.findOne({ name: themeName });
    
    // If theme doesn't exist, create it with predefined colors
    if (!theme) {
      const predefinedThemes = {
        spring: {
          name: 'spring',
          displayName: 'Spring Bloom',
          colors: {
            primary: '#10b981',
            secondary: '#d1fae5',
            accent: '#34d399',
            background: '#ecfdf5',
            cardBackground: '#ffffff',
            text: '#065f46',
            textSecondary: '#6b7280'
          },
          isSeasonal: true
        },
        summer: {
          name: 'summer',
          displayName: 'Summer Vibes',
          colors: {
            primary: '#f59e0b',
            secondary: '#fef3c7',
            accent: '#fb923c',
            background: '#fffbeb',
            cardBackground: '#ffffff',
            text: '#92400e',
            textSecondary: '#6b7280'
          },
          isSeasonal: true
        },
        fall: {
          name: 'fall',
          displayName: 'Autumn Harvest',
          colors: {
            primary: '#ea580c',
            secondary: '#fed7aa',
            accent: '#fb923c',
            background: '#fff7ed',
            cardBackground: '#ffffff',
            text: '#9a3412',
            textSecondary: '#6b7280'
          },
          isSeasonal: true
        },
        winter: {
          name: 'winter',
          displayName: 'Winter Wonderland',
          colors: {
            primary: '#0ea5e9',
            secondary: '#e0f2fe',
            accent: '#38bdf8',
            background: '#f0f9ff',
            cardBackground: '#ffffff',
            text: '#0c4a6e',
            textSecondary: '#6b7280'
          },
          isSeasonal: true
        },
        christmas: {
          name: 'christmas',
          displayName: 'Christmas Magic',
          colors: {
            primary: '#dc2626',
            secondary: '#fecaca',
            accent: '#ef4444',
            background: '#fef2f2',
            cardBackground: '#ffffff',
            text: '#991b1b',
            textSecondary: '#6b7280'
          },
          isHoliday: true
        },
        dark: {
          name: 'dark',
          displayName: 'Dark Mode',
          colors: {
            primary: '#e60023',
            secondary: '#2e2e2e',
            accent: '#e2336b',
            background: '#121212',
            cardBackground: '#1e1e1e',
            text: '#ffffff',
            textSecondary: '#b0b0b0'
          }
        }
      };
      
      const themeData = predefinedThemes[themeName.toLowerCase()];
      if (!themeData) {
        return next(new ErrorResponse(`Predefined theme "${themeName}" not found`, 404));
      }
      
      // Create the theme in database
      theme = await Theme.create({
        ...themeData,
        createdBy: req.user.id
      });
    }
    
    // Deactivate all themes first
    await Theme.updateMany({}, { isActive: false });
    
    // Activate the selected theme
    const activatedTheme = await Theme.findByIdAndUpdate(
      theme._id,
      { 
        isActive: true,
        activatedAt: new Date(),
        activatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: activatedTheme,
      message: `Theme "${activatedTheme.displayName || activatedTheme.name}" has been activated globally`
    });
    
  } catch (error) {
    console.error('Error activating theme by name:', error);
    return next(new ErrorResponse('Failed to activate theme', 500));
  }
}));

// @route   POST /api/themes/activate-seasonal
// @desc    Activate current seasonal theme automatically
// @access  Private/Admin
router.post('/activate-seasonal', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  try {
    // Determine current season
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31
    
    let seasonalThemeName;
    
    // Check for holiday themes first
    if (month === 11 && day <= 25) { // Christmas (Dec 1-25)
      seasonalThemeName = 'christmas';
    } else if (month === 9) { // Halloween (October)
      seasonalThemeName = 'halloween';
    } 
    // Seasonal themes
    else if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
      seasonalThemeName = 'winter'; // Dec 21 - Mar 19
    } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
      seasonalThemeName = 'spring'; // Mar 20 - Jun 20
    } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
      seasonalThemeName = 'summer'; // Jun 21 - Sep 21
    } else {
      seasonalThemeName = 'fall'; // Sep 22 - Dec 20
    }
    
    // Use the activate-by-name functionality
    req.body = { themeName: seasonalThemeName };
    
    // Call the activate-by-name function
    const theme = await Theme.findOne({ name: seasonalThemeName });
    
    if (!theme) {
      // Create and activate the seasonal theme
      const activateByNameRoute = router.stack.find(r => 
        r.route && r.route.path === '/activate-by-name' && r.route.methods.post
      );
      return activateByNameRoute.route.stack[0].handle(req, res, next);
    }
    
    // Deactivate all themes and activate seasonal theme
    await Theme.updateMany({}, { isActive: false });
    const activatedTheme = await Theme.findByIdAndUpdate(
      theme._id,
      { 
        isActive: true,
        activatedAt: new Date(),
        activatedBy: req.user.id
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: activatedTheme,
      message: `Seasonal theme "${activatedTheme.displayName}" has been activated globally`
    });
    
  } catch (error) {
    console.error('Error activating seasonal theme:', error);
    return next(new ErrorResponse('Failed to activate seasonal theme', 500));
  }
}));

// @route   POST /api/themes/activate-seasonal
// @desc    Automatically activate the appropriate seasonal theme
// @access  Private/Admin
router.post('/activate-seasonal', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan-Dec)
  const day = now.getDate(); // 1-31
  
  let seasonalThemeName;
  
  // Determine current season
  if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
    // Dec 21 - Mar 19: Winter
    seasonalThemeName = 'winter';
  } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
    // Mar 20 - Jun 20: Spring
    seasonalThemeName = 'spring';
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
    // Jun 21 - Sep 21: Summer
    seasonalThemeName = 'summer';
  } else {
    // Sep 22 - Dec 20: Fall/Autumn
    seasonalThemeName = 'fall';
  }
  
  // Check for holiday themes that should override seasonal themes
  // Holidays listed in order of priority
  
  // Christmas (Dec 1-25)
  if (month === 11 && day <= 25) {
    const christmasTheme = await Theme.findOne({ name: 'christmas', isHoliday: true });
    if (christmasTheme) {
      seasonalThemeName = 'christmas';
    }
  }
  
  // Halloween (Oct 1-31)
  if (month === 9) {
    const halloweenTheme = await Theme.findOne({ name: 'halloween', isHoliday: true });
    if (halloweenTheme) {
      seasonalThemeName = 'halloween';
    }
  }
  
  // Find the appropriate theme
  const themeToActivate = await Theme.findOne({ name: seasonalThemeName });
  
  if (!themeToActivate) {
    return next(new ErrorResponse(`No theme found for the current season: ${seasonalThemeName}`, 404));
  }
  
  // Deactivate all themes
  await Theme.updateMany({}, { isActive: false });
  
  // Activate the seasonal theme
  themeToActivate.isActive = true;
  await themeToActivate.save();
  
  res.status(200).json({
    success: true,
    message: `Seasonal theme "${themeToActivate.name}" activated automatically`,
    data: themeToActivate
  });
}));

module.exports = router;