const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = function(sequelize, models) {
    return sequelize.define('Follow', {
        follower_id: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notNull: true
            },
            references: {
                model: models.User,
                key: 'id'
            }
        },
        followee_id: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notNull: true
            },
            references: {
                model: models.User,
                key: 'id'
            }
        },
        followee_notified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, { 
        tableName: 'follows',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true 
    })
}