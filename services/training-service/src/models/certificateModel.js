const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certificate = sequelize.define('Certificate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    certificate_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Unique certificate identifier for verification'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    quiz_attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quiz_attempts',
            key: 'id'
        }
    },
    user_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    course_title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    issued_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    pdf_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Path to generated PDF certificate'
    }
}, {
    tableName: 'certificates',
    timestamps: false
});

module.exports = Certificate;
