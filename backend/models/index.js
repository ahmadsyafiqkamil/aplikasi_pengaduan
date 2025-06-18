const User = require('./User');
const Complaint = require('./Complaint');
const ComplaintHistory = require('./ComplaintHistory');
const AppConfig = require('./AppConfig');

// User - Complaint associations
User.hasMany(Complaint, { 
  foreignKey: 'assigned_agent_id', 
  as: 'assignedComplaints' 
});
Complaint.belongsTo(User, { 
  foreignKey: 'assigned_agent_id', 
  as: 'assignedAgent' 
});

User.hasMany(Complaint, { 
  foreignKey: 'supervisor_id', 
  as: 'supervisedComplaints' 
});
Complaint.belongsTo(User, { 
  foreignKey: 'supervisor_id', 
  as: 'supervisor' 
});

// Complaint - ComplaintHistory associations
Complaint.hasMany(ComplaintHistory, { 
  foreignKey: 'complaint_id', 
  as: 'history' 
});
ComplaintHistory.belongsTo(Complaint, { 
  foreignKey: 'complaint_id' 
});

// User - ComplaintHistory associations
User.hasMany(ComplaintHistory, { 
  foreignKey: 'user_id', 
  as: 'actions' 
});
ComplaintHistory.belongsTo(User, { 
  foreignKey: 'user_id' 
});

module.exports = {
  User,
  Complaint,
  ComplaintHistory,
  AppConfig
}; 