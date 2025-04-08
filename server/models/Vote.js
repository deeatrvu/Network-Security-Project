const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  encryptedVote: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  electionId: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define associations
Vote.belongsTo(User, {
  foreignKey: {
    name: 'voterId',
    allowNull: false
  }
});

User.hasOne(Vote, {
  foreignKey: 'voterId'
});

module.exports = Vote; 