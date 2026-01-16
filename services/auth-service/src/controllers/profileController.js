const Profile = require('../models/profileModel');
const AuthUser = require('../models/userModel');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const profile = await Profile.findOne({
            where: { user_id: userId },
            include: [{
                model: AuthUser,
                as: 'user',
                attributes: ['id', 'email', 'first_name', 'last_name', 'role']
            }]
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            date_of_birth,
            gender,
            address,
            city,
            state,
            country,
            postal_code,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            profile_picture_url,
            bio
        } = req.body;

        const existingProfile = await Profile.findOne({ where: { user_id: userId } });
        if (existingProfile) {
            return res.status(400).json({ message: 'Profile already exists' });
        }

        const profile = await Profile.create({
            user_id: userId,
            date_of_birth,
            gender,
            address,
            city,
            state,
            country,
            postal_code,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            profile_picture_url,
            bio
        });

        res.status(201).json({ message: 'Profile created successfully', profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            date_of_birth,
            gender,
            address,
            city,
            state,
            country,
            postal_code,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            profile_picture_url,
            bio
        } = req.body;

        let profile = await Profile.findOne({ where: { user_id: userId } });

        if (!profile) {
            // Profile not found, create new one
            profile = await Profile.create({
                user_id: userId,
                date_of_birth,
                gender,
                address,
                city,
                state,
                country,
                postal_code,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_contact_relationship,
                profile_picture_url,
                bio
            });
            return res.status(201).json({ message: 'Profile created successfully', profile });
        }

        await profile.update({
            date_of_birth,
            gender,
            address,
            city,
            state,
            country,
            postal_code,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            profile_picture_url,
            bio
        });

        res.status(200).json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await Profile.findOne({ where: { user_id: userId } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        await profile.destroy();

        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
