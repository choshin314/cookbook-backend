const { DataTypes } = require('sequelize');
const Recipe = require('./Recipe')
const User = require('./User')

module.exports = function(sequelize, models) {
    return sequelize.define('Bookmark', {
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: true,
                isInt: true
            },
            references: {
                model: models.Recipe,
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notNull: true
            },
            references: {
                model: models.User,
                key: 'id'
            }
        }
    }, { 
        tableName: 'bookmarks',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at' 
    })
}