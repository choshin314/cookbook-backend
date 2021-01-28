const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
            isAlpha: true,
            len: [1, 30]
        }
    },
    lastName: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
            isAlpha: true,
            len: [1, 30]
        }
    },
    username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
            isAlphanumeric: true,
            len: [2, 30]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bio: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    profilePic: DataTypes.STRING
}, { 
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true 
})

User.associate = function(models) {
    User.hasMany(models.Recipe);
    User.hasMany(models.Review);
    User.belongsToMany(models.Recipe, {
        through: models.Bookmark
    });
    User.belongsToMany(models.Recipe, {
        through: models.Like
    });
    User.belongsToMany(User, {
        as: 'follower_id',
        foreignKey: 'follower_id',
        through: models.Follow
    });    
    User.belongsToMany(User, {
        as: 'followee_id',
        foreignKey: 'followee_id',
        through: models.Follow
    }); 
}


module.exports = User;