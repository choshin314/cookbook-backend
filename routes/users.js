const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { User, Recipe, Follow } = require('../models');
const HttpError = require('../helpers/http-error');
const uploadPic = require('../helpers/file-uploads');
const verifyAuth = require('../middleware/verifyAuth');

const maxAge = 60*60*24;


router.post('/register', fileUpload({useTempFiles: true}), async (req, res, next) => {
    const newUserDraft = req.body;
    newUserDraft.profilePic = await uploadPic(req.files.profilePic.tempFilePath, next);
    newUserDraft.password = await bcrypt.hash(newUserDraft.password, 10);
    try {
        const newUser = await User.create(newUserDraft);
        const accessToken = await jwt.sign({ userId: newUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: maxAge });
        res.status(201).json({ accessToken, user: { 
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            profilePic: newUser.profilePic,
            bio: newUser.bio
        }});
    } catch(err) {
        console.log('db error: ', err.message);
        next(new HttpError('Could not register account, try again later', 500));
    }
})

router.post('/login', async (req, res, next) => {
    const { username, email, password } = req.body;
    let user;
    try {
        user = await User.findOne({ where: { username: username }});
        if (!user) throw new Error('uh oh')
    } catch (err) {
        console.log(err.message)
        return next(new HttpError(err.message, 401))
    }
    try {
        const result = await bcrypt.compare(password, user.password);
        const accessToken = await jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: maxAge});
        res.json({ accessToken, user: { 
            id: user.id, 
            username: user.username, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email,
            profilePic: user.profilePic,
            bio: user.bio
        }})
    } catch (err) {
        console.log(err.message);
        return next(new HttpError('Invalid credentials or user does not exist', 401))
    }
})

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