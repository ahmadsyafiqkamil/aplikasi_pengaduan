const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AppConfig = sequelize.define('AppConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Configuration key'
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Configuration value (can be any JSON data)'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Human readable description of this config'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this config can be accessed without authentication'
  },
  category: {
    type: DataTypes.ENUM('content', 'form', 'system', 'ui'),
    defaultValue: 'system'
  }
}, {
  tableName: 'app_configs',
  indexes: [
    {
      fields: ['key']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_public']
    }
  ]
});

module.exports = AppConfig; 