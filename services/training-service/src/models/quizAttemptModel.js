const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quizzes',
            key: 'id'
        }
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Score as percentage (0-100)'
    },
    total_questions: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correct_answers: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    answers: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'JSON object with question_id: selected_answer pairs'
    },
    passed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    attempted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'quiz_attempts',
    timestamps: false
});

module.exports = QuizAttempt;
