const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
    content: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
            is: /^[a-zA-Z0-9_]*$/,
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

module.exports = Tag;
