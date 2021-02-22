module.exports = function(sequelize, DataTypes){
    const Review = sequelize.define('Review', {
        rating: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                notNull: true,
                max: 5
            }
        },
        headline: {
            type: DataTypes.STRING(50),
            allowNull: true,
            validate: {
                len: [0, 50]
            }
        },
        reviewImg: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, 
    { 
        tableName: 'reviews',
        timestamps: true,
        underscored: true 
    });

    Review.associate = function(models) {
        Review.belongsTo(models.Recipe, {
            foreignKey: {
                name: 'recipeId',
                field: 'recipe_id',
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            }
        });
        
        Review.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                field: 'user_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            as: 'user',
            onDelete: 'CASCADE'
        });
    }

    return Review;
}