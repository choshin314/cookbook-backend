module.exports = function(sequelize, DataTypes) {
    const Follow = sequelize.define('Follow', {
        followerId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notNull: true
            },
            references: {
                model: "User",
                key: 'id'
            }
        },
        followeeId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notNull: true
            },
            references: {
                model: "User",
                key: 'id'
            }
        },
        followeeNotified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, { 
        tableName: 'follows',
        timestamps: true,
        underscored: true 
    })

    Follow.associate = function(models) {
        Follow.belongsTo(models.User, {
            foreignKey: {
                name: 'followerId',
                field: 'follower_id'
            }
        });
        Follow.belongsTo(models.User, {
            foreignKey: {
                name: 'followeeId',
                field: 'followee_id'
            }
        })
    }

    return Follow
}