module.exports = function(sequelize, DataTypes) {
    const Like = sequelize.define('Like', {
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
        tableName: 'likes',
        underscored: true,
        timestamps: true
    })

    Like.associate = function(models) {
        Like.belongsTo(models.Recipe, {
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id'
            },
            onDelete: 'CASCADE'
        });
        Like.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                field: 'user_id'
            },
            onDelete: 'CASCADE'
        });  
    }

    return Like;
}