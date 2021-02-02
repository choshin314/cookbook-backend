const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../config/database');
const { User, Sequelize: { Op } } = db;
const HttpError = require('../helpers/http-error');
const { createAccessToken } = require('../helpers/jwt-helpers');
const verifyAuth = require('../middleware/verifyAuth');


router.post('/register', async (req, res, next) => {
    const newUserDraft = req.body;
    const existingUser = await User.findOne({ where: { email: newUserDraft.email }});
    if(existingUser) return next(new HttpError('User already exists', 400));

    bcrypt.hash(newUserDraft.password, 10, (err, hash) => {
        if(hash) newUserDraft.password = hash;
        if(err) return next(new HttpError('Could not register account', 500));
    });

    try {
        const newUser = await User.create(newUserDraft);
        const accessToken = await createAccessToken(newUser.id);
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
    const { emailUsername, password } = req.body;
    let user;
    try {
        user = await User.findOne({ 
            where: { [Op.or]: [
                { username: emailUsername }, 
                { email: emailUsername } 
            ]}});
        if (!user) throw new Error('User does not exist')
    } catch (err) {
        console.log(err.message)
        return next(new HttpError(err.message, 404))
    }
    try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('Password does not match'); 
        const accessToken = await createAccessToken(user.id);
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

router.get('/user', verifyAuth, async (req, res, next) => {
    const {
        id, username, firstName, lastName, email, profilePic, bio
    } = await User.findByPk(req.user.userId);
    res.json({
        user: { id, username, firstName, lastName, email, profilePic, bio },
        accessToken: req.token
    });
})

module.exports = router;