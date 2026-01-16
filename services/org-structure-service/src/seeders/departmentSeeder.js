const sequelize = require('../config/db');
const Department = require('../models/departmentModel'); // Adjust path as needed
require('dotenv').config();

async function seedDepartments() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Syncing only this model for safety
        await sequelize.sync();

        // 1. Check if departments already exist to avoid duplicates
        const count = await Department.count();
        if (count > 0) {
            console.log('Departments already exist. Skipping seed.');
            return;
        }

        // 2. Create the Root Department (Headquarters)
        const root = await Department.create({
            departmentName: 'Headquarters',
            description: 'Main corporate office and global operations.'
        });

        // 3. Create Level 2 Departments (Parents: Root)
        const hr = await Department.create({
            departmentName: 'Human Resources',
            description: 'Recruitment, payroll, and employee welfare.',
            parentDepartmentId: root.id
        });

        const tech = await Department.create({
            departmentName: 'Technology',
            description: 'Software development and IT infrastructure.',
            parentDepartmentId: root.id
        });

        const finance = await Department.create({
            departmentName: 'Finance',
            description: 'Accounting and financial planning.',
            parentDepartmentId: root.id
        });

        // 4. Create Level 3 Departments (Parents: Tech/HR)
        await Department.bulkCreate([
            {
                departmentName: 'Backend Engineering',
                description: 'API development and database management.',
                parentDepartmentId: tech.id
            },
            {
                departmentName: 'Frontend Engineering',
                description: 'UI/UX implementation and web development.',
                parentDepartmentId: tech.id
            },
            {
                departmentName: 'Talent Acquisition',
                description: 'Hiring and onboarding processes.',
                parentDepartmentId: hr.id
            }
        ]);

        console.log('✓ Organizational structure seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding departments:', error);
        process.exit(1);
    }
}

seedDepartments();