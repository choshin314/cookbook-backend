const { DataTypes } = require('sequelize');

module.exports = function(sequelize, models) {
    return sequelize.define('Like', {
        recipe_id: {
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
        user_id: {
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
        tableName: 'likes',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at' 
    })
}