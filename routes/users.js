const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { User, Recipe, Follow } = require('../models');
const HttpError = require('../helpers/http-error');
const uploadPic = require('../helpers/file-uploads');
const verifyAuth = require('../middleware/verifyAuth');

const maxAge = 60*60*24;


router.post('/register', upload.single('profilePic'), async (req, res, next) => {
    const newUserDraft = req.body;
    newUserDraft.profilePic = await uploadPic(req.file.path, next);
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

router.get('/:username', async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            attributes: ['username', 'id', 'firstName', 'lastName', 'profilePic', 'bio'],
            where: { username: req.params.username }
        })
        if (!user) throw new Error('no such user');
        const test = await User.findAll({ include: [Recipe, { model: User, as: 'followee_id'}]})
        res.json(test)
    } catch(err) {
        console.log(err.message);
        return next(new HttpError('Could not find user with that name', 404))
    }
})

router.get('/:userId/stats', async (req, res, next) => {
    const userId = req.params.userId;
    //get user follower count, following count, recipe count

    res.send(req.params.userId)
})


router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

router.get('/:userId/info', async (req, res) => {
    res.send(req.params.userId)
})

module.exports = router;