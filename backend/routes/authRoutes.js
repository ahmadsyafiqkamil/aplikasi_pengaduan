const express = require('express');
const router = express.Router();
const { 
  login, 
  getProfile, 
  updateProfile, 
  createUser, 
  getUsers, 
  updateUser, 
  deleteUser 
} = require('../controllers/authController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireSupervisor 
} = require('../middlewares/authMiddleware');
const { 
  validateLogin, 
  validateCreateUser, 
  validateUUID 
} = require('../middlewares/validationMiddleware');

// Public routes
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Admin only routes
router.post('/users', authenticateToken, requireAdmin, validateCreateUser, createUser);
router.get('/users', authenticateToken, requireAdmin, getUsers);
router.put('/users/:id', authenticateToken, requireAdmin, validateUUID, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, validateUUID, deleteUser);

module.exports = router;
