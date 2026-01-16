const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const AuthUser = require('./userModel');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'auth_users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    date_of_birth: {
        type: DataTypes.DATEONLY
    },
    gender: {
        type: DataTypes.ENUM('male', 'female')
    },
    address: {
        type: DataTypes.TEXT
    },
    city: {
        type: DataTypes.STRING(100)
    },
    state: {
        type: DataTypes.STRING(100)
    },
    country: {
        type: DataTypes.STRING(100)
    },
    postal_code: {
        type: DataTypes.STRING(20)
    },
    emergency_contact_name: {
        type: DataTypes.STRING(255)
    },
    emergency_contact_phone: {
        type: DataTypes.STRING(20)
    },
    emergency_contact_relationship: {
        type: DataTypes.STRING(100)
    },
    profile_picture_url: {
        type: DataTypes.STRING(500)
    },
    bio: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'profiles',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

Profile.belongsTo(AuthUser, { foreignKey: 'user_id', as: 'user' });
AuthUser.hasOne(Profile, { foreignKey: 'user_id', as: 'profile' });

module.exports = Profile;
