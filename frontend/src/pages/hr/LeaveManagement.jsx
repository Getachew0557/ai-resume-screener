import React, { useState, useEffect } from 'react';

import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';

import { leaveAPI, authAPI } from '../../services/api'; // Adjust import path as needed

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function LeaveManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ── Fetch Pending Leave Requests ──
  useEffect(() => {
    if (tabValue !== 0) return;

    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await leaveAPI.getLeaves(); // ← Use your actual endpoint/method
        // Example: leaveAPI.get('/getAllPending')
        const formatted = response.data.map(r => ({
          id: r.id,
          employeeId: r.employee_id,
          leaveType: r.leave_type,
          startDate: new Date(r.start_date).toLocaleDateString('en-GB'),
          endDate: new Date(r.end_date).toLocaleDateString('en-GB'),
          daysRequested: r.days_requested,
          status: r.status,
        }));

        setRequests(formatted);
      } catch (err) {
        console.error(err);
        setError('Failed to load pending leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [tabValue]);

  // ── Fetch Employees from auth-service ──
  useEffect(() => {
    if (tabValue !== 1 || employees.length > 0) return;

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authAPI.getUsers({ role: 'employee' });
        // Assuming response shape: { users: [...], pagination: {...} }

        const employeeList = response.data.users.map(user => ({
          employeeId: user.id,
          firstName: user.first_name || 'Unknown',
          lastName: user.last_name || '',
          email: user.email || 'N/A',
          createdAt: user.created_at,
          allowedDays: 20, // ← default/fallback value (replace with real data later)
        }));

        setEmployees(employeeList);
      } catch (err) {
        console.error(err);
        setError('Failed to load employee list');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [tabValue, employees.length]);

  // ── Handlers ──
  const handleAction = (requestId, action) => {
    // TODO: Real API call to approve/decline
    alert(`Simulating: ${action} request #${requestId}`);
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: action } : r))
    );
  };

  const handleDaysChange = (employeeId, value) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.employeeId === employeeId
          ? { ...emp, allowedDays: Number(value) || 0 }
          : emp
      )
    );
  };

  const handleSave = (employeeId) => {
    const employee = employees.find(e => e.employeeId === employeeId);
    if (!employee) return;

    // TODO: Real API call → e.g. leaveAPI.updateAllowedDays(employeeId, employee.allowedDays)
    alert(`Saving ${employee.allowedDays} allowed days for employee #${employeeId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Leave Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pending Leave Requests" />
          <Tab label="Manage Allowed Days" />
        </Tabs>
      </Box>

      {/* ── TAB 1: Pending Requests ── */}
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : requests.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No pending leave requests at the moment
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell align="center">Start Date</TableCell>
                  <TableCell align="center">End Date</TableCell>
                  <TableCell align="center">Days</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id} hover>
                    <TableCell>{req.employeeId}</TableCell>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell align="center">{req.startDate}</TableCell>
                    <TableCell align="center">{req.endDate}</TableCell>
                    <TableCell align="center">{req.daysRequested}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleAction(req.id, 'approved')}
                        disabled={req.status !== 'pending'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleAction(req.id, 'declined')}
                        disabled={req.status !== 'pending'}
                      >
                        Decline
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* ── TAB 2: Manage Allowed Days ── */}
      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : employees.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No employees found
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Allowed Days</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.employeeId} hover>
                    <TableCell>{emp.firstName}</TableCell>
                    <TableCell>{emp.lastName}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      {emp.createdAt
                        ? new Date(emp.createdAt).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={emp.allowedDays ?? ''}
                        onChange={e => handleDaysChange(emp.employeeId, e.target.value)}
                        sx={{ width: 140 }}
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSave(emp.employeeId)}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </Container>
  );
}

export default LeaveManagementPage;
