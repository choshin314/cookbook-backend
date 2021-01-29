const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ingredient = sequelize.define('Ingredient', {
    qty: {
        type: DataTypes.REAL,
        allowNull: false,
        validate: {
            notNull: true,
            isFloat: true
        }
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: true,
            isAlpha: true
        }
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: true,
            isAlpha: true,
            len: [3]
        }
    },
    position: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
            notNull: true,
            isInt: true
        }
    }
}, { 
    tableName: 'ingredients',
    timestamps: false,
    underscored: true 
});

Ingredient.associate = function(models) {
    Ingredient.belongsTo(models.Recipe, {
        foreignKey: 'recipe_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: true,
            isInt: true
        }
    });
}

module.exports = Ingredient;
