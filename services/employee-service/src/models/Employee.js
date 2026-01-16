// src/models/Employee.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  employee_code: { type: DataTypes.STRING, allowNull: false },
  hire_date: { type: DataTypes.DATE, allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: true },
  position_id: { type: DataTypes.INTEGER, allowNull: true },
  manager_id: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'employees',
  timestamps: false,
});

export default Employee;
