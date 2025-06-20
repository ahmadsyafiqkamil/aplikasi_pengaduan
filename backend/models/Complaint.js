const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  trackingId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'tracking_id',
    comment: 'User-friendly tracking ID like PEN-2024-001'
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_anonymous'
  },
  reporterName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'reporter_name'
  },
  reporterEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    },
    field: 'reporter_email'
  },
  reporterWhatsApp: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'reporter_whatsapp'
  },
  serviceType: {
    type: DataTypes.ENUM(
      'Layanan Imigrasi',
      'Layanan Konsuler', 
      'Layanan Sosial Budaya',
      'Layanan Ekonomi',
      'Layanan Lainnya'
    ),
    allowNull: false,
    field: 'service_type'
  },
  incidentTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'incident_time'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  customFieldData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'custom_field_data',
    comment: 'Stores custom form field responses'
  },
  status: {
    type: DataTypes.ENUM(
      'Baru',
      'Sedang Diverifikasi', 
      'Dalam Proses',
      'Menunggu Persetujuan Supervisor',
      'Selesai',
      'Ditolak'
    ),
    defaultValue: 'Baru'
  },
  assignedAgentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_agent_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  supervisorId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'supervisor_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  agentFollowUpNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'agent_follow_up_notes'
  },
  requestedStatusChange: {
    type: DataTypes.ENUM(
      'Baru',
      'Sedang Diverifikasi',
      'Dalam Proses', 
      'Menunggu Persetujuan Supervisor',
      'Selesai',
      'Ditolak'
    ),
    allowNull: true,
    field: 'requested_status_change'
  },
  statusChangeRequestNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'status_change_request_notes'
  },
  supervisorReviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'supervisor_review_notes'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  estimatedResolutionDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_resolution_days'
  },
  actualResolutionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actual_resolution_date'
  }
}, {
  tableName: 'complaints',
  underscored: true,
  indexes: [
    {
      fields: ['tracking_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['service_type']
    },
    {
      fields: ['assigned_agent_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Complaint; 