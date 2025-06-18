
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Report = sequelize.define('Report', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('open', 'in_progress', 'closed'), defaultValue: 'open' },
    assignedTo: { type: DataTypes.INTEGER, allowNull: true }
});

Report.belongsTo(User, { as: 'submittedBy', foreignKey: 'userId' });
Report.belongsTo(User, { as: 'assignedAgent', foreignKey: 'assignedTo' });

module.exports = Report;
