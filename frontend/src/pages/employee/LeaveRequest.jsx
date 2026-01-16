import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios'; // ← using axios directly for this specific call

// Common leave types (match your backend ENUM values)
const leaveTypes = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'other', label: 'Other' },
];

function LeaveRequestForm() {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [myRequests, setMyRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(true);

  // Fetch my existing leave requests
  const fetchMyRequests = async () => {
    try {
      setFetchingRequests(true);
      // ← Replace with your actual endpoint to get employee's own requests
      // const response = await axios.get('http://localhost:3003/api/leave/my-requests', {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token') || ''}`, // if you store token
      //   },
      // });
      const response = await leaveAPI.getMyRequests();
      setMyRequests(response.data || []);
    } catch (err) {
      console.error('Error fetching my leave requests:', err);
    } finally {
      setFetchingRequests(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    // Validation
    if (!formData.leaveType || !formData.startDate || !formData.endDate) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (dayjs(formData.startDate).isAfter(dayjs(formData.endDate))) {
      setError('End date must be after or equal to start date.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        leave_type: formData.leaveType,
        start_date: formData.startDate.format('YYYY-MM-DD'),
        end_date: formData.endDate.format('YYYY-MM-DD'),
      };

      // ── Actual submission to your backend endpoint ──
      // await axios.post(
      //   'http://localhost:3003/api/leave/postLeaveRequest',
      //   payload,
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${localStorage.getItem('token') || ''}`, // ← if authentication needed
      //     },
      //   }
      // );
      const leaveRequest = await leaveAPI.postLeaveRequest(payload);

      setSuccess(true);
      setFormData({
        leaveType: '',
        startDate: null,
        endDate: null,
      });

      // Refresh list
      fetchMyRequests();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      const errorMessage =
        err.response?.data?.message ||
        'Failed to submit leave request. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Form Section */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 5 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Request Leave
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your leave request has been submitted successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            select
            fullWidth
            label="Leave Type"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          >
            {leaveTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                mt: 2,
              }}
            >
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(newValue) => handleDateChange('startDate', newValue)}
                minDate={dayjs()}
                slotProps={{
                  textField: { fullWidth: true, required: true },
                }}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(newValue) => handleDateChange('endDate', newValue)}
                minDate={formData.startDate || dayjs()}
                slotProps={{
                  textField: { fullWidth: true, required: true },
                }}
              />
            </Box>
          </LocalizationProvider>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 4, py: 1.5 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Submitting...
              </>
            ) : (
              'Submit Leave Request'
            )}
          </Button>
        </Box>
      </Paper>

      {/* My Requests History */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          My Leave Requests History
        </Typography>

        {fetchingRequests ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : myRequests.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            You haven't submitted any leave requests yet.
          </Alert>
        ) : (
          <TableContainer sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell align="center">Days</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myRequests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>{req.leave_type}</TableCell>
                    <TableCell>
                      {new Date(req.start_date).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      {new Date(req.end_date).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell align="center">{Math.round(req.days_requested)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={req.status.toUpperCase()}
                        color={
                          req.status === 'approved'
                            ? 'success'
                            : req.status === 'pending'
                              ? 'warning'
                              : req.status === 'rejected'
                                ? 'error'
                                : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default LeaveRequestForm;
