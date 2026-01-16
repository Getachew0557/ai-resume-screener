const JobCategory = require('../models/jobCategoryModel');
const { Op } = require('sequelize');

// Create a new job category
exports.createJobCategory = async (req, res) => {
    try {
        const { jobCategoryName, description } = req.body;

        if (!jobCategoryName || jobCategoryName.trim() === '') {
            return res.status(400).json({ error: 'Job category name cannot be blank' });
        }

        const existingCategory = await JobCategory.findOne({ where: { jobCategoryName } });
        if (existingCategory) {
            return res.status(400).json({ error: `Job category "${jobCategoryName}" already exists.` });
        }

        const category = await JobCategory.create({ jobCategoryName, description });
        res.status(201).json(category);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all job categories
exports.getJobCategories = async (req, res) => {
    try {
        const categories = await JobCategory.findAll();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get job category by ID
exports.getJobCategoryById = async (req, res) => {
    try {
        const category = await JobCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Job category not found' });

        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update job category
exports.updateJobCategory = async (req, res) => {
    try {
        const category = await JobCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Job category not found' });

        const { jobCategoryName, description } = req.body;

        // Check duplicate
        const existingCategory = await JobCategory.findOne({
            where: { jobCategoryName, id: { [Op.ne]: req.params.id } }
        });
        if (existingCategory) {
            return res.status(400).json({ error: `Job category "${jobCategoryName}" already exists.` });
        }

        category.jobCategoryName = jobCategoryName || category.jobCategoryName;
        category.description = description || category.description;

        await category.save();
        res.json(category);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete job category
exports.deleteJobCategory = async (req, res) => {
    try {
        const category = await JobCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Job category not found' });

        await category.destroy();
        res.json({ message: 'Job category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
