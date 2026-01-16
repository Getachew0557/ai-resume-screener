import Employee from '../models/Employee.js';

export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    console.error('GET EMPLOYEES ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id, {
    include: [{ model: Employee, as: 'manager' }],
  });

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  res.json(employee);
};

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  await employee.update(req.body);
  res.json(employee);
};

export const deleteEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  await employee.destroy();
  res.json({ message: 'Employee deleted successfully' });
};
