module.exports = function(sequelize, DataTypes) {
    const Instruction = sequelize.define('Instruction', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: true,
                len: [5]
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
        tableName: 'instructions',
        timestamps: false,
        underscored: true 
    })

    Instruction.associate = function(models) {
        Instruction.belongsTo(models.Recipe, {
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id',
                type: DataTypes.INTEGER,
                allowNull: false
            },
            onDelete: 'CASCADE'
        })
    }

    return Instruction;
}
