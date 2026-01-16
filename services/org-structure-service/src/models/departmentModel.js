const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    departmentName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    parentDepartmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments', // self-reference
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    }
}, {
    tableName: 'departments',
    timestamps: true,
    paranoid: true,        // optional, adds deletedAt for soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

// Self-referencing associations for tree structure
Department.hasMany(Department, { as: 'subDepartments', foreignKey: 'parentDepartmentId' });
Department.belongsTo(Department, { as: 'parentDepartment', foreignKey: 'parentDepartmentId' });

module.exports = Department;
