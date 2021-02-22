const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../config/database');
const { User, sequelize, Sequelize: { Op } } = db;
const HttpError = require('../helpers/http-error');
const { createAccessToken } = require('../helpers/jwt-helpers');
const verifyAuth = require('../middleware/verifyAuth');

router.post('/register', async (req, res, next) => {
    const newUserDraft = req.body;
    try {
        const emailTaken = await User.findOne({ 
            where: sequelize.where(
                sequelize.fn('lower', sequelize.col('email')),
                sequelize.fn('lower', newUserDraft.email)
            )
        })
        if (emailTaken) throw new HttpError('Account already exists', 400)
        const usernameTaken = await User.findOne({
            where: sequelize.where(
                sequelize.fn('lower', sequelize.col('username')),
                sequelize.fn('lower', newUserDraft.username)
            )
        })
        if (usernameTaken) throw new HttpError('This username is unavailable', 400);
    } catch (err) {
        return next(err);
    }
    
    try {
        const hash = await bcrypt.hash(newUserDraft.password, 10);
        newUserDraft.password = hash;
        const newUser = await User.create(newUserDraft);
        const accessToken = await createAccessToken(newUser.id);
        res.status(201).json({ data:
            { 
                accessToken, 
                user: { 
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    username: newUser.username,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                    bio: newUser.bio
                }
            }
        });
    } catch(err) {
        console.log('db error: ', err.message);
        next(new HttpError('Could not register account, try again later', 500));
    }
})

router.post('/login', async (req, res, next) => {
    const { emailUsername, password } = req.body;
    try {
        const user = await User.findOne({ 
            where: { [Op.or]: [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('username')),
                    sequelize.fn('lower', emailUsername)
                ), 
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('email')),
                    sequelize.fn('lower', emailUsername)
                ) 
            ]}});
        if (!user) throw new Error('User does not exist')
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('Password does not match'); 
        const accessToken = await createAccessToken(user.id);
        res.json({
            data: { 
                accessToken, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    firstName: user.firstName, 
                    lastName: user.lastName, 
                    email: user.email,
                    profilePic: user.profilePic,
                    bio: user.bio
                }
            }
        })
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
        data: {
            user: { 
                id, username, firstName, lastName, email, profilePic, bio 
            },
            accessToken: req.token
        }
    });
})

module.exports = router;