const { Complaint } = require('../models');

// Generate unique tracking ID
const generateTrackingId = async () => {
  const year = new Date().getFullYear();
  const prefix = 'PEN';
  
  // Get the latest complaint for this year
  const latestComplaint = await Complaint.findOne({
    where: {
      tracking_id: {
        [require('sequelize').Op.like]: `${prefix}-${year}-%`
      }
    },
    order: [['tracking_id', 'DESC']]
  });

  let sequence = 1;
  
  if (latestComplaint) {
    // Extract sequence number from existing tracking ID
    const match = latestComplaint.tracking_id.match(new RegExp(`${prefix}-${year}-(\\d+)`));
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  // Format: PEN-2024-001
  const trackingId = `${prefix}-${year}-${sequence.toString().padStart(3, '0')}`;
  
  return trackingId;
};

// Validate tracking ID format
const validateTrackingId = (trackingId) => {
  const pattern = /^PEN-\d{4}-\d{3}$/;
  return pattern.test(trackingId);
};

module.exports = {
  generateTrackingId,
  validateTrackingId
}; 