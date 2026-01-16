import { useState, useEffect } from 'react';
import {
    Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Chip, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { jobCategoryAPI } from '../../services/api';

const JobCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    // State for Modal Control
    const [openModal, setOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        jobCategoryName: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await jobCategoryAPI.getJobCategories();
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch job categories.');
        } finally {
            setLoading(false);
        }
    };

    // --- Action Handlers ---

    const handleOpenModal = (category = null) => {
        if (category) {
            setIsEdit(true);
            setSelectedId(category.id);
            setFormData({
                jobCategoryName: category.jobCategoryName || '',
                description: category.description || '',
            });
        } else {
            setIsEdit(false);
            setSelectedId(null);
            setFormData({ jobCategoryName: '', description: '' });
        }
        setOpenModal(true);
        setError('');
        setSuccess('');
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({ jobCategoryName: '', description: '' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job category?')) {
            try {
                await jobCategoryAPI.deleteJobCategory(id);
                fetchCategories(); // Refresh list
            } catch (err) {
                setError('Failed to delete job category.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isEdit) {
                await jobCategoryAPI.updateJobCategory(selectedId, formData);
                setSuccess('Category updated successfully!');
            } else {
                await jobCategoryAPI.createJobCategory(formData);
                setSuccess('Category created successfully!');
            }

            setTimeout(() => {
                handleCloseModal();
                fetchCategories();
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    // --- Table Helpers ---

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredCategories = categories.filter(cat =>
        cat.jobCategoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Job Categories</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Manage organizational classifications</p>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{
                        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                        px: 3, borderRadius: 2
                    }}
                >
                    Add Category
                </Button>
            </div>

            {/* Search Bar */}
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mb: 2, p: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
                            ) : filteredCategories.length === 0 ? (
                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}>No categories found.</TableCell></TableRow>
                            ) : (
                                filteredCategories
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((category) => (
                                        <TableRow key={category.id} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{category.jobCategoryName}</TableCell>
                                            <TableCell>{category.description || '-'}</TableCell>
                                            <TableCell align="right">
                                                {/* FIXED: Added onClick handlers here */}
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenModal(category)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(category.id)}
                                                >
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
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredCategories.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {isEdit ? 'Edit Job Category' : 'New Job Category'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                fullWidth
                                label="Category Name"
                                value={formData.jobCategoryName}
                                onChange={(e) => setFormData({ ...formData, jobCategoryName: e.target.value })}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}>
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default JobCategoryManagement;