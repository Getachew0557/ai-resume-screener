const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const AuthUser = require('../models/userModel');
require('dotenv').config();

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        await sequelize.sync();
        console.log('Database synced.');

        const existingAdmin = await AuthUser.findOne({
            where: { email: 'admin@hrms.com' }
        });

        if (existingAdmin) {
            console.log('Admin user already exists. Skipping seed.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('Admin@123', salt);

        const admin = await AuthUser.create({
            email: 'admin@hrms.com',
            password_hash,
            role: 'admin',
            first_name: 'System',
            last_name: 'Administrator',
            phone: '+1234567890',
            is_active: true,
        });

        console.log('✓ Admin user created successfully!');
        console.log('Email: admin@hrms.com');
        console.log('Password: Admin@123');
        console.log('Role: admin');
        console.log('\nPlease change the password after first login.');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
