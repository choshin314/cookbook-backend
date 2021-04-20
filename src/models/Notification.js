const { FEED_LIMIT } = require('../constants/index');

module.exports = function(sequelize, DataTypes) {
    const Notification = sequelize.define('notification', {
        checked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        category: {
            type: DataTypes.STRING(20),
            allowNull: false
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

    Notification.findNested = async function (options={}, transactionObject) {
        const { recipientId, notificationId, offsetId } = options;
        const getWhereClause = () => {
            if (recipientId && offsetId) {
                return `
                    WHERE n.recipient_id = '${recipientId}' AND n.id < ${offsetId}
                    ORDER BY n.created_at DESC
                    LIMIT ${FEED_LIMIT};
                `
            } else if (recipientId) {
                return `
                    WHERE n.recipient_id = '${recipientId}' 
                    ORDER BY n.created_at DESC
                    LIMIT ${FEED_LIMIT};
                `
            } else if (notificationId) {
                return `
                    WHERE n.id = ${notificationId};
                `
            } else {
                return `
                    ORDER BY n.created_at DESC
                    LIMIT ${FEED_LIMIT};
                `
            }
        }
        const joined = await sequelize.query(`
            SELECT
                n.id,
                n.checked,
                n.category,
                n.recipient_id "recipientId",
                n.new_review_id "newReviewId",
                n.new_review_id "review.id",
                n.new_follower_id "newFollowerId",
                n.new_follower_id "follower.id",
                n.created_at "createdAt",
                followers.username "follower.username",
                reviews.rating "review.rating",
                reviewers.username "review.reviewer.username",
                reviewers.id "review.reviewer.id",
                recipes.id "review.recipe.id",
                recipes.title "review.recipe.title",
                recipes.slug "review.recipe.slug"
            FROM notifications n
            LEFT JOIN users followers ON n.new_follower_id = followers.id
            LEFT JOIN reviews ON n.new_review_id = reviews.id
            LEFT JOIN users reviewers ON reviews.user_id = reviewers.id
            LEFT JOIN recipes ON reviews.recipe_id = recipes.id
            ${getWhereClause()}
        `, { raw: true, nest: true, ...transactionObject })

        return notificationId ? joined[0] : joined; //return single object or array
    }

    Notification.notify = async (id, transaction) => {
        const notificationObject = await Notification.findNested({ notificationId: id }, transaction);
        await sequelize.query(`NOTIFY "new_notification", :payload`, { 
            replacements: { payload: JSON.stringify(notificationObject)},
            ...transaction
        })
    }

    return Notification;
}