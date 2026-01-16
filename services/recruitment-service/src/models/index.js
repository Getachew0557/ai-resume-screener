const sequelize = require('../config/db');
const Job = require('./jobModel');
const Application = require('./applicationModel');

// Associations
Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

const db = {
    sequelize,
    Job,
    Application
};

module.exports = db;
