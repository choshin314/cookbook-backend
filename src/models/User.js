module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
        underscored: true 
    })

    User.associate = function(models) {
        User.hasMany(models.Recipe, {
            foreignKey: {
                name: 'userId',
                field: 'user_id'
            },
            as: 'userRecipes'
        });
        User.hasMany(models.Review);
        User.belongsToMany(models.Recipe, {
            through: models.Bookmark,
            foreignKey: {
                name: 'userId',
                field: 'user_id'
            },
            as: 'bookmarkedRecipes'
        });
        User.belongsToMany(models.Recipe, {
            through: models.Like,
            foreignKey: {
                name: 'userId',
                field: 'user_id'
            },
            as: 'likedRecipes'
        });
        User.belongsToMany(models.User, {
            as: 'followers',
            foreignKey: {
                name: 'followeeId',
                field: 'followee_id'
            },
            through: models.Follow
        });    
        User.belongsToMany(models.User, {
            as: 'following',
            foreignKey: {
                name: 'followerId',
                field: 'follower_id'
            },
            through: models.Follow
        }); 
    }

    return User;
}