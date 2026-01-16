const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    time_limit_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Time limit in minutes, null for no limit'
    },
    max_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    }
}, {
    tableName: 'quizzes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Quiz;
