const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    difficulty_level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    passing_score: {
        type: DataTypes.INTEGER,
        defaultValue: 70,
        comment: 'Minimum score to pass the quiz (percentage)'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Course;
