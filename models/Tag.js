const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
    const Tag = sequelize.define('Tag', {
        content: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                is: /^[a-zA-Z0-9-]*$/,
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
                name: 'recipe_id',
                type: DataTypes.INTEGER,
                allowNull: false
            },
            as: 'recipe'
        })
    }

    return Tag;
}

