const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});

const db = require('../config/database')
const { User, Recipe, Review, Follow, sequelize } = db;
const HttpError = require('../helpers/http-error');
const { uploadPic, deletePic } = require('../helpers/file-uploads');
const verifyAuth = require('../middleware/verifyAuth');
const validateImg = require('../middleware/validateImg');

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

//----------PROTECTED--------------//
router.use(verifyAuth)

router.patch('/account/general', async (req, res, next) => {
    const userId = req.user.userId;
    const edits = req.body;
    const { email, username, bio } = edits;
    try {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User does not exist');
        if (email) {
            const emailTaken = await User.findOne({ 
                where: sequelize.where(
                    sequelize.fn('lower', sequelize.col('email')),
                    sequelize.fn('lower', email)
                )
            })
            if (emailTaken) throw new HttpError('This email address is unavailable', 400)
        }
        if (username) {
            const usernameTaken = await User.findOne({
                where: sequelize.where(
                    sequelize.fn('lower', sequelize.col('username')),
                    sequelize.fn('lower', username)
                )
            })
            if (usernameTaken) throw new HttpError('This username is unavailable', 400)
        }
        await user.update(edits);
        res.json({data: edits });
    } catch (err) {
        return next(err);
    }
})

router.patch('/account/password', async (req, res, next) => {
    const userId = req.user.userId;
    const { oldPassword, password } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User does not exist')
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) throw new HttpError('Current password does not match', 400); 
        const newHash = await bcrypt.hash(password, 10);
        await user.update({ password: newHash });
        res.json({data: 'success'})
    } catch (err) {
        return next(err)
    }
})

router.patch('/account/profile-pic', upload.single('profilePic'), validateImg(512000), async (req, res, next) => {
    const userId = req.user.userId;
    try {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User does not exist');
        const picToOverwrite = user.profilePic;
        const newPic = await uploadPic(req.file.path);
        await user.update({ profilePic: newPic });
        if (picToOverwrite) await deletePic(picToOverwrite);
        res.json({data: { profilePic: newPic }})
    } catch (err) {
        return next(err)
    }
})

module.exports = router;