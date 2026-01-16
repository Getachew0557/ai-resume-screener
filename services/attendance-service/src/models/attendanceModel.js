const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // your Sequelize instance

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL + Sequelize connected successfully!');
  } catch (err) {
    console.error('Unable to connect:', err);
  }
})();

const Attendance = sequelize.define(
  'Attendance',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    clock_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    clock_in: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    clock_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    shift_start: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    shift_end: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    overtime_hours: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 0.0,
    },

    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'half_day'),
      defaultValue: 'present',
    },
  },
  {
    tableName: 'att_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'clock_date'],
      },
      {
        fields: ['clock_date'],
      },
    ],
  }
);

module.exports = Attendance;
