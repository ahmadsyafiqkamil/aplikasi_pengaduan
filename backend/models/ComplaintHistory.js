const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ComplaintHistory = sequelize.define('ComplaintHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  complaint_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'complaints',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  user_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of user who made the action (or "Sistem" for system actions)'
  },
  user_role: {
    type: DataTypes.ENUM('admin', 'supervisor', 'agent', 'manajemen', 'public'),
    allowNull: true
  },
  action: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Description of the action taken'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  old_status: {
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
  new_status: {
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
  assigned_to_agent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_to_agent_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data related to the action'
  }
}, {
  tableName: 'complaint_histories',
  indexes: [
    {
      fields: ['complaint_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = ComplaintHistory; 