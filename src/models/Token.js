module.exports = function(sequelize, DataTypes) {
    const Token = sequelize.define('Token', {
        refreshKey: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, { 
        tableName: 'tokens',
        timestamps: false,
        underscored: true 
    })

    Token.associate = function (models) {
        Token.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                field: 'user_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            as: 'user',
            onDelete: 'CASCADE'
        })
    }

    return Token;
}