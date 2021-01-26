const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = function(models) {
    return sequelize.define('Follow', {
        followerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: true
            },
            references: {
                model: models.User,
                key: 'id'
            }
        },
        followeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: true
            },
            references: {
                model: models.User,
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
        timestamps: false,
        underscored: true 
    })
}