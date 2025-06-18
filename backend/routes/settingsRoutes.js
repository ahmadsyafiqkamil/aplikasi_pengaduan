const express = require('express');
const router = express.Router();
const { 
    getSettings, 
    saveSetting, 
    getAppConfig, 
    updateAppConfig 
} = require('../controllers/settingsController');
const { 
    authenticateToken, 
    requireAdmin 
} = require('../middlewares/authMiddleware');

// Public routes
router.get('/app-config', getAppConfig);

// Protected routes
router.get('/', authenticateToken, getSettings);
router.post('/', authenticateToken, requireAdmin, saveSetting);
router.put('/app-config', authenticateToken, requireAdmin, updateAppConfig);

module.exports = router;
