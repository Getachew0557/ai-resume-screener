const Department = require('../models/departmentModel');

// Create a new department
exports.createDepartment = async (req, res) => {
    try {
        const { departmentName, description, parentDepartmentId } = req.body;

        // Validation: required name
        if (!departmentName || departmentName.trim() === '') {
            return res.status(400).json({ error: 'Department name cannot be blank' });
        }

        // Validation: check duplicate under same parent
        const existingDept = await Department.findOne({
            where: { departmentName, parentDepartmentId: parentDepartmentId || null }
        });

        if (existingDept) {
            return res.status(400).json({
                error: `Department "${departmentName}" already exists under the same parent.`
            });
        }

        const dept = await Department.create({ departmentName, description, parentDepartmentId });
        res.status(201).json(dept);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all root departments with immediate children
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            where: { parentDepartmentId: null },
            include: [{ model: Department, as: 'subDepartments' }]
        });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all child departments recursively
exports.getAllChildDepartments = async (req, res) => {
    try {
        const deptId = req.params.id;
        const dept = await Department.findByPk(deptId);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        const children = [];
        const visited = new Set();

        async function recurse(d) {
            if (visited.has(d.id)) return;
            visited.add(d.id);

            const subs = await Department.findAll({ where: { parentDepartmentId: d.id } });
            children.push(...subs);

            for (const sub of subs) {
                await recurse(sub);
            }
        }

        await recurse(dept);
        res.json(children);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all parent departments recursively
exports.getAllParentDepartments = async (req, res) => {
    try {
        const deptId = req.params.id;
        let dept = await Department.findByPk(deptId);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        const parents = [];
        while (dept.parentDepartmentId) {
            dept = await Department.findByPk(dept.parentDepartmentId);
            if (!dept) break;
            parents.push(dept);
        }

        res.json(parents);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Optimized: Better Update Logic
exports.updateDepartment = async (req, res) => {
    try {
        const deptId = req.params.id;
        const { departmentName, description, parentDepartmentId } = req.body;

        const dept = await Department.findByPk(deptId);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        // Prevent circular dependency: A department cannot be its own parent
        if (parentDepartmentId && parseInt(parentDepartmentId) === parseInt(deptId)) {
            return res.status(400).json({ error: "A department cannot be its own parent." });
        }

        // Check for duplicate name under the same parent (excluding current record)
        const existingDept = await Department.findOne({
            where: {
                departmentName,
                parentDepartmentId: parentDepartmentId || null,
                id: { [Department.sequelize.Op.ne]: deptId }
            }
        });

        if (existingDept) {
            return res.status(400).json({
                error: `Department "${departmentName}" already exists under this parent.`
            });
        }

        await dept.update({
            departmentName: departmentName || dept.departmentName,
            description: description !== undefined ? description : dept.description,
            parentDepartmentId: parentDepartmentId === "" ? null : parentDepartmentId
        });

        res.json(dept);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    try {
        const deptId = req.params.id;
        const dept = await Department.findByPk(deptId);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        await dept.destroy();
        res.json({ message: 'Department deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get department by ID


exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            // Include parent name so the frontend doesn't have to find it manually
            include: [{
                model: Department,
                as: 'parentDepartment',
                attributes: ['departmentName']
            }]
        });
        res.json(departments)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get a single department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const deptId = req.params.id;

        const department = await Department.findByPk(deptId, {
            include: [{
                model: Department,
                as: 'parentDepartment',
                attributes: ['id', 'departmentName']
            }]
        });

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

