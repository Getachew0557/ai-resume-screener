import { useState, useEffect } from 'react';
import {
    Box, Button, Paper, TextField, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { AccountTree as TreeIcon, Save as SaveIcon, ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { organizationAPI } from '../../services/api';
import DepartementTree from './DepartementTree';

const ChangeStructureManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentDeptId = location.state?.id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openTreeModal, setOpenTreeModal] = useState(false);

    // Initial state: id is null, but we track if a selection has actually been made
    const [selectedParent, setSelectedParent] = useState({ id: null, name: '', hasSelected: false });
    const [formData, setFormData] = useState({ departmentName: '', parentDepartmentName: '' });

    useEffect(() => {
        if (currentDeptId) {
            fetchDepartmentDetails();
        } else {
            setError("No department selected.");
        }
    }, [currentDeptId]);

    const fetchDepartmentDetails = async () => {
        try {
            setLoading(true);
            const response = await organizationAPI.getDepartments();
            const dept = response.data.find(d => Number(d.id) === Number(currentDeptId));

            if (dept) {
                setFormData({
                    departmentName: dept.departmentName || '',
                    parentDepartmentName: dept.parentDepartment?.departmentName || 'Root (Top Level)'
                });
            }
        } catch (err) {
            setError('Failed to fetch details.');
        } finally {
            setLoading(false);
        }
    };

    const handleNodeSelect = (id, name) => {
        if (id && Number(id) === Number(currentDeptId)) {
            setError("Validation Error: A department cannot be its own parent.");
            return;
        }
        setError('');
        setSelectedParent({ id, name, hasSelected: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // The 500 error is often here. Ensure your backend accepts null for parentDepartmentId
            await organizationAPI.updateDepartment(currentDeptId, {
                departmentName: formData.departmentName,
                parentDepartmentId: selectedParent.id // null means move to Root
            });

            setSuccess('Structure updated successfully!');
            setTimeout(() => navigate(-1), 1500);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Server error (500)';
            setError(`Update failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="p-4 md:p-6">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 4 }}>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Change Organization Structure</h1>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField fullWidth label="Department to Move" value={formData.departmentName} disabled variant="filled" />
                            <TextField fullWidth label="Current Parent" value={formData.parentDepartmentName} disabled variant="filled" />
                        </div>

                        <Divider>Select New Hierarchy Location</Divider>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <TextField
                                fullWidth
                                label="New Parent Department"
                                value={selectedParent.name}
                                placeholder="Click 'Open Tree' to select..."
                                InputProps={{ readOnly: true }}
                                required
                                helperText="Selection is required to save changes"
                            />
                            <Button
                                variant="outlined"
                                startIcon={<TreeIcon />}
                                onClick={() => setOpenTreeModal(true)}
                                sx={{ height: '56px', minWidth: '160px' }}
                            >
                                Open Tree
                            </Button>
                        </div>

                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={loading || !selectedParent.hasSelected}
                                sx={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', px: 4 }}
                            >
                                {loading ? 'Saving...' : 'Confirm Move'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>

            <Dialog open={openTreeModal} onClose={() => setOpenTreeModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Select New Parent</DialogTitle>
                <DialogContent dividers>
                    <DepartementTree onNodeSelect={handleNodeSelect} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenTreeModal(false)}>Cancel</Button>
                    <Button
                        onClick={() => setOpenTreeModal(false)}
                        variant="contained"
                        disabled={!selectedParent.hasSelected}
                    >
                        Apply Selection
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChangeStructureManagement;