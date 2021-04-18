module.exports = function(sequelize, DataTypes) {
    const Notification = sequelize.define('notification', {
        checked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, { 
        tableName: 'notifications',
        timestamps: true,
        underscored: true 
    })

    Notification.associate = function(models) {
        Notification.belongsTo(models.User, {
            foreignKey: {
                name: 'recipientId',
                field: 'recipient_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            as: 'recipient',
            onDelete: 'CASCADE'
        });
        Notification.belongsTo(models.User, {
            foreignKey: {
                name: 'newFollowerId',
                field: 'new_follower_id',
                type: DataTypes.UUID
            },
            as: 'newFollower',
            onDelete: 'CASCADE'
        });
        Notification.belongsTo(models.Review, {
            foreignKey: {
                name: 'newReviewId',
                field: 'new_review_id',
                type: DataTypes.INTEGER
            },
            as: 'newReview'
        });
    }

    return Notification;
}