const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignComplaint,
  getComplaintByTrackingId
} = require('../controllers/complaintController');
const {
  authenticateToken,
  requireAdmin,
  requireSupervisor,
  requireAgent,
  optionalAuth
} = require('../middlewares/authMiddleware');
const {
  validateCreateComplaint,
  validateUpdateComplaint,
  validatePagination,
  validateUUID
} = require('../middlewares/validationMiddleware');

// Public routes
router.post('/', validateCreateComplaint, createComplaint);
router.get('/track/:tracking_id', getComplaintByTrackingId);

// Protected routes
router.get('/', authenticateToken, validatePagination, getComplaints);
router.get('/:id', authenticateToken, validateUUID, getComplaintById);
router.put('/:id', authenticateToken, validateUUID, validateUpdateComplaint, updateComplaint);

// Admin/Supervisor routes
router.post('/assign', authenticateToken, requireSupervisor, assignComplaint);

module.exports = router;
