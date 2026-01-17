const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models are already initialized in their files, so we just require them
db.attendance = require("./attendanceModel.js");
db.user = require("./userModel.js");

module.exports = db;
