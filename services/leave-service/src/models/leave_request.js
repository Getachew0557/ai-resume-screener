/// CREATE TABLE leave_requests (
///     id              INT AUTO_INCREMENT PRIMARY KEY,
///     employee_id     INT NOT NULL,
///     leave_type      ENUM('annual', 'sick', 'unpaid', 'maternity', 'other') NOT NULL,
///     start_date      DATE NOT NULL,
///     end_date        DATE NOT NULL,
///     days_requested  DECIMAL(5,2) NOT NULL,
///     status          ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
///     approver_id     INT,                               -- manager or HR
///     created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
///     updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
/// );

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"

const LeaveRequest = sequelize.define(
  "leave_request",
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

    leave_type: {
      type: DataTypes.ENUM(
        "annual",
        "sick",
        "unpaid",
        "maternity",
        "other"
      ),
      allowNull: false,
    },

    start_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    days_requested: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ),
      defaultValue: "pending",
    },

    approver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "leave_requests",
    timestamps: false, // we defined created_at & updated_at manually
    underscored: true,
  }
);

export default LeaveRequest;
