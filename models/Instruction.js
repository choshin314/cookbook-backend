const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Instruction = sequelize.define('Instruction', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: true,
            len: [15]
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
        foreignKey: 'recipe_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: true,
            isInt: true
        }
    })
}

module.exports = Instruction;