const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tracking_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'User-friendly tracking ID like PEN-2024-001'
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reporter_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  reporter_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  reporter_whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  service_type: {
    type: DataTypes.ENUM(
      'Layanan Imigrasi',
      'Layanan Konsuler', 
      'Layanan Sosial Budaya',
      'Layanan Ekonomi',
      'Layanan Lainnya'
    ),
    allowNull: false
  },
  incident_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  custom_field_data: {
    type: DataTypes.JSON,
    allowNull: true,
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
  assigned_agent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  supervisor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  agent_follow_up_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requested_status_change: {
    type: DataTypes.ENUM(
      'Baru',
      'Sedang Diverifikasi',
      'Dalam Proses', 
      'Menunggu Persetujuan Supervisor',
      'Selesai',
      'Ditolak'
    ),
    allowNull: true
  },
  status_change_request_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  supervisor_review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  estimated_resolution_days: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  actual_resolution_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'complaints',
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