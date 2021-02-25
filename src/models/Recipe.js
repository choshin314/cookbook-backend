function Recipe(sequelize, DataTypes) {
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
        underscored: true 
    });

    Recipe.associate = function(models) {
        Recipe.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                field: 'user_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            as: 'user',
            onDelete: 'CASCADE'
        });
        Recipe.belongsToMany(models.User, {
            through: models.Bookmark,
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id'
            },
            as: 'bookmarkedBy'
        });
        Recipe.belongsToMany(models.User, {
            through: models.Like,
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id'
            },
            as: 'likedBy'
        });
        Recipe.hasMany(models.Tag, { as: 'tags'});
        Recipe.hasMany(models.Review, { as: 'reviews'});
        Recipe.hasMany(models.Ingredient, {as: 'ingredients'});
        Recipe.hasMany(models.Instruction, {as: 'instructions'});
        Recipe.hasMany(models.Like, { as: 'likes' });
    }
    return Recipe;
}

module.exports = Recipe;
