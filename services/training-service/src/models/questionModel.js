const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quizzes',
            key: 'id'
        }
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    option_a: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    option_b: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    option_c: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    option_d: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    correct_answer: {
        type: DataTypes.ENUM('A', 'B', 'C', 'D'),
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'questions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Question;
