const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// User creation validation
const validateCreateUser = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('role')
    .isIn(['admin', 'supervisor', 'agent', 'manajemen'])
    .withMessage('Invalid role'),
  body('service_types_handled')
    .optional()
    .isArray()
    .withMessage('Service types must be an array'),
  handleValidationErrors
];

// Complaint creation validation
const validateCreateComplaint = [
  body('is_anonymous')
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  body('reporter_name')
    .if(body('is_anonymous').equals(false))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Reporter name must be between 2 and 100 characters'),
  body('reporter_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('reporter_whatsapp')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid WhatsApp number format'),
  body('service_type')
    .isIn([
      'Layanan Imigrasi',
      'Layanan Konsuler',
      'Layanan Sosial Budaya',
      'Layanan Ekonomi',
      'Layanan Lainnya'
    ])
    .withMessage('Invalid service type'),
  body('incident_time')
    .isISO8601()
    .withMessage('Invalid incident time format'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('custom_field_data')
    .optional()
    .isObject()
    .withMessage('Custom field data must be an object'),
  handleValidationErrors
];

// Complaint update validation
const validateUpdateComplaint = [
  param('id')
    .isUUID()
    .withMessage('Invalid complaint ID'),
  body('status')
    .optional()
    .isIn([
      'Baru',
      'Sedang Diverifikasi',
      'Dalam Proses',
      'Menunggu Persetujuan Supervisor',
      'Selesai',
      'Ditolak'
    ])
    .withMessage('Invalid status'),
  body('assigned_agent_id')
    .optional()
    .isUUID()
    .withMessage('Invalid agent ID'),
  body('agent_follow_up_notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Follow-up notes must not exceed 5000 characters'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['created_at', 'updated_at', 'status', 'priority'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  handleValidationErrors
];

// UUID parameter validation
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateCreateUser,
  validateCreateComplaint,
  validateUpdateComplaint,
  validatePagination,
  validateUUID
}; 