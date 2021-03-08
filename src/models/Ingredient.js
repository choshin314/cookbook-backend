module.exports = function(sequelize, DataTypes) {
    const Ingredient = sequelize.define('Ingredient', {
        qty: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                notNull: true,
                len: [0, 10]
            }
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: true
            }
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: true,
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
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id',
                type: DataTypes.INTEGER,
                allowNull: false
            }
        });
    }

    return Ingredient;
}

