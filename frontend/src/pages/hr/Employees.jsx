// Employees.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { authAPI, employeeAPI, organizationAPI } from '../../services/api';

export default function Employees() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [allUsersForDropdown, setAllUsersForDropdown] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formEmployee, setFormEmployee] = useState({
    user_id: '',
    employee_code: '',
    hire_date: '',
    department_id: '',
    position_id: '',
    manager_id: '',
  });

  // Fetch support data only once on mount
  useEffect(() => {
    fetchSupportData();
  }, []);

  // Fetch main list whenever pagination or search changes
  useEffect(() => {
    fetchMainData();
  }, [page, rowsPerPage, search]);

  const fetchMainData = async () => {
    setLoading(true);
    try {
      const userRes = await authAPI.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search
      });
      setUsers(userRes.data.users || []);
      setTotalUsers(userRes.data.pagination?.total || 0);

      const empRes = await employeeAPI.getEmployees();
      setEmployees(empRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching main data:', err);
      setError('Failed to load employee data. Please check services.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      // Fetch individually so one failure doesn't block others
      organizationAPI.getDepartments().then(res => setDepartments(res.data || [])).catch(e => console.error('Depts failed:', e));
      employeeAPI.getPositions().then(res => setPositions(res.data || [])).catch(e => console.error('Positions failed:', e));
    } catch (err) {
      console.error('Support data fetch failed:', err);
    }
  };

  const fetchAllUsersForDropdown = async () => {
    setLoadingDropdown(true);
    try {
      const res = await authAPI.getUsers({ limit: 1000 });
      setAllUsersForDropdown(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users for dropdown:', err);
    } finally {
      setLoadingDropdown(false);
    }
  };

  // Pagination & Search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog handlers
  const handleOpenDialog = async (employeeData = null) => {
    fetchAllUsersForDropdown();
    // Re-verify support data if empty
    if (departments.length === 0 || positions.length === 0) {
      fetchSupportData();
    }

    if (employeeData) {
      setEditingEmployee(employeeData);
      setFormEmployee({
        user_id: employeeData.user_id || '',
        employee_code: employeeData.employee_code || '',
        hire_date: employeeData.hire_date || '',
        department_id: employeeData.department_id || '',
        position_id: employeeData.position_id || '',
        manager_id: employeeData.manager_id || '',
      });
    } else {
      setEditingEmployee(null);
      setFormEmployee({
        user_id: '',
        employee_code: '',
        hire_date: '',
        department_id: '',
        position_id: '',
        manager_id: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
  };

  const handleInputChange = (e) => {
    setFormEmployee({ ...formEmployee, [e.target.name]: e.target.value });
  };

  const handleSaveEmployee = async () => {
    try {
      if (!formEmployee.user_id || !formEmployee.employee_code) {
        alert('User and Employee Code are required!');
        return;
      }

      // Transform empty strings to null for database compatibility
      const submissionData = {
        ...formEmployee,
        department_id: formEmployee.department_id || null,
        position_id: formEmployee.position_id || null,
        manager_id: formEmployee.manager_id || null,
      };

      // Check if employee profile already exists for this user
      const existingEmp = employees.find(e => e.user_id === formEmployee.user_id);

      if (editingEmployee?.employee_id || existingEmp) {
        const targetId = editingEmployee?.employee_id || existingEmp.id;
        await employeeAPI.updateEmployee(targetId, submissionData);
      } else {
        await employeeAPI.createEmployee(submissionData);
      }

      handleCloseDialog();
      fetchMainData();
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('Error saving data: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteEmployee = async (userId) => {
    const emp = employees.find(e => e.user_id === userId);
    if (!emp) return;

    if (!window.confirm('Are you sure you want to delete this employee profile?')) return;
    try {
      await employeeAPI.deleteEmployee(emp.id);
      fetchMainData();
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  // Helper to merge data for the table
  const displayRows = users.map(user => {
    const emp = employees.find(e => e.user_id === user.id) || {};
    return {
      ...user,
      ...emp,
      id: user.id, // Ensure we use user.id as key
      employee_id: emp.id // Actual employee profile ID
    };
  });

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2} fontWeight="bold" color="primary">
        Employee Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search People (Auth Service)"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add/Assign Employee
        </Button>
      </Box>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEmployee ? 'Update Employee Profile' : 'Assign Employee Profile'}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {loadingDropdown ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
          ) : (
            <>
              <TextField
                margin="dense"
                label="Select User"
                name="user_id"
                select
                fullWidth
                value={formEmployee.user_id}
                onChange={handleInputChange}
                disabled={!!editingEmployee}
              >
                {allUsersForDropdown.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.email})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                label="Employee Code"
                name="employee_code"
                fullWidth
                value={formEmployee.employee_code}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                label="Hire Date"
                type="date"
                name="hire_date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formEmployee.hire_date}
                onChange={handleInputChange}
              />

              <TextField
                margin="dense"
                label="Department"
                name="department_id"
                select
                fullWidth
                value={formEmployee.department_id}
                onChange={handleInputChange}
              >
                {departments.length === 0 && <MenuItem disabled>No departments loaded</MenuItem>}
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                label="Position"
                name="position_id"
                select
                fullWidth
                value={formEmployee.position_id}
                onChange={handleInputChange}
              >
                {positions.length === 0 && <MenuItem disabled>No positions loaded</MenuItem>}
                {positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.position_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                label="Manager"
                name="manager_id"
                select
                fullWidth
                value={formEmployee.manager_id}
                onChange={handleInputChange}
              >
                <MenuItem value="">None</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.employee_code}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEmployee} disabled={loadingDropdown}>
            {editingEmployee ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employees Table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ minHeight: 400 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}><CircularProgress /></Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Code</b></TableCell>
                  <TableCell><b>Department</b></TableCell>
                  <TableCell><b>Position</b></TableCell>
                  <TableCell><b>Hire Date</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.first_name} {row.last_name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.employee_code || <Typography variant="caption" color="textSecondary">Not Assigned</Typography>}</TableCell>
                    <TableCell>
                      {departments.find((d) => d.id === row.department_id)?.departmentName || row.department_id || '-'}
                    </TableCell>
                    <TableCell>
                      {positions.find((p) => p.id === row.position_id)?.position_name || row.position_id || '-'}
                    </TableCell>
                    <TableCell>{row.hire_date ? new Date(row.hire_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenDialog(row)}>
                        <Edit />
                      </IconButton>
                      {row.employee_id && (
                        <IconButton color="error" onClick={() => handleDeleteEmployee(row.id)}>
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
