const { DataTypes } = require('sequelize');

module.exports = function(sequelize){
    const Review = sequelize.define('Review', {
        rating: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                notNull: true,
                max: 5
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, 
    { 
        tableName: 'reviews',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true 
    });

    Review.associate = function(models) {
        Review.belongsTo(models.Recipe, {
            foreignKey: {
                name: 'recipe_id',
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            }
        });
        
        Review.belongsTo(models.User, {
            foreignKey: {
                name: 'user_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
    }

    return Review;
}