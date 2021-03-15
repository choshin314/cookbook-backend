const { DataTypes } = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    const Bookmark = sequelize.define('Bookmark', {
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: true,
                isInt: true
            },
            references: {
                model: 'Recipe',
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
                model: 'User',
                key: 'id'
            }
        }
    }, { 
        tableName: 'bookmarks',
        underscored: true,
        timestamps: true
    })

    Bookmark.associate = function(models) {
        Bookmark.belongsTo(models.Recipe, {
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id'
            },
            as: 'recipe',
            onDelete: 'CASCADE'
        });
        Bookmark.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                field: 'user_id'
            },
            as: 'user',
            onDelete: 'CASCADE'
        })
    }

    return Bookmark
}