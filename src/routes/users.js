const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database')
const { User, Recipe, Review, Follow, sequelize } = db;
const HttpError = require('../helpers/http-error');
const uploadPic = require('../helpers/file-uploads');
const verifyAuth = require('../middleware/verifyAuth');

router.get('/:username', async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            attributes: ['username', 'id', 'firstName', 'lastName', 'profilePic', 'bio'],
            where: { username: req.params.username }
        })
        if (!user) throw new HttpError('Could not find resource', 404)
        res.json({ data: user })
    } catch(err) {
        console.log(err.message);
        return next(err);
    }
})

router.get('/:username/stats', async (req, res, next) => {
    const username = req.params.username;
    //get user follower count, following count, recipe count
    try {
        const stats = {};
        const user = await User.findOne({ 
            attributes: ['username'],
            include: [
                { model: Recipe, as: 'userRecipes', attributes: ['id'] }, 
                { model: User, as: 'followers', attributes: ['username'] }, 
                { model: User, as: 'following', attributes: ['username'] }
            ],
            where: { username: username }
        });
        if (!user) throw new HttpError('Could not find resource', 404);
        stats.recipeCount = user.userRecipes.length;
        stats.followerCount = user.followers.length;
        stats.followingCount = user.following.length;
        
        res.json({ data: stats })
    } catch(err) {
        console.log(err.message);
        return next(err);
    }
})

//-------------Get a given user's Followers/Following---------------//

router.get('/:username/followers', async (req, res, next) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({ 
            attributes: ['username'],
            include: [
                { model: User, as: 'followers', attributes: [
                    'username', 'id', 'firstName', 'lastName', 'profilePic'
                ] }
            ],
            where: { username: username }
        });
        if (!user) throw new HttpError('Could not find resource', 404);
        const followers = user.followers;
        res.json({ data: followers })
    } catch(err) {
        console.log(err.message);
        return next(err);
    }
})

router.get('/:username/following', async (req, res, next) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ 
            attributes: ['username'],
            include: [
                { model: User, as: 'following', attributes: [
                    'username', 'id', 'firstName', 'lastName', 'profilePic'
                ] }
            ],
            where: { username: username }
        });
        if (!user) throw new HttpError('Could not find resource', 404);
        const following = user.following;
        res.json({ data: following })
    } catch(err) {
        console.log(err.message);
        return next(err);
    }
})

module.exports = router;