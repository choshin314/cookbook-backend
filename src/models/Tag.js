module.exports = function(sequelize, DataTypes) {
    const Tag = sequelize.define('Tag', {
        content: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notNull: true,
                len: [3, 20]
            }
        }
    }, { 
        tableName: 'tags',
        timestamps: false,
        underscored: true 
    })

    Tag.associate = function (models) {
        Tag.belongsTo(models.Recipe, {
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id',
                type: DataTypes.INTEGER,
                allowNull: false
            },
            as: 'recipe'
        })
    }

    return Tag;
}

