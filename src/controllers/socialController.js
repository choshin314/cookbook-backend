const { Bookmark, Follow, Like, Notification, User, Recipe, sequelize } = require('../models');
const HttpError = require('../helpers/http-error')

//------------BOOKMARKS------------//
const getMainUserBookmarkedRecipeIds = async (req, res, next) => {
    try {
        const userId = req.user.userId
        const bookmarkIds = await Bookmark.findAll({
            attributes: ['recipeId'],
            where: { userId: userId }
        })
        const idArray = bookmarkIds.map(bookmark => bookmark.recipeId)
        res.status(200).json({data: idArray});
    } catch (err) {
        return next(err);
    }
}

const bookmarkRecipeById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const recipeId = parseInt(req.body.id);
        const newBookmark = await Bookmark.create({ userId: userId, recipeId: recipeId});
        res.json({ data: { id: newBookmark.recipeId }})
    } catch(err) {
        return next(err);
    }
}

const unbookmarkRecipeById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const recipeId = parseInt(req.params.recipeId);
        const result = await Bookmark.destroy({ where: {
            userId: userId, recipeId: recipeId 
        }});
        res.json({ data: { id: recipeId } })
    } catch(err) {
        return next(err);
    }
}

//---------------FOLLOWERS-----------//

const getMainUserFollowerIds = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const follows = await Follow.findAll({
            attributes: ['followerId'],
            where: { followeeId: userId }
        })
        const idArray = follows.map(follow => follow.followerId);
        res.status(200).json({data: idArray});
    } catch(err) {
        return next(err);
    }
}

//---------------FOLLOWING---------------//
const getMainUserFollowingIds = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const follows = await Follow.findAll({
            attributes: ['followeeId'],
            where: { followerId: userId }
        })
        const idArray = follows.map(follow => follow.followeeId);
        res.status(200).json({data: idArray});
    } catch(err) {
        return next(err);
    }
}

const followUserById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const followeeId = req.body.id;
        const { newFollowship, newNotification } = await sequelize.transaction(async (t) => {
            const newFollowship = await Follow.create({ 
                followerId: userId, followeeId: followeeId
            }, { transaction: t });

            const newNotification = await Notification.create({ 
                newFollowerId: userId, 
                recipientId: followeeId,
                category: 'follow' 
            }, { transaction: t });

            return { newFollowship, newNotification };
        });
        //send message with sockets here? 
        res.json({ data: { id: newFollowship.followeeId }})
    } catch(err) {
        return next(err);
    }
}

const unfollowUserById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const followeeId = req.params.followeeId;
        const result = await Follow.destroy({ where: {
            followerId: userId, followeeId: followeeId
        }});
        res.json({ data: { id: followeeId } })
    } catch(err) {
        return next(err);
    }
}

//----------------LIKES-----------//

const getMainUserLikedRecipeIds = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const likes = await Like.findAll({
            attributes: ['recipeId' ],
            where: { userId: userId }
        })
        const idArray = likes.map(like => like.recipeId);
        res.status(200).json({data: idArray});
    } catch(err) {
        return next(err);
    }
}

const likeRecipeById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const recipeId = parseInt(req.body.id);
        const newLike = await Like.create({ userId: userId, recipeId: recipeId});
        res.json({ data: { id: newLike.recipeId }})
    } catch(err) {
        return next(err);
    }
}

const unlikeRecipeById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const recipeId = parseInt(req.params.recipeId);
        const result = await Like.destroy({ where: {
            userId: userId, recipeId: recipeId 
        }});
        res.json({ data: { id: recipeId } })
    } catch(err) {
        return next(err);
    }
}

module.exports = {
    getMainUserBookmarkedRecipeIds,
    bookmarkRecipeById,
    unbookmarkRecipeById,
    getMainUserFollowerIds,
    getMainUserFollowingIds,
    followUserById,
    unfollowUserById,
    getMainUserLikedRecipeIds,
    likeRecipeById,
    unlikeRecipeById
}