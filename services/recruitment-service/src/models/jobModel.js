const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('open', 'closed', 'on_hold', 'filled'),
        defaultValue: 'open'
    },
    posted_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    closing_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'jobs',
    timestamps: true,
    underscored: true
});

module.exports = Job;
