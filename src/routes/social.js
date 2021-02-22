const express = require('express')
const router = express.Router();
const db = require('../config/database');
const { Bookmark, Follow, Like, User, Recipe } = db;
const verifyAuth = require('../middleware/verifyAuth')
const HttpError = require('../helpers/http-error')

router.use(verifyAuth)

//------------BOOKMARKS------------//
router.get('/bookmarks', async (req, res, next) => {
    try {
        const userId = req.user.userId
        const bookmarkIds = await Bookmark.findAll({
            attributes: [[ 'recipeId', 'id' ]],
            where: { userId: userId }
        })
        res.status(200).json({data: bookmarkIds});
    } catch (err) {
        return next(err);
    }
})

router.post('/bookmarks', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const recipeId = parseInt(req.body.id);
        const newBookmark = await Bookmark.create({ userId: userId, recipeId: recipeId});
        res.json({ data: { id: newBookmark.recipeId }})
    } catch(err) {
        return next(err);
    }
})

router.delete('/bookmarks/:recipeId', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        console.log(req.params);
        const recipeId = parseInt(req.params.recipeId);
        const result = await Bookmark.destroy({ where: {
            userId: userId, recipeId: recipeId 
        }});
        res.json({ data: { id: recipeId } })
    } catch(err) {
        return next(err);
    }
})

//---------------FOLLOWERS-----------//

router.get('/followers', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const followerIds = await Follow.findAll({
            attributes: [[ 'followerId', 'id' ]],
            where: { followeeId: userId }
        })
        res.status(200).json({ data: followerIds });
    } catch(err) {
        return next(err);
    }
})

//---------------FOLLOWING---------------//
router.get('/following', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const followeeIds = await Follow.findAll({
            attributes: [[ 'followeeId', 'id' ]],
            where: { followerId: userId }
        })
        res.status(200).json({ data: followeeIds });
    } catch(err) {
        return next(err);
    }
})

router.post('/following', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const followeeId = req.body.id;
        const newFollowee = await Follow.create({ followerId: userId, followeeId: followeeId});
        console.log(newFollowee);
        res.json({ data: { id: newFollowee.followeeId }})
    } catch(err) {
        return next(err);
    }
})

router.delete('/following/:followeeId', async (req, res, next) => {
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
})

//----------------LIKES-----------//

router.get('/likes', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const likes = await Like.findAll({
            attributes: [[ 'recipeId', 'id' ]],
            where: { userId: userId }
        })
        res.status(200).json({ data: likes });
    } catch(err) {
        return next(err);
    }
})


module.exports = router;