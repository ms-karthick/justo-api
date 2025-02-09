const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConnect'); 

const OneTimeLink = sequelize.define('OneTimeLink', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = OneTimeLink;