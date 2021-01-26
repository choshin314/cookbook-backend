const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
            notNull: true,
            max: 10
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
            type: DataTypes.INTEGER,
            allowNull: false
        },
        onDelete: 'CASCADE'
    });
    Recipe.belongsToMany(models.User, {
        through: models.Bookmark
    });
    Recipe.belongsToMany(models.User, {
        through: models.Like
    });
    Recipe.belongsToMany(models.Tag, {
        through: 'recipes_tags'
    });
    Recipe.hasMany(models.Review);
    Recipe.hasMany(models.Ingredient);
    Recipe.hasMany(models.Instruction);
}

module.exports = Recipe;
