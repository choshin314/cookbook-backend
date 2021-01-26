const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
    content: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
            isAlpha: true,
            notNull: true,
            len: [4, 16]
        }
    }
}, { 
    tableName: 'tags',
    timestamps: false,
    underscored: true 
})

Tag.associate = function (models) {
    Tag.belongsToMany(models.Recipe, {
        through:'recipes_tags'
    })
}

module.exports = Tag;
