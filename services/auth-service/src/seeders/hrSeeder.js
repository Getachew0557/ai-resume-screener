const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const AuthUser = require('../models/userModel');
require('dotenv').config();

async function seedHR() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        await sequelize.sync();
        console.log('Database synced.');

        const existingHR = await AuthUser.findOne({
            where: { email: 'hr@hrms.com' }
        });

        if (existingHR) {
            console.log('HR user already exists. Skipping seed.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('HR@123', salt);

        const hrUser = await AuthUser.create({
            email: 'hr@hrms.com',
            password_hash,
            role: 'hr',
            first_name: 'HR',
            last_name: 'Specialist',
            phone: '+0987654321',
            is_active: true,
        });

        console.log('✓ HR user created successfully!');
        console.log('Email: hr@hrms.com');
        console.log('Password: HR@123');
        console.log('Role: hr');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding HR user:', error);
        process.exit(1);
    }
}

seedHR();
