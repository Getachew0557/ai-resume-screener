const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    resume_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    stage: {
        type: DataTypes.ENUM('applied', 'screened', 'interview', 'offer', 'rejected', 'hired'),
        defaultValue: 'applied'
    },
    applied_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    hired_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'applications',
    timestamps: true,
    underscored: true
});

module.exports = Application;
