const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database')
const { User, Recipe, Review, Follow, sequelize } = db;
const HttpError = require('../helpers/http-error');
const uploadPic = require('../helpers/file-uploads');
const verifyAuth = require('../middleware/verifyAuth');

const maxAge = 60*60*24;




router.get('/:username', async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            attributes: ['username', 'id', 'firstName', 'lastName', 'profilePic', 'bio'],
            include: [
                { model: Recipe, as: 'userRecipes' }, 
                { model: Recipe, as: 'bookmarkedRecipes' },
                { model: User, as: 'followers', attributes: ['username'] }, 
                { model: User, as: 'following', attributes: ['username'] }
            ],
            where: { username: req.params.username }
        })
        console.log(user)
        res.json(user)
    } catch(err) {
        console.log(err.message);
        return next(new HttpError('Could not find user with that name', 404))
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
        
        stats.recipeCount = user.userRecipes.length;
        stats.followerCount = user.followers.length;
        stats.followingCount = user.following.length;
        
        res.json(stats)
    } catch(err) {
        console.log(err.message);
        return next(new HttpError('Could not find stats', 404))
    }
})


router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

module.exports = router;