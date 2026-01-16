const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CourseSkill = sequelize.define('CourseSkill', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    skill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'skills',
            key: 'id'
        }
    },
    proficiency_level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
    }
}, {
    tableName: 'course_skills',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['course_id', 'skill_id']
        }
    ]
});

module.exports = CourseSkill;
