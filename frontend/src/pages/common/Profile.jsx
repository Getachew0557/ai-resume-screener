import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    MenuItem,
    IconButton,
    Snackbar,
    Stack,
    Card,
    Tooltip
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Home as HomeIcon,
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    Security as SecurityIcon,
    LocationOn as LocationIcon,
    Event as EventIcon,
    Wc as GenderIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { profileAPI } from '../../services/api';
import { useEffect, useState } from 'react';

const Profile = () => {
    const user = useSelector(selectCurrentUser);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [profileExists, setProfileExists] = useState(false);

    const [formData, setFormData] = useState({
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        profile_picture_url: '',
        bio: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await profileAPI.getProfile();
            const profileData = response.data;
            if (profileData) {
                setFormData({
                    date_of_birth: profileData.date_of_birth || '',
                    gender: profileData.gender || '',
                    address: profileData.address || '',
                    city: profileData.city || '',
                    state: profileData.state || '',
                    country: profileData.country || '',
                    postal_code: profileData.postal_code || '',
                    emergency_contact_name: profileData.emergency_contact_name || '',
                    emergency_contact_phone: profileData.emergency_contact_phone || '',
                    emergency_contact_relationship: profileData.emergency_contact_relationship || '',
                    profile_picture_url: profileData.profile_picture_url || '',
                    bio: profileData.bio || ''
                });
                setProfileExists(true);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching profile:", err);
            if (err.response?.status === 404) {
                setProfileExists(false);
            } else {
                setError("Failed to load profile data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (profileExists) {
                await profileAPI.updateProfile(formData);
            } else {
                await profileAPI.createProfile(formData);
                setProfileExists(true);
            }
            setSuccess(true);
            setEditMode(false);
            setError(null);
        } catch (err) {
            console.error("Error saving profile:", err);
            setError("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
        </Box>
    );

    const SectionHeader = ({ icon: Icon, title }) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, mt: 1.5 }}>
            <Icon size={18} sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1 }}>
                {title}
            </Typography>
        </Stack>
    );

    return (
        <div className="p-4 md:p-6 w-full">
            <Card elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                {/* Compact Header */}
                <Box sx={{
                    height: 120,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    px: 4
                }}>
                    <Stack direction="row" spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                        <Avatar
                            src={formData.profile_picture_url}
                            sx={{
                                width: 90,
                                height: 90,
                                border: '3px solid white',
                                boxShadow: 3,
                                bgcolor: 'primary.main',
                                fontSize: '2.5rem'
                            }}
                        >
                            {user?.first_name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="white">
                                {user?.first_name} {user?.last_name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {user?.role}
                                </Typography>
                                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', height: 12, my: 'auto' }} />
                                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                    {user?.email}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        {!editMode ? (
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                size="small"
                                onClick={() => setEditMode(true)}
                                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f1f5f9' }, borderRadius: 2 }}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => {
                                    setEditMode(false);
                                    fetchProfile();
                                }}
                                sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 2 }}
                            >
                                Cancel
                            </Button>
                        )}
                    </Box>
                </Box>

                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Bio & Summary */}
                            <div className="lg:col-span-4">
                                <Stack spacing={3}>
                                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                                        <SectionHeader icon={PersonIcon} title="About Me" />
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={8}
                                            size="small"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            placeholder="Write a brief professional summary..."
                                            variant="outlined"
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    </Box>

                                    <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>
                                            Profile Status
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {profileExists ? "Profile is complete and up to date." : "Complete your profile to provide more information."}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </div>

                            {/* Right Column: Detailed Forms */}
                            <div className="lg:col-span-8">
                                <Stack spacing={4}>
                                    {/* Personal Info */}
                                    <Box>
                                        <SectionHeader icon={EventIcon} title="Personal Details" />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Date of Birth"
                                                name="date_of_birth"
                                                type="date"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                fullWidth
                                                select
                                                size="small"
                                                label="Gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            >
                                                <MenuItem value="male">Male</MenuItem>
                                                <MenuItem value="female">Female</MenuItem>
                                            </TextField>
                                        </div>
                                    </Box>

                                    <Divider />

                                    {/* Contact Information */}
                                    <Box>
                                        <SectionHeader icon={LocationIcon} title="Contact Information" />
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                            <div className="sm:col-span-12">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Residential Address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div className="sm:col-span-12 md:col-span-3">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="City"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div className="sm:col-span-12 md:col-span-3">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="State"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div className="sm:col-span-6 md:col-span-3">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Country"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div className="sm:col-span-6 md:col-span-3">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Zip Code"
                                                    name="postal_code"
                                                    value={formData.postal_code}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                        </div>
                                    </Box>

                                    <Divider />

                                    {/* Emergency Contact */}
                                    <Box>
                                        <SectionHeader icon={SecurityIcon} title="Emergency Contact" />
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                            <div className="sm:col-span-12 md:col-span-5">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Full Name"
                                                    name="emergency_contact_name"
                                                    value={formData.emergency_contact_name}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div className="sm:col-span-12 md:col-span-4">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Phone"
                                                    name="emergency_contact_phone"
                                                    value={formData.emergency_contact_phone}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                    InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.disabled', fontSize: '1rem' }} /> }}
                                                />
                                            </div>
                                            <div className="sm:col-span-12 md:col-span-3">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Relationship"
                                                    name="emergency_contact_relationship"
                                                    value={formData.emergency_contact_relationship}
                                                    onChange={handleChange}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                        </div>
                                    </Box>

                                    {editMode && (
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={saving}
                                                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                                sx={{
                                                    borderRadius: 2,
                                                    px: 4,
                                                    py: 1,
                                                    fontWeight: 'bold',
                                                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                                    '&:hover': { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }
                                                }}
                                            >
                                                {saving ? 'Saving...' : 'Save Profile'}
                                            </Button>
                                        </Box>
                                    )}
                                </Stack>
                            </div>
                        </div>
                    </form>
                </Box>
            </Card>

            <Snackbar
                open={success}
                autoHideDuration={4000}
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%', borderRadius: 3 }}>
                    Profile updated successfully!
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Profile;
