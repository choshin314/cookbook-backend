const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


function Recipe(sequelize) {
    const Recipe = sequelize.define('Recipe', {
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: true,
                len: [8, 50]
            }
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: true,
            }
        },
        intro: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: true,
                len: [50, 400]
            }
        },
        coverImg: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        servings: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                notNull: true
            }
        },
        prepTime: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                notNull: true
            }
        },
        cookTime: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                notNull: true
            }
        },
    }, 
    { 
        tableName: 'recipes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true 
    });

    Recipe.associate = function(models) {
        Recipe.belongsTo(models.User, {
            foreignKey: {
                name: 'user_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        Recipe.belongsToMany(models.User, {
            through: models.Bookmark,
            foreignKey: 'recipe_id',
            as: 'bookmarkedBy'
        });
        Recipe.belongsToMany(models.User, {
            through: models.Like,
            foreignKey: 'recipe_id',
            as: 'likedBy'
        });
        Recipe.hasMany(models.Tag, { as: 'tags', foreignKey: 'recipe_id' });
        Recipe.hasMany(models.Review, { as: 'reviews', foreignKey: 'recipe_id'});
        Recipe.hasMany(models.Ingredient, {as: 'ingredients', foreignKey: 'recipe_id'});
        Recipe.hasMany(models.Instruction, {as: 'instructions', foreignKey: 'recipe_id'});
    }
    return Recipe;
}

module.exports = Recipe;