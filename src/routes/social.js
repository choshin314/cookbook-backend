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
            attributes: [[ 'recipe_id', 'id' ]],
            where: { user_id: userId }
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
        const newBookmark = await Bookmark.create({ user_id: userId, recipe_id: recipeId});
        res.json({ data: { id: newBookmark.recipe_id }})
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
            user_id: userId, recipe_id: recipeId 
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
            attributes: [[ 'follower_id', 'id' ]],
            where: { followee_id: userId }
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
            attributes: [[ 'followee_id', 'id' ]],
            where: { follower_id: userId }
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
        const newFollowee = await Follow.create({ follower_id: userId, followee_id: followeeId});
        console.log(newFollowee);
        res.json({ data: { id: newFollowee.followee_id }})
    } catch(err) {
        return next(err);
    }
})

router.delete('/following/:followeeId', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const followeeId = req.params.followeeId;
        const result = await Follow.destroy({ where: {
            follower_id: userId, followee_id: followeeId
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
            attributes: [[ 'recipe_id', 'id' ]],
            where: { user_id: userId }
        })
        res.status(200).json({ data: likes });
    } catch(err) {
        return next(err);
    }
})


module.exports = router;