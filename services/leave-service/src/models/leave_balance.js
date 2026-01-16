// CREATE TABLE leave_balances (
//     id              INT AUTO_INCREMENT PRIMARY KEY,
//     employee_id     INT NOT NULL,
//     leave_type      ENUM('annual', 'sick', 'unpaid', 'maternity', 'other') NOT NULL,
//     allowed_days    INT NOT NULL DEFAULT 30,
//     balance_days    DECIMAL(5,2) DEFAULT 0.00,
//     accrued_days    DECIMAL(5,2) DEFAULT 0.00,
//     year            INT NOT NULL,                      -- e.g., 2026
//     created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     UNIQUE KEY uk_leave_year_type (employee_id, leave_type, year),
// );
//

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LeaveBalance = sequelize.define(
  "leave_balances",
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

    allowed_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },

    balance_days: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },

    accrued_days: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "leave_balances",
    timestamps: false,
    underscored: true,

    indexes: [
      {
        name: "uk_leave_year_type",
        unique: true,
        fields: ["employee_id", "leave_type", "year"],
      },
    ],
  }
);

export default LeaveBalance;
