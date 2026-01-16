const sequelize = require('../config/db');
const JobCategory = require('../models/jobCategoryModel'); // Adjust path to your model
require('dotenv').config();

async function seedJobCategories() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Sync model structure
        await sequelize.sync();

        // 1. Prevent duplicate seeding
        const count = await JobCategory.count();
        if (count > 0) {
            console.log('Job Categories already exist. Skipping seed.');
            return;
        }

        // 2. Define standard HR job categories
        const categories = [
            {
                jobCategoryName: 'Engineering',
                description: 'Software development, hardware, and technical infrastructure.'
            },
            {
                jobCategoryName: 'Management',
                description: 'Executive leadership and department heads.'
            },
            {
                jobCategoryName: 'Sales & Marketing',
                description: 'Business development, advertising, and customer outreach.'
            },
            {
                jobCategoryName: 'Human Resources',
                description: 'People operations, recruitment, and culture.'
            },
            {
                jobCategoryName: 'Finance',
                description: 'Accounting, auditing, and financial planning.'
            },
            {
                jobCategoryName: 'Administrative',
                description: 'Office management and general support services.'
            }
        ];

        // 3. Bulk insert into the database
        await JobCategory.bulkCreate(categories);

        console.log(`✓ Successfully seeded ${categories.length} Job Categories!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding job categories:', error);
        process.exit(1);
    }
}

seedJobCategories();