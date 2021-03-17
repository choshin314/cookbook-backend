module.exports = function(sequelize, DataTypes) {
    const Ingredient = sequelize.define('ingredient', {
        qty: {
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: {
                notNull: true,
                len: [0, 30]
            }
        },
        unit: {
            type: DataTypes.STRING(30)
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: true,
                len: [3, 255]
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
            },
            onDelete: 'CASCADE'
        });
    }

    return Ingredient;
}

