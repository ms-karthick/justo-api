const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConnect'); 

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0,  validate: { min: 0 } },
  locked: { type: DataTypes.DATE, allowNull: true },
},{ timestamps: true});

module.exports = User;