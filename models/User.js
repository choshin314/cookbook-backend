const { Sequelize, DataTypes } = require('sequelize');

module.exports = function(sequelize) {
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
        User.hasMany(models.Recipe, {
            foreignKey: 'user_id',
            as: 'userRecipes'
        });
        User.hasMany(models.Review);
        User.belongsToMany(models.Recipe, {
            through: models.Bookmark,
            foreignKey: 'user_id',
            as: 'bookmarkedRecipes'
        });
        User.belongsToMany(models.Recipe, {
            through: models.Like,
            foreignKey: 'user_id',
            as: 'likedRecipes'
        });
        User.belongsToMany(User, {
            as: 'followers',
            foreignKey: 'followee_id',
            through: models.Follow
        });    
        User.belongsToMany(User, {
            as: 'following',
            foreignKey: 'follower_id',
            through: models.Follow
        }); 
    }

    return User;
}