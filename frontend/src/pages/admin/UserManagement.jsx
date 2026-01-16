import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { authAPI } from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'employee',
        first_name: '',
        last_name: '',
        phone: '',
    });

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage, searchQuery, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getUsers({
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery,
                role: roleFilter,
            });
            setUsers(response.data.users);
            setTotalUsers(response.data.pagination.total);
        } catch (err) {
            setError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
        setError('');
        setSuccess('');
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({
            email: '',
            password: '',
            role: 'employee',
            first_name: '',
            last_name: '',
            phone: '',
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await authAPI.register(formData);
            setSuccess('User created successfully!');
            setTimeout(() => {
                handleCloseModal();
                fetchUsers();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: 'error',
            hr: 'primary',
            manager: 'secondary',
            employee: 'default',
        };
        return colors[role] || 'default';
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Manage system users and their roles</p>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                    fullWidth
                    sx={{
                        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                        '&:hover': {
                            background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                        },
                        '@media (min-width: 640px)': {
                            width: 'auto',
                        },
                    }}
                >
                    Create User
                </Button>
            </div>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mb: 2, p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'stretch' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </Box>
                            ),
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Filter by Role"
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(0);
                        }}
                        sx={{ minWidth: { xs: '100%', md: 150 } }}
                    >
                        <MenuItem value="">All Roles</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="hr">HR</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="employee">Employee</MenuItem>
                    </TextField>
                </Box>
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <p className="text-gray-500">No users found. Create your first user!</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users
                                    .map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                {user.first_name} {user.last_name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell>{user.phone || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.is_active ? 'Active' : 'Inactive'}
                                                    color={user.is_active ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <span className="text-2xl font-bold">Create New User</span>
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Box>

                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                helperText="Minimum 8 characters"
                            />

                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />

                            <TextField
                                fullWidth
                                select
                                label="Role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <MenuItem value="employee">Employee</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="hr">HR</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={handleCloseModal} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                                '&:hover': {
                                    background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                                },
                            }}
                        >
                            Create User
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default UserManagement;
